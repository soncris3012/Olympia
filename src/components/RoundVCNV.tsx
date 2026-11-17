'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Obstacle, ObstacleRow } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { HelpCircle, Bell, ArrowRight, Eye, CheckCircle2, XCircle, Award, Shuffle } from 'lucide-react';

interface RoundVCNVProps {
  obstacles: Obstacle[];
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundVCNV({ obstacles, onComplete, onScoreUpdate }: RoundVCNVProps) {
  const [selectedObsIndex, setSelectedObsIndex] = useState(0);

  const obstacleList = obstacles.length > 0 ? obstacles : [
    {
      id: 'obs-1',
      title: 'VCNV: ĐỒ SƠN',
      keyword: 'ĐỒ SƠN',
      char_count: 5,
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      rows: [
        { row: 1, char_count: 6, question: 'Tên vị hoàng đế cuối cùng của triều đại phong kiến Việt Nam?', answer: 'BẢO ĐẠI' },
        { row: 2, char_count: 4, question: 'Lễ hội truyền thống độc đáo tổ chức vào mùng 9 tháng 8 âm lịch tại Hải Phòng là lễ hội chọi gì?', answer: 'TRÂU' },
        { row: 3, char_count: 6, question: 'Ngọn hải đăng cổ kính hơn 100 năm tuổi mệnh danh là "Mắt ngọc của Tổ quốc" nằm trên hòn đảo nào?', answer: 'HÒN DẤU' },
        { row: 4, char_count: 4, question: 'Bến tàu K15 tại nơi đây là điểm xuất phát huyền thoại của đoàn tàu không số trên...?', answer: 'BIỂN' },
      ],
      center_clue: {
        question: 'Bán đảo du lịch ven biển nổi tiếng của thành phố Hải Phòng là gì?',
        answer: 'ĐỒ SƠN'
      }
    }
  ];

  const obstacle = obstacleList[selectedObsIndex % obstacleList.length];

  const [activeRow, setActiveRow] = useState<ObstacleRow | null>(null);
  const [revealedPieces, setRevealedPieces] = useState<number[]>([]); // 1..4 (corners), 5 (center)
  const [rowAnswers, setRowAnswers] = useState<Record<number, string>>({});
  const [inputAnswer, setInputAnswer] = useState('');
  const [timer, setTimer] = useState<number>(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // CNV Buzz state
  const [isBuzzModalOpen, setIsBuzzModalOpen] = useState(false);
  const [cnvGuess, setCnvGuess] = useState('');
  const [isCnvSolved, setIsCnvSolved] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    soundManager.play('/audio/vcnv/StartRound.mp3');
  }, []);

  // Row timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;

    soundManager.play15Seconds();
    setTimer(15);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          handleRowTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, activeRow]);

  const cleanString = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const checkMatch = (input: string, target: string): boolean => {
    const cInput = cleanString(input);
    const cTarget = cleanString(target);
    if (!cInput) return false;
    if (cInput === cTarget || cTarget.includes(cInput) || cInput.includes(cTarget)) return true;

    const parts = target.split(/[\/,\(\)]/).map((p) => cleanString(p)).filter((p) => p.length > 1);
    for (const p of parts) {
      if (p === cInput || p.includes(cInput) || cInput.includes(p)) return true;
    }
    return false;
  };

  const handleSelectRow = (row: ObstacleRow) => {
    if (revealedPieces.includes(row.row) || isTimerRunning || isCnvSolved) return;
    setActiveRow(row);
    setInputAnswer('');
    setIsTimerRunning(true);
    setMessage(null);
  };

  const handleRowTimeout = () => {
    soundManager.playWrong();
    setMessage({
      text: `Hết giờ! Đáp án hàng ngang số ${activeRow?.row}: ${activeRow?.answer}`,
      type: 'error'
    });
    setActiveRow(null);
  };

  const handleRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRow) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);

    const isMatch = checkMatch(inputAnswer, activeRow.answer);

    if (isMatch) {
      soundManager.play('/audio/vcnv/CorrectRow.mp3');
      setTimeout(() => soundManager.playPictureReveal(), 800);
      setRevealedPieces((prev) => [...prev, activeRow.row]);
      setRowAnswers((prev) => ({ ...prev, [activeRow.row]: activeRow.answer }));
      setEarnedPoints((prev) => prev + 10);
      onScoreUpdate(10);
      setMessage({
        text: `CHÍNH XÁC! Hàng ngang ${activeRow.row} (+10 điểm) đã được mở!`,
        type: 'success'
      });
    } else {
      soundManager.play('/audio/vcnv/WrongRow.mp3');
      setMessage({
        text: `Chưa chính xác! Đáp án hàng ngang ${activeRow.row}: ${activeRow.answer}`,
        type: 'error'
      });
    }

    setActiveRow(null);
  };

  const handleBuzzCNV = () => {
    if (isEliminated || isCnvSolved) return;
    soundManager.playBuzzer();
    setIsBuzzModalOpen(true);
  };

  const handleCnvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBuzzModalOpen(false);

    const isMatch = checkMatch(cnvGuess, obstacle.keyword);

    if (isMatch) {
      const revealedCount = revealedPieces.length;
      let points = 60;
      if (revealedCount === 1) points = 50;
      else if (revealedCount === 2) points = 40;
      else if (revealedCount === 3) points = 30;
      else if (revealedCount >= 4) points = 20;

      soundManager.playCorrectObstacle();
      setEarnedPoints((prev) => prev + points);
      onScoreUpdate(points);
      setIsCnvSolved(true);
      setRevealedPieces([1, 2, 3, 4, 5]); // Reveal all
      setMessage({
        text: `XUẤT SẮC! BẠN ĐÃ GIẢI ĐƯỢC CHƯỚNG NGẠI VẬT: "${obstacle.keyword}" (+${points} điểm)!`,
        type: 'success'
      });
    } else {
      soundManager.playWrong();
      setIsEliminated(true);
      setMessage({
        text: `Rất tiếc! Câu trả lời "${cnvGuess}" không chính xác. Bạn đã bị loại khỏi phần thi VCNV.`,
        type: 'error'
      });
    }
  };

  const handleSwitchObstacle = () => {
    setSelectedObsIndex((prev) => (prev + 1) % obstacleList.length);
    setRevealedPieces([]);
    setRowAnswers({});
    setActiveRow(null);
    setIsCnvSolved(false);
    setIsEliminated(false);
    setMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900/80 px-5 py-3 rounded-xl border border-amber-500/20 shadow-md gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-md uppercase border border-amber-500/30">
            Vòng 2: Vượt Chướng Ngại Vật
          </span>
          <span className="text-xs text-slate-300">
            Từ khóa gồm: <strong className="text-amber-400">{obstacle.char_count} chữ cái</strong>
          </span>
          {obstacleList.length > 1 && !isCnvSolved && revealedPieces.length === 0 && (
            <button
              onClick={handleSwitchObstacle}
              className="text-[11px] text-slate-400 hover:text-amber-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              <span>Đổi Đề Khác</span>
            </button>
          )}
        </div>

        {/* Buzzer Button */}
        {!isCnvSolved && !isEliminated && (
          <button
            onClick={handleBuzzCNV}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 buzzer-active"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Trả Lời CNV</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Main Grid: Rows on Left, Image with 4 Corners on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: 4 Rows */}
        <div className="md:col-span-7 space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
            Danh sách hàng ngang:
          </h4>

          {obstacle.rows.map((row) => {
            const isRevealed = revealedPieces.includes(row.row);
            const isSelected = activeRow?.row === row.row;

            return (
              <div
                key={row.row}
                onClick={() => handleSelectRow(row)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isRevealed
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 glow-gold scale-[1.01]'
                    : 'bg-slate-900/70 border-slate-700/60 hover:border-slate-500 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                      {row.row}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      ({row.char_count} chữ cái)
                    </span>
                  </div>
                  {isRevealed && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ĐÃ MỞ
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium mt-1">
                  {row.question}
                </p>

                {isRevealed && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Đáp án:</span>
                    <span className="text-sm font-extrabold tracking-widest text-yellow-300 uppercase">
                      {row.answer}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Picture Mosaic (4 Corners + 1 Center) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
            Mảnh ghép hình ảnh:
          </h4>

          <div className="relative w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-slate-950">
            {/* Background Image */}
            <img
              src={obstacle.image_url}
              alt="Chướng ngại vật"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Corner Piece 1 (Top-Left) */}
            <div className={`absolute top-0 left-0 w-1/2 h-1/2 border-r border-b border-amber-500/30 flex items-center justify-center font-black text-2xl transition-all duration-700 ${
              revealedPieces.includes(1) ? 'opacity-0 pointer-events-none' : 'bg-slate-900/95 text-amber-400/80 backdrop-blur-md'
            }`}>
              1
            </div>

            {/* Corner Piece 2 (Top-Right) */}
            <div className={`absolute top-0 right-0 w-1/2 h-1/2 border-b border-amber-500/30 flex items-center justify-center font-black text-2xl transition-all duration-700 ${
              revealedPieces.includes(2) ? 'opacity-0 pointer-events-none' : 'bg-slate-900/95 text-amber-400/80 backdrop-blur-md'
            }`}>
              2
            </div>

            {/* Corner Piece 3 (Bottom-Left) */}
            <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 border-r border-amber-500/30 flex items-center justify-center font-black text-2xl transition-all duration-700 ${
              revealedPieces.includes(3) ? 'opacity-0 pointer-events-none' : 'bg-slate-900/95 text-amber-400/80 backdrop-blur-md'
            }`}>
              3
            </div>

            {/* Corner Piece 4 (Bottom-Right) */}
            <div className={`absolute bottom-0 right-0 w-1/2 h-1/2 flex items-center justify-center font-black text-2xl transition-all duration-700 ${
              revealedPieces.includes(4) ? 'opacity-0 pointer-events-none' : 'bg-slate-900/95 text-amber-400/80 backdrop-blur-md'
            }`}>
              4
            </div>

            {/* Center Piece (Piece 5) */}
            <div className={`absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full border-2 border-amber-400/50 flex items-center justify-center font-black text-xl transition-all duration-700 shadow-xl ${
              revealedPieces.includes(5) || isCnvSolved ? 'opacity-0 pointer-events-none' : 'bg-[#0b173d]/95 text-yellow-300'
            }`}>
              TÂM
            </div>
          </div>

          {/* Keyword Length Display */}
          <div className="mt-4 flex gap-1.5 justify-center flex-wrap">
            {obstacle.keyword.replace(/\s+/g, '').split('').map((char, i) => (
              <div
                key={i}
                className="w-8 h-9 rounded-lg bg-slate-900 border border-amber-500/40 flex items-center justify-center text-base font-black text-amber-400 shadow"
              >
                {isCnvSolved ? char : '?'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row Answer Input bar when row selected */}
      {activeRow && isTimerRunning && (
        <div className="olympia-card p-5 rounded-xl border-amber-500/50 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-400 font-bold uppercase">
              Đang trả lời Hàng Ngang {activeRow.row} ({activeRow.char_count} chữ cái)
            </span>
            <span className="text-lg font-mono font-black text-amber-400 animate-pulse">
              ⏱ {timer}s
            </span>
          </div>

          <form onSubmit={handleRowSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="Gõ đáp án hàng ngang (nhấn Enter)..."
              autoFocus
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-400 text-slate-100 px-4 py-2.5 rounded-xl outline-none uppercase font-bold"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold rounded-xl shadow-md hover:from-amber-400 hover:to-yellow-400 transition-all"
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      {/* Next Round Button when completed */}
      {(isCnvSolved || revealedPieces.length >= 4 || isEliminated) && (
        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => onComplete(earnedPoints)}
            className="py-3 px-8 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all inline-flex items-center gap-2"
          >
            <span>Tiến Vào Vòng Tăng Tốc</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* CNV Buzz Modal */}
      {isBuzzModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="olympia-card max-w-md w-full p-6 rounded-2xl border-rose-500/50 glow-red">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/40">
                <Bell className="w-6 h-6 text-rose-400 animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-rose-300 uppercase">
                  Đoán Từ Khóa Chướng Ngại Vật
                </h3>
                <p className="text-xs text-slate-400">
                  Cảnh báo: Nếu sai, bạn sẽ bị loại khỏi vòng thi!
                </p>
              </div>
            </div>

            <form onSubmit={handleCnvSubmit} className="space-y-4">
              <input
                type="text"
                value={cnvGuess}
                onChange={(e) => setCnvGuess(e.target.value)}
                placeholder={`Từ khóa gồm ${obstacle.char_count} chữ cái...`}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 text-slate-100 px-4 py-3 rounded-xl outline-none text-base uppercase font-bold tracking-wider"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!cnvGuess.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  Xác Nhận Đáp Án
                </button>
                <button
                  type="button"
                  onClick={() => setIsBuzzModalOpen(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-sm font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Obstacle, ObstacleRow } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { Bell, ArrowRight, Eye, CheckCircle2, XCircle, Award, Shuffle, Sparkles, Send, Timer } from 'lucide-react';
import StagePodiums, { ContestantState } from './StagePodiums';

interface RoundVCNVProps {
  obstacles: Obstacle[];
  candidateName: string;
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundVCNV({ obstacles, candidateName, onComplete, onScoreUpdate }: RoundVCNVProps) {
  const [selectedObsIndex, setSelectedObsIndex] = useState(0);

  const obstacleList = obstacles.length > 0 ? obstacles : [
    {
      id: 'obs-1',
      title: 'VCNV: ĐỒ SƠN',
      keyword: 'ĐỒ SƠN',
      char_count: 5,
      image_url: '/images/1.png',
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

  // Contestants state
  const contestants: ContestantState[] = [
    {
      id: 'player-1',
      slot: 1,
      name: candidateName || 'Bạn',
      school: 'Thí sinh dự thi',
      avatar: '👨‍🎓',
      score: earnedPoints,
      isActiveTurn: true,
      isBuzzed: isBuzzModalOpen,
      isEliminated: isEliminated,
    },
    {
      id: 'player-2',
      slot: 2,
      name: 'Nguyễn Minh Tuấn',
      school: 'THPT Chu Văn An - Hà Nội',
      avatar: '🧑‍🎓',
      score: Math.max(0, Math.floor(revealedPieces.length * 10)),
    },
    {
      id: 'player-3',
      slot: 3,
      name: 'Lê Hoàng Mai',
      school: 'THPT Chuyên Lê Hồng Phong',
      avatar: '👩‍🎓',
      score: Math.max(0, Math.floor(revealedPieces.length * 8)),
    },
    {
      id: 'player-4',
      slot: 4,
      name: 'Trần Quốc Bảo',
      school: 'THPT Quốc Học - Huế',
      avatar: '👨‍🎓',
      score: Math.max(0, Math.floor(revealedPieces.length * 10)),
    },
  ];

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
    if (isCnvSolved || isTimerRunning || revealedPieces.includes(row.row)) return;

    soundManager.play('/audio/vcnv/RowChoose.mp3');
    setActiveRow(row);
    setInputAnswer('');
    setIsTimerRunning(true);
    setMessage(null);
  };

  const handleSelectCenter = () => {
    if (isCnvSolved || isTimerRunning || revealedPieces.includes(5)) return;

    soundManager.play('/audio/vcnv/RowChoose.mp3');
    setActiveRow({
      row: 5,
      char_count: obstacle.center_clue?.char_count || 5,
      question: obstacle.center_clue?.question || 'Ô trung tâm gợi ý Chướng ngại vật?',
      answer: obstacle.center_clue?.answer || obstacle.keyword,
    });
    setInputAnswer('');
    setIsTimerRunning(true);
    setMessage(null);
  };

  const handleRowTimeout = () => {
    soundManager.play('/audio/vcnv/WrongRow.mp3');
    setMessage({
      text: `Hết thời gian 15 giây! Hàng ngang số ${activeRow?.row} chưa có câu trả lời.`,
      type: 'error',
    });
    setActiveRow(null);
  };

  const handleSubmitRow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeRow || !inputAnswer.trim()) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);

    const isCorrect = checkMatch(inputAnswer, activeRow.answer);

    if (isCorrect) {
      soundManager.play('/audio/vcnv/CorrectRow.mp3');
      const rowNum = activeRow.row;
      setRevealedPieces((prev) => [...prev, rowNum]);
      setRowAnswers((prev) => ({ ...prev, [rowNum]: activeRow.answer }));
      setEarnedPoints((prev) => prev + 10);
      onScoreUpdate(10);
      setMessage({
        text: `Chính xác! Bạn mở thành công hàng ngang số ${rowNum} (+10 điểm) và lật mở mảnh ghép!`,
        type: 'success',
      });
      setTimeout(() => soundManager.playPictureReveal(), 800);
    } else {
      soundManager.play('/audio/vcnv/WrongRow.mp3');
      setMessage({
        text: `Chưa chính xác! Bạn đã bỏ lỡ cơ hội mở hàng ngang số ${activeRow.row}.`,
        type: 'error',
      });
    }

    setActiveRow(null);
  };

  // CNV Buzzer
  const handleBuzzCNV = () => {
    if (isCnvSolved || isEliminated) return;
    soundManager.play('/audio/vcnv/ObstacleGrant.mp3');
    setIsBuzzModalOpen(true);
  };

  const handleConfirmCNVGuess = () => {
    if (!cnvGuess.trim()) return;
    setIsBuzzModalOpen(false);

    const isCorrect = checkMatch(cnvGuess, obstacle.keyword);

    if (isCorrect) {
      soundManager.play('/audio/vcnv/CorrectObstacle.mp3');
      setIsCnvSolved(true);
      // Reveal all pieces
      setRevealedPieces([1, 2, 3, 4, 5]);

      // Calculate score based on opened rows (60, 50, 40, 30, 20)
      const count = revealedPieces.length;
      let points = 60;
      if (count === 1) points = 50;
      else if (count === 2) points = 40;
      else if (count === 3) points = 30;
      else if (count >= 4) points = 20;

      setEarnedPoints((prev) => prev + points);
      onScoreUpdate(points);
      setMessage({
        text: `XUẤT SẮC! Bạn đã giải chính xác Chướng Ngại Vật: "${obstacle.keyword.toUpperCase()}" (+${points} điểm)!`,
        type: 'success',
      });
    } else {
      soundManager.play('/audio/vcnv/WrongRow.mp3');
      setIsEliminated(true);
      setMessage({
        text: `Rất tiếc! Câu trả lời "${cnvGuess.toUpperCase()}" chưa chính xác. Bạn bị dừng cuộc chơi ở vòng này!`,
        type: 'error',
      });
    }
  };

  const handleSwitchObstacle = () => {
    setSelectedObsIndex((prev) => (prev + 1) % obstacleList.length);
    setActiveRow(null);
    setRevealedPieces([]);
    setRowAnswers({});
    setInputAnswer('');
    setIsCnvSolved(false);
    setIsEliminated(false);
    setMessage(null);
  };

  // Helper to render letter tiles
  const renderRowTiles = (row: ObstacleRow) => {
    const isRevealed = revealedPieces.includes(row.row) || isCnvSolved;
    const cleanAnswerLetters = row.answer.replace(/[^A-Z0-9À-Ỹa-zà-ỹ]/g, '').toUpperCase().split('');
    const charCount = row.char_count || cleanAnswerLetters.length || 6;
    const tiles = Array.from({ length: charCount });

    return (
      <div className="flex flex-wrap gap-1 items-center mt-1">
        {tiles.map((_, i) => {
          const letter = cleanAnswerLetters[i] || '?';
          return (
            <div
              key={i}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center font-black text-xs sm:text-sm border transition-all duration-500 shadow-sm ${
                isRevealed
                  ? 'bg-gradient-to-b from-yellow-300 to-amber-500 text-slate-950 border-yellow-200 shadow-amber-500/40 rotate-0'
                  : 'bg-[#040e2b] text-blue-400/40 border-blue-900/60'
              }`}
            >
              {isRevealed ? letter : '?'}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* 4 Contestant Stage Podiums */}
      <StagePodiums
        contestants={contestants}
        currentRoundName={`VƯỢT CHƯỚNG NGẠI VẬT • TỪ KHÓA: ${obstacle.char_count} CHỮ CÁI`}
      />

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between bg-[#040d28]/90 px-4 py-2.5 rounded-xl border border-amber-500/30 shadow-lg gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded vtv-badge">
            VÒNG 2: VƯỢT CHƯỚNG NGẠI VẬT
          </span>
          <span className="text-xs text-amber-300 font-bold hidden sm:inline">
            Từ khóa: <strong className="text-yellow-400">{obstacle.char_count} chữ cái</strong>
          </span>
          {obstacleList.length > 1 && !isCnvSolved && revealedPieces.length === 0 && (
            <button
              onClick={handleSwitchObstacle}
              className="text-xs text-slate-300 hover:text-amber-300 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              <span>Đổi Đề</span>
            </button>
          )}
        </div>

        {/* CNV Buzzer Button */}
        {!isCnvSolved && !isEliminated && (
          <button
            onClick={handleBuzzCNV}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-600/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 buzzer-active cursor-pointer"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>BẤM CHUÔNG TRẢ LỜI CNV</span>
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold">{message.text}</span>
        </div>
      )}

      {/* Main Television Studio Layout: 4 Rows on Left, 5-Piece Secret Image on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: 4 Rows + Center Row */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>DANH SÁCH 4 HÀNG NGANG</span>
            <span className="text-amber-400 text-[11px]">Bấm vào hàng ngang để giải câu hỏi</span>
          </div>

          {obstacle.rows.map((row) => {
            const isRevealed = revealedPieces.includes(row.row) || isCnvSolved;
            const isSelected = activeRow?.row === row.row;

            return (
              <div
                key={row.row}
                onClick={() => handleSelectRow(row)}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isRevealed
                    ? 'bg-gradient-to-r from-emerald-950/40 to-[#04122d] border-emerald-500/40'
                    : isSelected
                    ? 'bg-gradient-to-r from-amber-500/25 to-[#05153f] border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-[#030a24]/90 border-slate-700/60 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                      {row.row}
                    </span>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      HÀNG NGANG {row.row}
                    </span>
                    <span className="text-[11px] text-amber-300/80 font-semibold">
                      ({row.char_count} chữ cái)
                    </span>
                  </div>

                  {isRevealed && (
                    <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ MỞ
                    </span>
                  )}
                </div>

                {/* Letter Tiles Visual */}
                {renderRowTiles(row)}
              </div>
            );
          })}

          {/* Center Row Clue */}
          {obstacle.center_clue && (
            <div
              onClick={handleSelectCenter}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                revealedPieces.includes(5) || isCnvSolved
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-purple-950/30 border-purple-500/40 hover:border-purple-400 text-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-500 text-white font-black text-xs flex items-center justify-center shadow">
                    ★
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Ô TRUNG TÂM GỢI Ý
                  </span>
                </div>
                {revealedPieces.includes(5) && (
                  <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1 uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ MỞ
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 5-Piece Secret Image Puzzle */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-amber-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>HÌNH ẢNH CHƯỚNG NGẠI VẬT</span>
          </div>

          {/* 5-Piece Mosaic Container */}
          <div className="relative w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-black">
            {/* Background Secret Picture */}
            <img
              src={obstacle.image_url || '/images/1.png'}
              alt="Hình ảnh chướng ngại vật"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Corner Piece 1 (Top-Left) */}
            <div
              className={`absolute top-0 left-0 w-1/2 h-1/2 border-r border-b border-amber-500/30 flex items-center justify-center transition-all duration-700 ${
                revealedPieces.includes(1) || isCnvSolved
                  ? 'opacity-0 pointer-events-none scale-110'
                  : 'bg-[#030b26]/95 backdrop-blur-md opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-amber-400 vtv-score-led">1</span>
              </div>
            </div>

            {/* Corner Piece 2 (Top-Right) */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-1/2 border-l border-b border-amber-500/30 flex items-center justify-center transition-all duration-700 ${
                revealedPieces.includes(2) || isCnvSolved
                  ? 'opacity-0 pointer-events-none scale-110'
                  : 'bg-[#030b26]/95 backdrop-blur-md opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-amber-400 vtv-score-led">2</span>
              </div>
            </div>

            {/* Corner Piece 3 (Bottom-Left) */}
            <div
              className={`absolute bottom-0 left-0 w-1/2 h-1/2 border-r border-t border-amber-500/30 flex items-center justify-center transition-all duration-700 ${
                revealedPieces.includes(3) || isCnvSolved
                  ? 'opacity-0 pointer-events-none scale-110'
                  : 'bg-[#030b26]/95 backdrop-blur-md opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-amber-400 vtv-score-led">3</span>
              </div>
            </div>

            {/* Corner Piece 4 (Bottom-Right) */}
            <div
              className={`absolute bottom-0 right-0 w-1/2 h-1/2 border-l border-t border-amber-500/30 flex items-center justify-center transition-all duration-700 ${
                revealedPieces.includes(4) || isCnvSolved
                  ? 'opacity-0 pointer-events-none scale-110'
                  : 'bg-[#030b26]/95 backdrop-blur-md opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-amber-400 vtv-score-led">4</span>
              </div>
            </div>

            {/* Center Diamond Clue Piece */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-amber-400 flex items-center justify-center shadow-2xl transition-all duration-700 ${
                revealedPieces.includes(5) || isCnvSolved
                  ? 'opacity-0 pointer-events-none scale-125'
                  : 'bg-[#07133f]/95 backdrop-blur-lg opacity-100'
              }`}
            >
              <span className="text-3xl font-black text-yellow-300">?</span>
            </div>
          </div>

          {/* Solved Banner */}
          {isCnvSolved && (
            <div className="mt-3 text-center">
              <span className="text-xs uppercase text-slate-400 font-bold">TỪ KHÓA CHƯỚNG NGẠI VẬT:</span>
              <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wider">
                {obstacle.keyword}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Question Lower-Third Popup */}
      {activeRow && (
        <div className="vtv-question-box rounded-2xl p-5 md:p-6 mt-4 border-amber-400 shadow-2xl">
          <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded vtv-badge">
                {activeRow.row === 5 ? 'Ô TRUNG TÂM' : `HÀNG NGANG ${activeRow.row}`}
              </span>
              <span className="text-xs text-amber-300 font-bold">
                ({activeRow.char_count} CHỮ CÁI)
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-lg border border-slate-700">
              <Timer className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-lg font-black text-amber-400 vtv-score-led">{timer}s</span>
            </div>
          </div>

          <p className="text-base md:text-lg font-bold text-slate-100 mb-4 text-center">
            {activeRow.question}
          </p>

          <form onSubmit={handleSubmitRow} className="flex gap-2">
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder={`Nhập đáp án (${activeRow.char_count} chữ cái)...`}
              autoFocus
              className="flex-1 bg-black/60 border border-amber-500/50 focus:border-amber-400 px-4 py-2.5 rounded-xl text-sm font-bold text-yellow-200 outline-none"
            />
            <button
              type="submit"
              disabled={!inputAnswer.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <span>Xác Nhận</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* CNV Guess Modal */}
      {isBuzzModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="vtv-question-box max-w-lg w-full p-6 rounded-2xl border-red-500 glow-red shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-red-500 animate-bounce" />
                <h3 className="font-black text-lg text-amber-300 uppercase tracking-wider">
                  BẤM CHUÔNG TRẢ LỜI CHƯỚNG NGẠI VẬT
                </h3>
              </div>
              <button
                onClick={() => setIsBuzzModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              ⚠️ <strong>Lưu ý luật thi VTV:</strong> Nếu trả lời sai, bạn sẽ bị tước quyền trả lời Chướng ngại vật trong suốt phần thi này. Hãy suy nghĩ thật kỹ trước khi xác nhận!
            </p>

            <div className="mb-4">
              <label className="text-xs font-bold text-amber-400 block mb-1.5 uppercase">
                Nhập từ khóa Chướng Ngại Vật ({obstacle.char_count} chữ cái):
              </label>
              <input
                type="text"
                value={cnvGuess}
                onChange={(e) => setCnvGuess(e.target.value)}
                placeholder="Nhập chính xác từ khóa..."
                autoFocus
                className="w-full bg-black/80 border-2 border-red-500 focus:border-amber-400 px-4 py-3 rounded-xl text-base text-yellow-300 font-black uppercase tracking-wider outline-none shadow-inner"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmCNVGuess}
                disabled={!cnvGuess.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
              >
                Xác Nhận Giải CNV
              </button>
              <button
                onClick={() => setIsBuzzModalOpen(false)}
                className="px-5 py-3 bg-slate-900 text-slate-400 font-bold text-xs uppercase rounded-xl hover:bg-slate-800"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Button to Advance to Round 3 */}
      {(isCnvSolved || isEliminated || revealedPieces.length >= 4) && (
        <div className="pt-4 text-center">
          <button
            onClick={() => onComplete(earnedPoints)}
            className="w-full py-4 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer"
          >
            <span>Tiến Vào Vòng Tăng Tốc (Round 3)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

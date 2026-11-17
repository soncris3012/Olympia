'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OlympiaQuestion } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { Flag, Star, Timer, ArrowRight, CheckCircle2, XCircle, Award } from 'lucide-react';

interface RoundVDProps {
  questions: OlympiaQuestion[];
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundVD({ questions, onComplete, onScoreUpdate }: RoundVDProps) {
  // Step 1: Package Selection, Step 2: Answering 3 questions
  const [selectedPackage, setSelectedPackage] = useState<number[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<OlympiaQuestion[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [hopeStarUsed, setHopeStarUsed] = useState(false);
  const [isStarActiveForCurrent, setIsStarActiveForCurrent] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; pointsDelta: number } | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    soundManager.play('/audio/vd/StartRound.mp3');
  }, []);

  const handleSelectPackage = (pkg: number[]) => {
    soundManager.play('/audio/vd/PackageChosen.mp3');
    setSelectedPackage(pkg);

    // Pick questions matching the values
    const q20 = questions.filter((q) => q.points === 20);
    const q30 = questions.filter((q) => q.points === 30);

    const picked: OlympiaQuestion[] = [];
    let idx20 = 0;
    let idx30 = 0;

    pkg.forEach((val, i) => {
      if (val === 20) {
        picked.push(q20[idx20] || questions[i] || {
          id: `vd-20-${i}`,
          round: 'vd',
          category: 'Kiến thức chung',
          question: 'Vận tốc ánh sáng trong chân không có giá trị xấp xỉ bằng bao nhiêu km/s?',
          answer: '300000 km/s (3 x 10^8 m/s)',
          points: 20,
          time_limit: 15
        });
        idx20++;
      } else {
        picked.push(q30[idx30] || questions[i] || {
          id: `vd-30-${i}`,
          round: 'vd',
          category: 'Toán học nâng cao',
          question: 'Một hình lập phương có diện tích toàn phần là 54 cm². Hãy tính thể tích khối lập phương đó?',
          answer: '27 cm³ (Cạnh a = 3 cm => V = 27 cm³)',
          points: 30,
          time_limit: 20
        });
        idx30++;
      }
    });

    setActiveQuestions(picked);
  };

  const currentQ = activeQuestions[currentIndex];

  // Timer countdown
  useEffect(() => {
    if (!selectedPackage || !currentQ || isAnswerSubmitted || isRoundFinished) return;

    const initialTime = currentQ.points === 30 ? 20 : 15;
    setTimeLeft(initialTime);

    if (initialTime === 20) {
      soundManager.play('/audio/vd/20Seconds.mp3');
    } else {
      soundManager.play('/audio/vd/15Seconds.mp3');
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedPackage, currentIndex, isAnswerSubmitted, isRoundFinished]);

  const cleanString = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const checkAnswerMatch = (input: string, targetAnswer: string): boolean => {
    const cleanInput = cleanString(input);
    if (!cleanInput) return false;

    const cleanTarget = cleanString(targetAnswer);
    if (cleanTarget === cleanInput || cleanTarget.includes(cleanInput) || cleanInput.includes(cleanTarget)) {
      return true;
    }

    const parts = targetAnswer
      .split(/[\/,\(\)]/)
      .map((p) => cleanString(p))
      .filter((p) => p.length > 1);

    for (const part of parts) {
      if (part === cleanInput || part.includes(cleanInput) || cleanInput.includes(part)) {
        return true;
      }
    }

    return false;
  };

  const handleToggleHopeStar = () => {
    if (hopeStarUsed || isAnswerSubmitted) return;
    soundManager.playHopeStar();
    setIsStarActiveForCurrent(!isStarActiveForCurrent);
  };

  const handleTimeOut = () => {
    setIsAnswerSubmitted(true);
    soundManager.play('/audio/vd/Wrong.mp3');

    let penalty = 0;
    if (isStarActiveForCurrent) {
      penalty = -currentQ.points;
      setHopeStarUsed(true);
    }

    setLastResult({ isCorrect: false, pointsDelta: penalty });
    if (penalty !== 0) {
      setEarnedPoints((prev) => prev + penalty);
      onScoreUpdate(penalty);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isMatch = checkAnswerMatch(userAnswer, currentQ.answer);

    setIsAnswerSubmitted(true);

    if (isMatch) {
      const awarded = isStarActiveForCurrent ? currentQ.points * 2 : currentQ.points;
      soundManager.play('/audio/vd/Correct.mp3');
      setLastResult({ isCorrect: true, pointsDelta: awarded });
      setEarnedPoints((prev) => prev + awarded);
      onScoreUpdate(awarded);
    } else {
      const penalty = isStarActiveForCurrent ? -currentQ.points : 0;
      soundManager.play('/audio/vd/Wrong.mp3');
      setLastResult({ isCorrect: false, pointsDelta: penalty });
      if (penalty !== 0) {
        setEarnedPoints((prev) => prev + penalty);
        onScoreUpdate(penalty);
      }
    }

    if (isStarActiveForCurrent) {
      setHopeStarUsed(true);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= 3) {
      soundManager.playFinishMatch();
      setIsRoundFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswerSubmitted(false);
      setIsStarActiveForCurrent(false);
      setLastResult(null);
    }
  };

  // Screen 1: Package Picker
  if (!selectedPackage) {
    return (
      <div className="olympia-card rounded-2xl p-6 md:p-8 max-w-2xl mx-auto border-amber-500/40 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40">
          <Flag className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300 uppercase tracking-wider mb-2">
          Chọn Gói Câu Hỏi Về Đích
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Hãy chọn 3 câu hỏi cho hành trình leo lên đỉnh Olympia của bạn:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { name: 'An Toàn', pkg: [20, 20, 20], total: 60, desc: '3 câu 20 điểm' },
            { name: 'Cân Bằng', pkg: [20, 20, 30], total: 70, desc: '2 câu 20đ + 1 câu 30đ' },
            { name: 'Bứt Phá', pkg: [20, 30, 30], total: 80, desc: '1 câu 20đ + 2 câu 30đ' },
            { name: 'Mạo Hiểm', pkg: [30, 30, 30], total: 90, desc: '3 câu 30 điểm' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelectPackage(item.pkg)}
              className="p-5 rounded-xl border border-slate-700 bg-slate-900/80 hover:border-amber-400 hover:bg-slate-800/80 transition-all text-left group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-amber-300 text-base group-hover:text-amber-200">
                  {item.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                  {item.total} điểm
                </span>
              </div>
              <p className="text-xs text-slate-400">{item.desc}</p>
              <div className="mt-3 flex gap-2">
                {item.pkg.map((val, idx) => (
                  <span
                    key={idx}
                    className="w-10 h-7 rounded bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-xs text-amber-400"
                  >
                    {val}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Screen 3: Round Finished
  if (isRoundFinished) {
    return (
      <div className="olympia-card rounded-2xl p-8 max-w-2xl mx-auto text-center border-amber-500/30">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40">
          <Award className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300 uppercase tracking-wider mb-2">
          Hoàn Thành Phần Thi Về Đích!
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Chặng đường chinh phục đỉnh núi Olympia của bạn đã hoàn thành trọn vẹn!
        </p>

        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700/50 mb-8">
          <span className="text-xs uppercase text-slate-400 font-semibold">Điểm số vòng Về đích</span>
          <p className="text-4xl font-black text-amber-400 mt-1">
            {earnedPoints >= 0 ? `+${earnedPoints}` : earnedPoints}
          </p>
        </div>

        <button
          onClick={() => onComplete(earnedPoints)}
          className="w-full py-4 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-lg uppercase tracking-wider"
        >
          <span>Xem Lễ Vinh Danh & Trao Vòng Nguyệt Quế</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900/80 px-5 py-3 rounded-xl border border-amber-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-md uppercase border border-amber-500/30">
            Vòng 4: Về Đích
          </span>
          <span className="text-xs text-slate-400">
            Câu {currentIndex + 1} / 3 ({currentQ.points} điểm)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Hope star toggle */}
          {!hopeStarUsed && !isAnswerSubmitted && (
            <button
              onClick={handleToggleHopeStar}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                isStarActiveForCurrent
                  ? 'bg-amber-400 text-slate-950 glow-gold scale-105'
                  : 'bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-400'
              }`}
            >
              <Star className={`w-4 h-4 ${isStarActiveForCurrent ? 'fill-slate-950' : 'text-amber-400'}`} />
              <span>{isStarActiveForCurrent ? 'ĐÃ ĐẶT NSHV (x2 ĐIỂM)' : 'ĐẶT NGÔI SAO HY VỌNG'}</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <span className={`text-2xl font-black font-mono ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-300'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="olympia-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {isStarActiveForCurrent && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full shadow-lg">
            <Star className="w-3.5 h-3.5 fill-slate-950" />
            <span>Đang kích hoạt Ngôi Sao Hy Vọng!</span>
          </div>
        )}

        <div className="mb-2">
          <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
            {currentQ.category} • Câu hỏi {currentQ.points} điểm
          </span>
        </div>

        <h3 className="text-lg md:text-2xl font-bold text-slate-100 leading-relaxed min-h-[4rem]">
          {currentQ.question}
        </h3>

        {/* Result banner if submitted */}
        {isAnswerSubmitted && lastResult && (
          <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
            lastResult.isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            {lastResult.isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm md:text-base">
                {lastResult.isCorrect
                  ? `CHÍNH XÁC! (+${lastResult.pointsDelta} Điểm)`
                  : `CHƯA CHÍNH XÁC! ${lastResult.pointsDelta !== 0 ? `(${lastResult.pointsDelta} Điểm)` : ''}`}
              </p>
              <p className="text-xs md:text-sm mt-1 text-slate-300">
                <span className="font-semibold text-amber-300">Đáp án chuẩn: </span>
                {currentQ.answer}
              </p>
              {currentQ.explanation && (
                <p className="text-xs text-slate-400 mt-1 italic">
                  {currentQ.explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isAnswerSubmitted}
            placeholder="Nhập câu trả lời..."
            autoFocus
            className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-amber-400 text-slate-100 px-4 py-3 rounded-xl text-base outline-none transition-all placeholder:text-slate-500 disabled:opacity-50"
          />

          {!isAnswerSubmitted ? (
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              Trả Lời
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 >= 3 ? 'Kết Thúc Trận Đấu' : 'Câu Tiếp Theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

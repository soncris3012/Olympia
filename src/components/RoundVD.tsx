'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OlympiaQuestion } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { Flag, Star, Timer, ArrowRight, CheckCircle2, XCircle, Award, Sparkles, Send } from 'lucide-react';
import StagePodiums, { ContestantState } from './StagePodiums';

interface RoundVDProps {
  questions: OlympiaQuestion[];
  candidateName: string;
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundVD({ questions, candidateName, onComplete, onScoreUpdate }: RoundVDProps) {
  // Step 1: Package Selection [20, 20, 20] or [20, 20, 30] or [20, 30, 30] or [30, 30, 30]
  const [selectedPackage, setSelectedPackage] = useState<number[] | null>(null);
  const [customPackage, setCustomPackage] = useState<[number, number, number]>([20, 20, 30]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<OlympiaQuestion[]>([]);
  const [timeLeft, setTimeLeft] = useState(150); // tenths of second
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [hopeStarUsed, setHopeStarUsed] = useState(false);
  const [isStarActiveForCurrent, setIsStarActiveForCurrent] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; pointsDelta: number } | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Contestants on stage
  const contestants: ContestantState[] = [
    {
      id: 'player-1',
      slot: 1,
      name: candidateName || 'Bạn',
      school: 'Thí sinh dự thi',
      avatar: '👨‍🎓',
      score: earnedPoints,
      isActiveTurn: true,
      hasStarOfHope: isStarActiveForCurrent,
    },
    {
      id: 'player-2',
      slot: 2,
      name: 'Nguyễn Minh Tuấn',
      school: 'THPT Chu Văn An - Hà Nội',
      avatar: '🧑‍🎓',
      score: Math.max(0, Math.floor(earnedPoints * 0.9 + 20)),
    },
    {
      id: 'player-3',
      slot: 3,
      name: 'Lê Hoàng Mai',
      school: 'THPT Chuyên Lê Hồng Phong',
      avatar: '👩‍🎓',
      score: Math.max(0, Math.floor(earnedPoints * 0.85 + 30)),
    },
    {
      id: 'player-4',
      slot: 4,
      name: 'Trần Quốc Bảo',
      school: 'THPT Quốc Học - Huế',
      avatar: '👨‍🎓',
      score: Math.max(0, Math.floor(earnedPoints * 0.8 + 10)),
    },
  ];

  useEffect(() => {
    soundManager.play('/audio/vd/StartRound.mp3');
  }, []);

  const handleSelectPackage = (pkg: number[]) => {
    soundManager.play('/audio/vd/PackageChosen.mp3');
    setSelectedPackage(pkg);

    const q20 = questions.filter((q) => q.points === 20);
    const q30 = questions.filter((q) => q.points === 30);

    const picked: OlympiaQuestion[] = [];
    let idx20 = 0;
    let idx30 = 0;

    pkg.forEach((val, i) => {
      if (val === 20) {
        picked.push(
          q20[idx20] || questions[i] || {
            id: `vd-20-${i}`,
            round: 'vd',
            category: 'Khoa học tự nhiên',
            question: 'Tại sao khi chim đậu trên một dây điện cao thế trần thì không bị điện giật?',
            answer: 'Hiệu điện thế giữa hai chân chim xấp xỉ bằng 0',
            points: 20,
            time_limit: 15,
          }
        );
        idx20++;
      } else {
        picked.push(
          q30[idx30] || questions[i] || {
            id: `vd-30-${i}`,
            round: 'vd',
            category: 'Toán học nâng cao',
            question: 'Có bao nhiêu số nguyên dương có 3 chữ số chứa ít nhất một chữ số 5?',
            answer: '252 số',
            points: 30,
            time_limit: 20,
          }
        );
        idx30++;
      }
    });

    setActiveQuestions(picked);
  };

  const currentQ = activeQuestions[currentIndex];
  const qTimeLimit = currentQ?.points === 30 ? 20 : 15;

  // Timer countdown
  useEffect(() => {
    if (!selectedPackage || !currentQ || isAnswerSubmitted || isRoundFinished) return;

    setTimeLeft(qTimeLimit * 10);

    if (qTimeLimit === 20) {
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
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, selectedPackage, isAnswerSubmitted, isRoundFinished, qTimeLimit]);

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

  const handleActivateHopeStar = () => {
    if (hopeStarUsed || isAnswerSubmitted) return;
    soundManager.playHopeStar();
    setHopeStarUsed(true);
    setIsStarActiveForCurrent(true);
  };

  const handleTimeOut = () => {
    setIsAnswerSubmitted(true);
    soundManager.play('/audio/vd/Wrong.mp3');

    const penalty = isStarActiveForCurrent ? currentQ.points : 0;
    setLastResult({ isCorrect: false, pointsDelta: -penalty });
    if (penalty > 0) {
      setEarnedPoints((prev) => Math.max(0, prev - penalty));
      onScoreUpdate(-penalty);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isMatch = checkAnswerMatch(userAnswer, currentQ.answer);
    setIsAnswerSubmitted(true);

    if (isMatch) {
      soundManager.play('/audio/vd/Correct.mp3');
      const pts = isStarActiveForCurrent ? currentQ.points * 2 : currentQ.points;
      setLastResult({ isCorrect: true, pointsDelta: pts });
      setEarnedPoints((prev) => prev + pts);
      onScoreUpdate(pts);
    } else {
      soundManager.play('/audio/vd/Wrong.mp3');
      const penalty = isStarActiveForCurrent ? currentQ.points : 0;
      setLastResult({ isCorrect: false, pointsDelta: -penalty });
      if (penalty > 0) {
        setEarnedPoints((prev) => Math.max(0, prev - penalty));
        onScoreUpdate(-penalty);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= 3) {
      setIsRoundFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswerSubmitted(false);
      setIsStarActiveForCurrent(false);
      setLastResult(null);
    }
  };

  // Step 1: Package Selection Screen
  if (!selectedPackage) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <StagePodiums contestants={contestants} currentRoundName="VỀ ĐÍCH • CHỌN GÓI CÂU HỎI" />

        <div className="vtv-question-box rounded-3xl p-6 md:p-10 text-center border-amber-500/60 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest mb-3">
            <Flag className="w-3.5 h-3.5 text-yellow-300" />
            <span>PHẦN THI QUYẾT ĐỊNH • VỀ ĐÍCH</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-wider mb-2">
            HÃY LỰA CHỌN GÓI CÂU HỎI
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-lg mx-auto mb-8">
            Bạn có quyền tùy chỉnh 3 câu hỏi với các mức điểm 20 hoặc 30 điểm. Hãy cân nhắc chiến thuật để bảo toàn hoặc bứt phá thứ hạng!
          </p>

          {/* Interactive 3-Card Package Builder */}
          <div className="max-w-lg mx-auto mb-8">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-3">
              Bấm vào từng thẻ để đổi mức điểm [20đ] ↔ [30đ]:
            </span>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[0, 1, 2].map((slotIdx) => {
                const val = customPackage[slotIdx];
                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => {
                      soundManager.play('/audio/vd/Choose.mp3');
                      const next = [...customPackage] as [number, number, number];
                      next[slotIdx] = next[slotIdx] === 20 ? 30 : 20;
                      setCustomPackage(next);
                    }}
                    className={`py-6 px-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 shadow-lg ${
                      val === 30
                        ? 'bg-gradient-to-b from-amber-500/30 to-[#07153d] border-amber-400 glow-gold scale-105'
                        : 'bg-gradient-to-b from-blue-900/30 to-[#03091e] border-cyan-500/40 hover:border-cyan-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      CÂU {slotIdx + 1}
                    </span>
                    <span className={`text-3xl sm:text-4xl font-black vtv-score-led ${val === 30 ? 'text-amber-400' : 'text-cyan-300'}`}>
                      {val}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ĐIỂM</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-amber-300 font-bold mt-3">
              Tổng gói điểm: {customPackage[0] + customPackage[1] + customPackage[2]} Điểm
            </p>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => handleSelectPackage(customPackage)}
            className="w-full max-w-md py-4 px-8 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/40 text-base uppercase tracking-wider cursor-pointer"
          >
            Xác Nhận Gói Câu Hỏi Này
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Finished
  if (isRoundFinished) {
    return (
      <div className="vtv-question-box rounded-3xl p-8 max-w-2xl mx-auto text-center border-amber-500/60 my-8 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-lg shadow-amber-500/40">
          <Award className="w-10 h-10 text-amber-300" />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-wider mb-2">
          HOÀN THÀNH PHẦN THI VỀ ĐÍCH
        </h2>
        <p className="text-slate-300 text-sm md:text-base mb-6">
          Bạn đã hoàn thành trọn vẹn 4 chặng leo núi Đường lên đỉnh Olympia!
        </p>

        <div className="bg-[#050f2e]/90 p-5 rounded-xl border border-amber-500/40 shadow-inner max-w-sm mx-auto mb-8">
          <span className="text-xs uppercase text-amber-400/80 font-bold tracking-wider">Tổng điểm Về Đích đạt được</span>
          <p className="text-4xl font-black text-amber-400 mt-1 vtv-score-led">
            {earnedPoints >= 0 ? `+${earnedPoints}` : `${earnedPoints}`}
          </p>
        </div>

        <button
          onClick={() => onComplete(earnedPoints)}
          className="w-full py-4 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer"
        >
          <span>Xem Lễ Vinh Danh & Trao Vòng Nguyệt Quế</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Step 2: Answering the 3 questions
  const timerPercent = (timeLeft / (qTimeLimit * 10)) * 100;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 4 Contestant Stage Podiums */}
      <StagePodiums
        contestants={contestants}
        currentRoundName={`VỀ ĐÍCH • CÂU ${currentIndex + 1}/3 (${currentQ.points} ĐIỂM)`}
      />

      {/* Main Television Question Box */}
      <div
        className={`vtv-question-box rounded-2xl p-5 md:p-8 transition-all duration-300 ${
          isStarActiveForCurrent ? 'nshv-aura' : ''
        } ${
          lastResult?.isCorrect
            ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
            : lastResult && !lastResult.isCorrect
            ? 'border-rose-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
            : ''
        }`}
      >
        {/* Top Header Tag Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded vtv-badge shadow">
              VỀ ĐÍCH
            </span>
            <span className="px-2.5 py-1 bg-slate-900/90 text-amber-300 text-xs font-bold border border-slate-700 rounded">
              CÂU {currentIndex + 1} / 3
            </span>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40 rounded uppercase">
              {currentQ.points} ĐIỂM
            </span>
            {isStarActiveForCurrent && (
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded flex items-center gap-1 animate-pulse shadow">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                NGÔI SAO HY VỌNG (x2)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Star of Hope Button */}
            {!hopeStarUsed && !isAnswerSubmitted && (
              <button
                type="button"
                onClick={handleActivateHopeStar}
                className="px-3 py-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 text-xs font-black rounded-lg uppercase tracking-wider shadow-lg shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer animate-bounce"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>Đặt NSHV</span>
              </button>
            )}

            {/* TV Countdown Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-lg border border-slate-700">
              <Timer className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-spin' : 'text-amber-400'}`} />
              <span className={`text-xl font-black font-mono vtv-score-led ${isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                {(timeLeft / 10).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Countdown */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              isUrgent ? 'bg-gradient-to-r from-red-600 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-yellow-300'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Question Text */}
        <div className="text-center my-4 min-h-[5rem] flex items-center justify-center">
          <h2 className="text-lg md:text-2xl font-black text-slate-100 leading-snug tracking-wide max-w-3xl drop-shadow-md">
            {currentQ.question}
          </h2>
        </div>

        {/* Result Banner */}
        {isAnswerSubmitted && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 transition-all ${
              lastResult?.isCorrect
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {lastResult?.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="font-black text-sm uppercase tracking-wider">
                  {lastResult?.isCorrect
                    ? `CHÍNH XÁC! (+${lastResult.pointsDelta} ĐIỂM)`
                    : `CHƯA CHÍNH XÁC! (${lastResult?.pointsDelta} ĐIỂM)`}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Đáp án chuẩn VTV: <strong className="text-yellow-300 uppercase font-black">{currentQ.answer}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider shadow hover:from-amber-300 cursor-pointer"
            >
              {currentIndex + 1 >= 3 ? 'Tổng Kết Trận Đấu →' : 'Câu Tiếp Theo →'}
            </button>
          </div>
        )}

        {/* Answer Input Bar */}
        {!isAnswerSubmitted && (
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập câu trả lời Về đích..."
              autoFocus
              className="flex-1 bg-black/60 border-2 border-amber-500/50 focus:border-amber-400 px-4 py-3 rounded-xl text-base text-yellow-200 placeholder:text-slate-500 font-bold outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Xác Nhận</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

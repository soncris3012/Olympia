'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OlympiaQuestion } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { Timer, ArrowRight, CheckCircle2, XCircle, Award, Sparkles, Send } from 'lucide-react';
import StagePodiums, { ContestantState } from './StagePodiums';

interface RoundKDProps {
  questions: OlympiaQuestion[];
  candidateName: string;
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundKD({ questions, candidateName, onComplete, onScoreUpdate }: RoundKDProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerMode, setTimerMode] = useState<5 | 8>(5);
  const [timeLeft, setTimeLeft] = useState(50); // tenths of second (5.0s)
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentQ = questions[currentIndex] || questions[0];
  const maxQuestions = Math.min(questions.length, 10);

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
    },
    {
      id: 'player-2',
      slot: 2,
      name: 'Nguyễn Minh Tuấn',
      school: 'THPT Chu Văn An - Hà Nội',
      avatar: '🧑‍🎓',
      score: Math.max(0, Math.floor(correctCount * 7.5)),
    },
    {
      id: 'player-3',
      slot: 3,
      name: 'Lê Hoàng Mai',
      school: 'THPT Chuyên Lê Hồng Phong',
      avatar: '👩‍🎓',
      score: Math.max(0, Math.floor(correctCount * 8)),
    },
    {
      id: 'player-4',
      slot: 4,
      name: 'Trần Quốc Bảo',
      school: 'THPT Quốc Học - Huế',
      avatar: '👨‍🎓',
      score: Math.max(0, Math.floor(correctCount * 6.5)),
    },
  ];

  useEffect(() => {
    soundManager.playStartRound();
  }, []);

  useEffect(() => {
    if (isAnswerSubmitted || isRoundFinished) return;

    setTimeLeft(timerMode * 10); // tenths of a second
    if (inputRef.current) {
      inputRef.current.focus();
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
  }, [currentIndex, isAnswerSubmitted, isRoundFinished, timerMode]);

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

  const handleTimeOut = () => {
    setIsAnswerSubmitted(true);
    setLastResult('wrong');
    soundManager.playWrong();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isMatch = checkAnswerMatch(userAnswer, currentQ.answer);

    setIsAnswerSubmitted(true);
    if (isMatch) {
      setLastResult('correct');
      soundManager.playCorrect();
      setCorrectCount((prev) => prev + 1);
      setEarnedPoints((prev) => prev + 10);
      onScoreUpdate(10);
    } else {
      setLastResult('wrong');
      soundManager.playWrong();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= maxQuestions) {
      setIsRoundFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswerSubmitted(false);
      setLastResult(null);
    }
  };

  if (isRoundFinished) {
    return (
      <div className="vtv-question-box rounded-3xl p-8 max-w-2xl mx-auto text-center border-amber-500/50 my-8 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-lg shadow-amber-500/40">
          <Award className="w-10 h-10 text-amber-300" />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-wider mb-2">
          KẾT THÚC PHẦN THI KHỞI ĐỘNG
        </h2>
        <p className="text-slate-300 text-sm md:text-base mb-6">
          Bạn vừa hoàn thành 10 câu hỏi với tốc độ và phản xạ chuẩn truyền hình!
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#050f2e]/90 p-4 rounded-xl border border-slate-700/60 shadow-inner">
            <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Số câu trả lời đúng</span>
            <p className="text-4xl font-black text-emerald-400 mt-1 vtv-score-led">{correctCount} / {maxQuestions}</p>
          </div>
          <div className="bg-[#050f2e]/90 p-4 rounded-xl border border-amber-500/40 shadow-inner">
            <span className="text-xs uppercase text-amber-400/80 font-bold tracking-wider">Điểm số đạt được</span>
            <p className="text-4xl font-black text-amber-400 mt-1 vtv-score-led">+{earnedPoints}</p>
          </div>
        </div>

        <button
          onClick={() => onComplete(earnedPoints)}
          className="w-full py-4 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer"
        >
          <span>Tiến Vào Vòng Vượt Chướng Ngại Vật</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Calculate percentage of timer
  const maxTimerTenths = timerMode * 10;
  const timerPercent = (timeLeft / maxTimerTenths) * 100;
  const isUrgent = timeLeft <= 15;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 4 Contestant Stage Podiums */}
      <StagePodiums contestants={contestants} currentRoundName={`KHỞI ĐỘNG • CÂU ${currentIndex + 1}/${maxQuestions}`} />

      {/* Question Lower-Third TV Box */}
      <div className={`vtv-question-box rounded-2xl p-5 md:p-8 transition-all duration-300 ${
        lastResult === 'correct'
          ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
          : lastResult === 'wrong'
          ? 'border-rose-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
          : ''
      }`}>
        {/* Top Header Tag Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded vtv-badge shadow">
              KHỞI ĐỘNG
            </span>
            <span className="px-2.5 py-1 bg-slate-900/90 text-amber-300 text-xs font-bold border border-slate-700 rounded">
              CÂU {currentIndex + 1} / {maxQuestions}
            </span>
            {currentQ.category && (
              <span className="hidden sm:inline-block px-2.5 py-1 bg-blue-950/80 text-cyan-300 text-xs font-bold border border-cyan-500/30 rounded uppercase">
                {currentQ.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Timer mode toggle */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setTimerMode(5)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  timerMode === 5
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Chuẩn VTV 5 giây"
              >
                5s VTV
              </button>
              <button
                onClick={() => setTimerMode(8)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  timerMode === 8
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="8 giây thong thả"
              >
                8s Gõ
              </button>
            </div>

            {/* TV Countdown Clock */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-lg border border-slate-700">
              <Timer className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-spin' : 'text-amber-400'}`} />
              <span className={`text-xl font-black font-mono vtv-score-led ${isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                {(timeLeft / 10).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar Countdown */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              isUrgent ? 'bg-gradient-to-r from-red-600 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-yellow-300'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Main TV Question Text */}
        <div className="min-h-[5rem] flex items-center justify-center text-center my-4">
          <h2 className="text-lg md:text-2xl font-black text-slate-100 leading-snug tracking-wide max-w-3xl drop-shadow-md">
            {currentQ.question}
          </h2>
        </div>

        {/* Feedback / Result Banner */}
        {isAnswerSubmitted && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 transition-all ${
              lastResult === 'correct'
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {lastResult === 'correct' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="font-black text-sm uppercase tracking-wider">
                  {lastResult === 'correct' ? 'CHÍNH XÁC! (+10 ĐIỂM)' : 'CHƯA CHÍNH XÁC!'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Đáp án chuẩn VTV: <strong className="text-yellow-300 uppercase font-black">{currentQ.answer}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider shadow hover:from-amber-300 hover:to-amber-400 cursor-pointer"
            >
              Câu Tiếp Theo →
            </button>
          </div>
        )}

        {/* Answer Input Bar */}
        {!isAnswerSubmitted && (
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập câu trả lời chuẩn xác và nhấn Enter..."
              autoFocus
              className="flex-1 bg-black/60 border-2 border-amber-500/50 focus:border-amber-400 px-4 py-3 rounded-xl text-base text-yellow-200 placeholder:text-slate-500 font-bold outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Trả Lời</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

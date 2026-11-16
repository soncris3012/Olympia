'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OlympiaQuestion } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { Timer, ArrowRight, CheckCircle2, XCircle, Award } from 'lucide-react';

interface RoundKDProps {
  questions: OlympiaQuestion[];
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundKD({ questions, onComplete, onScoreUpdate }: RoundKDProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQ = questions[currentIndex] || questions[0];
  const maxQuestions = Math.min(questions.length, 8); // 8 fast questions for standard warm-up

  // Start round sound
  useEffect(() => {
    soundManager.playStartRound();
  }, []);

  // Timer loop
  useEffect(() => {
    if (isAnswerSubmitted || isRoundFinished) return;

    setTimeLeft(currentQ.time_limit || 5);

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
  }, [currentIndex, isAnswerSubmitted, isRoundFinished]);

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
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

    const normInput = normalizeText(userAnswer);
    const normAns = normalizeText(currentQ.answer);

    const isMatch = normInput.length > 0 && (normAns.includes(normInput) || normInput.includes(normAns));

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
      <div className="olympia-card rounded-2xl p-8 max-w-2xl mx-auto text-center border-amber-500/30">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40">
          <Award className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300 uppercase tracking-wider mb-2">
          Hoàn Thành Phần Thi Khởi Động
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Bạn đã thể hiện phản xạ rất tốt trong vòng khởi động đầu tiên!
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
            <span className="text-xs uppercase text-slate-400 font-semibold">Số câu trả lời đúng</span>
            <p className="text-3xl font-black text-emerald-400 mt-1">{correctCount} / {maxQuestions}</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
            <span className="text-xs uppercase text-slate-400 font-semibold">Điểm số giành được</span>
            <p className="text-3xl font-black text-amber-400 mt-1">+{earnedPoints}</p>
          </div>
        </div>

        <button
          onClick={() => onComplete(earnedPoints)}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-base"
        >
          <span>Tiến Vào Vòng Vượt Chướng Ngại Vật</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Round Indicator & Timer Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 px-5 py-3 rounded-xl border border-amber-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-md uppercase border border-amber-500/30">
            Vòng 1: Khởi Động
          </span>
          <span className="text-xs text-slate-400">
            Câu {currentIndex + 1} / {maxQuestions}
          </span>
          <span className="text-xs text-amber-400/90 font-medium hidden sm:inline">
            • {currentQ.category}
          </span>
        </div>

        {/* Circular Countdown Timer */}
        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${timeLeft <= 2 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
          <span className={`text-2xl font-black font-mono ${timeLeft <= 2 ? 'text-rose-400' : 'text-amber-300'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="olympia-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="mb-2">
          <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
            {currentQ.category || 'Kiến thức chung'}
          </span>
        </div>

        <h3 className="text-lg md:text-2xl font-bold text-slate-100 leading-relaxed min-h-[4rem]">
          {currentQ.question}
        </h3>

        {/* Result banner if submitted */}
        {isAnswerSubmitted && (
          <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
            lastResult === 'correct'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            {lastResult === 'correct' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm md:text-base">
                {lastResult === 'correct' ? 'CHÍNH XÁC! (+10 Điểm)' : 'CHƯA CHÍNH XÁC!'}
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

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isAnswerSubmitted}
            placeholder="Nhập câu trả lời của bạn..."
            autoFocus
            className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-amber-400 text-slate-100 px-4 py-3 rounded-xl text-base outline-none transition-all placeholder:text-slate-500 disabled:opacity-50"
          />

          {!isAnswerSubmitted ? (
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!userAnswer.trim()}
                className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                Trả lời
              </button>
              <button
                type="button"
                onClick={handleTimeOut}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-sm font-semibold transition-all"
              >
                Bỏ qua
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 >= maxQuestions ? 'Xem Kết Quả' : 'Câu Tiếp Theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OlympiaQuestion } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { FastForward, Timer, ArrowRight, CheckCircle2, XCircle, Award, Zap } from 'lucide-react';

interface RoundTTProps {
  questions: OlympiaQuestion[];
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundTT({ questions, onComplete, onScoreUpdate }: RoundTTProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; points: number; timeSpent: number } | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = Math.min(questions.length, 4);

  useEffect(() => {
    soundManager.play('/audio/tt/StartRound.mp3');
  }, []);

  useEffect(() => {
    if (isAnswerSubmitted || isRoundFinished) return;

    const initialTime = currentQ.time_limit || (currentIndex < 2 ? 20 : 30);
    setTimeLeft(initialTime);
    startTimeRef.current = Date.now();

    if (initialTime === 20) {
      soundManager.play('/audio/tt/20Seconds.mp3');
    } else {
      soundManager.play('/audio/tt/30Seconds.mp3');
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
    soundManager.play('/audio/tt/Wrong.mp3');
    setLastResult({ isCorrect: false, points: 0, timeSpent: currentQ.time_limit || 20 });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const normInput = normalizeText(userAnswer);
    const normAns = normalizeText(currentQ.answer);

    const isMatch = normInput.length > 0 && (normAns.includes(normInput) || normInput.includes(normAns));

    setIsAnswerSubmitted(true);

    if (isMatch) {
      // Speed bonus:
      // Answered under 5s: +40 points
      // Answered under 10s: +30 points
      // Answered under 15s: +20 points
      // Later: +10 points
      let points = 40;
      if (elapsedSeconds > 15) points = 10;
      else if (elapsedSeconds > 10) points = 20;
      else if (elapsedSeconds > 5) points = 30;

      soundManager.play('/audio/tt/Correct.mp3');
      setLastResult({ isCorrect: true, points, timeSpent: elapsedSeconds });
      setEarnedPoints((prev) => prev + points);
      onScoreUpdate(points);
    } else {
      soundManager.play('/audio/tt/Wrong.mp3');
      setLastResult({ isCorrect: false, points: 0, timeSpent: elapsedSeconds });
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
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
          <Zap className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-300 uppercase tracking-wider mb-2">
          Hoàn Thành Phần Thi Tăng Tốc
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Bạn đã thể hiện tốc độ tư duy và phản ứng vô cùng nhạy bén!
        </p>

        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700/50 mb-8">
          <span className="text-xs uppercase text-slate-400 font-semibold">Tổng điểm tăng tốc</span>
          <p className="text-4xl font-black text-amber-400 mt-1">+{earnedPoints}</p>
        </div>

        <button
          onClick={() => onComplete(earnedPoints)}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-base"
        >
          <span>Tiến Vào Vòng Về Đích Quyết Định</span>
          <ArrowRight className="w-5 h-5" />
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
            Vòng 3: Tăng Tốc
          </span>
          <span className="text-xs text-slate-400">
            Câu {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs text-amber-400/90 font-medium hidden sm:inline">
            • {currentQ.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
          <span className={`text-2xl font-black font-mono ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-300'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="olympia-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="mb-2">
          <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
            {currentQ.category} (Điểm tối đa: +40)
          </span>
        </div>

        <h3 className="text-lg md:text-2xl font-bold text-slate-100 leading-relaxed min-h-[4rem]">
          {currentQ.question}
        </h3>

        {/* Options list if available */}
        {currentQ.metadata?.options && (
          <div className="my-4 grid grid-cols-2 gap-2">
            {currentQ.metadata.options.map((opt: string, i: number) => (
              <div key={i} className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-sm font-semibold text-slate-200">
                {opt}
              </div>
            ))}
          </div>
        )}

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
                  ? `CHÍNH XÁC! Bạn trả lời trong ${lastResult.timeSpent}s (+${lastResult.points} Điểm)`
                  : 'CHƯA CHÍNH XÁC!'}
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

        {/* Answer input */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={isAnswerSubmitted}
            placeholder="Gõ đáp án thật nhanh..."
            autoFocus
            className="flex-1 bg-slate-900/90 border border-slate-700 focus:border-amber-400 text-slate-100 px-4 py-3 rounded-xl text-base outline-none transition-all placeholder:text-slate-500 disabled:opacity-50"
          />

          {!isAnswerSubmitted ? (
            <button
              type="submit"
              disabled={!userAnswer.trim()}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FastForward className="w-4 h-4" />
              <span>Gửi Ngay</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 >= totalQuestions ? 'Xem Điểm Tăng Tốc' : 'Câu Tiếp Theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

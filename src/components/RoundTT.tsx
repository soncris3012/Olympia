'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OlympiaQuestion } from '@/lib/types';
import { soundManager } from '@/lib/audio';
import { FastForward, Timer, ArrowRight, CheckCircle2, XCircle, Zap, RotateCcw, Send } from 'lucide-react';
import StagePodiums, { ContestantState } from './StagePodiums';

interface RoundTTProps {
  questions: OlympiaQuestion[];
  candidateName: string;
  onComplete: (earnedPoints: number) => void;
  onScoreUpdate: (points: number) => void;
}

export default function RoundTT({ questions, candidateName, onComplete, onScoreUpdate }: RoundTTProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // tenths of second (30.0s)
  const [initialTimeLimit, setInitialTimeLimit] = useState(30);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; points: number; timeSpent: number } | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  // Contestant answers simulation for broadcast comparison ribbon
  const [competitorAnswers, setCompetitorAnswers] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = Math.min(questions.length, 4);

  // The 4 questions time limits on VTV: 10s, 20s, 30s, 40s
  const questionTimes = [10, 20, 30, 40];
  const qTime = questionTimes[currentIndex] || 30;

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
    },
    {
      id: 'player-2',
      slot: 2,
      name: 'Nguyễn Minh Tuấn',
      school: 'THPT Chu Văn An - Hà Nội',
      avatar: '🧑‍🎓',
      score: Math.max(0, Math.floor(earnedPoints * 0.85 + (currentIndex * 15))),
    },
    {
      id: 'player-3',
      slot: 3,
      name: 'Lê Hoàng Mai',
      school: 'THPT Chuyên Lê Hồng Phong',
      avatar: '👩‍🎓',
      score: Math.max(0, Math.floor(earnedPoints * 0.9 + (currentIndex * 10))),
    },
    {
      id: 'player-4',
      slot: 4,
      name: 'Trần Quốc Bảo',
      school: 'THPT Quốc Học - Huế',
      avatar: '👨‍🎓',
      score: Math.max(0, Math.floor(earnedPoints * 0.7 + (currentIndex * 20))),
    },
  ];

  useEffect(() => {
    soundManager.play('/audio/tt/StartRound.mp3');
  }, []);

  useEffect(() => {
    if (isAnswerSubmitted || isRoundFinished) return;

    setInitialTimeLimit(qTime);
    setTimeLeft(qTime * 10);
    startTimeRef.current = Date.now();
    setCompetitorAnswers([]);

    // Play official VTV timer sounds
    if (qTime === 10) soundManager.play('/audio/tt/10Seconds.mp3');
    else if (qTime === 20) soundManager.play('/audio/tt/20Seconds.mp3');
    else if (qTime === 30) soundManager.play('/audio/tt/30Seconds.mp3');
    else soundManager.play('/audio/tt/40Seconds.mp3');

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
  }, [currentIndex, isAnswerSubmitted, isRoundFinished, qTime]);

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
    soundManager.play('/audio/tt/Wrong.mp3');
    setLastResult({ isCorrect: false, points: 0, timeSpent: qTime });
    generateCompetitors(qTime, false);
  };

  const generateCompetitors = (userTime: number, userCorrect: boolean) => {
    // Generate realistic competitors response times
    const list = [
      {
        name: candidateName || 'Bạn',
        answer: userAnswer.toUpperCase() || 'KHÔNG CÓ',
        time: userTime,
        correct: userCorrect,
        points: userCorrect ? (userTime < qTime * 0.4 ? 40 : userTime < qTime * 0.7 ? 30 : 20) : 0,
      },
      {
        name: 'Nguyễn Minh Tuấn',
        answer: currentQ.answer.split(' ')[0].toUpperCase(),
        time: Number((Math.random() * (qTime * 0.7) + 2).toFixed(2)),
        correct: true,
        points: 30,
      },
      {
        name: 'Lê Hoàng Mai',
        answer: currentQ.answer.split(' ')[0].toUpperCase(),
        time: Number((Math.random() * (qTime * 0.8) + 3).toFixed(2)),
        correct: true,
        points: 20,
      },
      {
        name: 'Trần Quốc Bảo',
        answer: 'ĐÁP ÁN B',
        time: Number((Math.random() * (qTime * 0.9) + 4).toFixed(2)),
        correct: false,
        points: 0,
      },
    ].sort((a, b) => a.time - b.time);

    setCompetitorAnswers(list);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswerSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSeconds = Number(((Date.now() - startTimeRef.current) / 1000).toFixed(2));
    const isMatch = checkAnswerMatch(userAnswer, currentQ.answer);

    setIsAnswerSubmitted(true);

    if (isMatch) {
      // Points based on speed ratio
      let points = 40;
      if (elapsedSeconds > qTime * 0.75) points = 10;
      else if (elapsedSeconds > qTime * 0.5) points = 20;
      else if (elapsedSeconds > qTime * 0.25) points = 30;

      soundManager.play('/audio/tt/Correct.mp3');
      setLastResult({ isCorrect: true, points, timeSpent: elapsedSeconds });
      setEarnedPoints((prev) => prev + points);
      onScoreUpdate(points);
      generateCompetitors(elapsedSeconds, true);
    } else {
      soundManager.play('/audio/tt/Wrong.mp3');
      setLastResult({ isCorrect: false, points: 0, timeSpent: elapsedSeconds });
      generateCompetitors(elapsedSeconds, false);
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
      setCompetitorAnswers([]);
    }
  };

  const appendChoice = (choice: string) => {
    if (isAnswerSubmitted) return;
    setUserAnswer((prev) => prev + choice);
  };

  const clearAnswer = () => {
    if (isAnswerSubmitted) return;
    setUserAnswer('');
  };

  if (isRoundFinished) {
    return (
      <div className="vtv-question-box rounded-3xl p-8 max-w-2xl mx-auto text-center border-amber-500/50 my-8 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 bg-amber-500/20 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-lg shadow-amber-500/40">
          <FastForward className="w-10 h-10 text-amber-300" />
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-wider mb-2">
          HOÀN THÀNH VÒNG TĂNG TỐC
        </h2>
        <p className="text-slate-300 text-sm md:text-base mb-6">
          Bạn vừa trải qua 4 câu hỏi bứt phá điểm số với tốc độ cao!
        </p>

        <div className="bg-[#050f2e]/90 p-5 rounded-xl border border-amber-500/40 shadow-inner max-w-sm mx-auto mb-8">
          <span className="text-xs uppercase text-amber-400/80 font-bold tracking-wider">Tổng điểm Tăng tốc đạt được</span>
          <p className="text-4xl font-black text-amber-400 mt-1 vtv-score-led">+{earnedPoints}</p>
        </div>

        <button
          onClick={() => onComplete(earnedPoints)}
          className="w-full py-4 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer"
        >
          <span>Tiến Vào Vòng Về Đích Quyết Định</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const timerPercent = (timeLeft / (qTime * 10)) * 100;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* 4 Contestant Stage Podiums */}
      <StagePodiums
        contestants={contestants}
        currentRoundName={`TĂNG TỐC • CÂU ${currentIndex + 1}/4 (${qTime} GIÂY - TỐI ĐA 40 ĐIỂM)`}
      />

      {/* Main Television Question Box */}
      <div className={`vtv-question-box rounded-2xl p-5 md:p-8 transition-all duration-300 ${
        lastResult?.isCorrect
          ? 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
          : lastResult && !lastResult.isCorrect
          ? 'border-rose-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
          : ''
      }`}>
        {/* Top Header Tag Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded vtv-badge shadow">
              TĂNG TỐC
            </span>
            <span className="px-2.5 py-1 bg-slate-900/90 text-amber-300 text-xs font-bold border border-slate-700 rounded">
              CÂU {currentIndex + 1} / 4
            </span>
            <span className="px-2.5 py-1 bg-blue-950 text-cyan-300 text-xs font-bold border border-cyan-500/30 rounded uppercase">
              {qTime} GIÂY (40 - 30 - 20 - 10 ĐIỂM)
            </span>
          </div>

          {/* TV Countdown Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-lg border border-slate-700">
            <Timer className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-spin' : 'text-amber-400'}`} />
            <span className={`text-xl font-black font-mono vtv-score-led ${isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {(timeLeft / 10).toFixed(1)}s
            </span>
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
        <div className="text-center my-4">
          <h2 className="text-lg md:text-2xl font-black text-slate-100 leading-snug tracking-wide max-w-3xl mx-auto drop-shadow-md">
            {currentQ.question}
          </h2>
        </div>

        {/* Question Media Image if available */}
        {currentQ.media_url && (
          <div className="my-4 max-w-md mx-auto rounded-xl overflow-hidden border border-amber-500/40 shadow-lg">
            <img src={currentQ.media_url} alt="Minh họa câu hỏi Tăng tốc" className="w-full h-auto object-cover max-h-64" />
          </div>
        )}

        {/* Quick Option Buttons [A] [B] [C] [D] for sequence questions */}
        {!isAnswerSubmitted && (
          <div className="my-5 p-3 rounded-xl bg-black/40 border border-slate-700/60 max-w-xl mx-auto">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 text-center uppercase tracking-wider">
              Nút chọn nhanh thứ tự / đáp án:
            </span>
            <div className="flex justify-center gap-2 sm:gap-3">
              {['A', 'B', 'C', 'D'].map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => appendChoice(letter)}
                  className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#0f2766] to-[#061338] border-2 border-cyan-400/50 hover:border-cyan-300 text-cyan-200 font-black text-lg shadow-md active:scale-95 transition-transform cursor-pointer"
                >
                  {letter}
                </button>
              ))}
              <button
                type="button"
                onClick={clearAnswer}
                className="px-3 h-12 rounded-xl bg-slate-800 border border-slate-600 text-slate-300 font-bold text-xs uppercase hover:bg-slate-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                title="Xóa lựa chọn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        )}

        {/* Result & Competitor Answer Ribbon */}
        {isAnswerSubmitted && competitorAnswers.length > 0 && (
          <div className="my-6 p-4 rounded-xl bg-[#03091e]/95 border border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <span className="text-xs uppercase font-black text-amber-300 tracking-wider">
                BẢNG SO TỐC ĐỘ THỜI GIAN TRUYỀN HÌNH VTV
              </span>
              <span className="text-xs text-yellow-300 font-bold">
                Đáp án chuẩn: <strong className="uppercase">{currentQ.answer}</strong>
              </span>
            </div>

            <div className="space-y-1.5">
              {competitorAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    item.name.includes(candidateName) || item.name === 'Bạn'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow'
                      : 'bg-black/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-slate-700">
                      {idx + 1}
                    </span>
                    <span>{item.name}</span>
                    <span className="text-yellow-400 px-2 py-0.5 rounded bg-black/60 font-mono text-[11px]">
                      {item.answer}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-300">{item.time.toFixed(2)}s</span>
                    <span className={`px-2 py-0.5 rounded font-black ${item.points > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-500'}`}>
                      +{item.points}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider shadow hover:from-amber-300 cursor-pointer"
              >
                Câu Tăng Tốc Tiếp Theo →
              </button>
            </div>
          </div>
        )}

        {/* Answer Input Bar */}
        {!isAnswerSubmitted && (
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập câu trả lời hoặc bấm các chữ cái..."
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

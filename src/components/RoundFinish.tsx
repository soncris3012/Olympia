'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Award, Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface RoundFinishProps {
  totalScore: number;
  breakdown: {
    kd: number;
    vcnv: number;
    tt: number;
    vd: number;
  };
  onRestart: () => void;
}

export default function RoundFinish({ totalScore, breakdown, onRestart }: RoundFinishProps) {
  useEffect(() => {
    soundManager.play('/audio/others/PointSummary.mp3');

    // Launch celebratory confetti fireworks
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#10b981'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#fbbf24', '#3b82f6', '#10b981'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="olympia-card rounded-3xl p-8 md:p-12 max-w-2xl mx-auto border-amber-500/50 glow-gold text-center relative overflow-hidden animate-fadeIn">
      {/* Laurel Wreath Icon */}
      <div className="relative w-28 h-28 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 blur-xl opacity-50 animate-pulse" />
        <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 flex items-center justify-center shadow-2xl">
          <div className="w-full h-full bg-[#071131] rounded-full flex items-center justify-center border border-amber-400/40">
            <Trophy className="w-14 h-14 text-yellow-300 drop-shadow" />
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-3">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>Vòng Nguyệt Quế Vinh Quang</span>
      </div>

      <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 uppercase tracking-wider mb-2">
        Chúc Mừng Nhà Leo Núi!
      </h2>

      <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto mb-8">
        Bạn đã xuất sắc vượt qua cả 4 chặng đua đầy thử thách để chạm tay tới đỉnh núi Olympia!
      </p>

      {/* Main Score Display */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30 max-w-md mx-auto mb-8 shadow-inner">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
          Tổng Điểm Chung Cuộc
        </span>
        <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mt-2">
          {totalScore}
        </div>
      </div>

      {/* Breakdown per round */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mb-8 text-left">
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Khởi động</span>
          <span className="text-lg font-black text-amber-300">+{breakdown.kd}</span>
        </div>
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">2. VCNV</span>
          <span className="text-lg font-black text-amber-300">+{breakdown.vcnv}</span>
        </div>
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Tăng tốc</span>
          <span className="text-lg font-black text-amber-300">+{breakdown.tt}</span>
        </div>
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Về đích</span>
          <span className="text-lg font-black text-amber-300">
            {breakdown.vd >= 0 ? `+${breakdown.vd}` : breakdown.vd}
          </span>
        </div>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="w-full max-w-sm py-4 px-6 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/30 transition-all inline-flex items-center justify-center gap-2 text-base uppercase tracking-wider"
      >
        <RotateCcw className="w-5 h-5" />
        <span>Chinh Phục Trận Mới</span>
      </button>
    </div>
  );
}

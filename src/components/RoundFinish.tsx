'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award, Sparkles, Star } from 'lucide-react';
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
    soundManager.play('/audio/others/EndSound.mp3');

    // Launch celebratory confetti fireworks
    const duration = 4.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#ef4444', '#10b981'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#ef4444', '#10b981'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="vtv-question-box rounded-3xl p-8 md:p-12 max-w-3xl mx-auto border-amber-500/60 shadow-2xl text-center relative overflow-hidden my-6">
      {/* Golden Laurel Wreath Trophy */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 blur-2xl opacity-60 animate-pulse" />
        <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 flex items-center justify-center shadow-2xl">
          <div className="w-full h-full bg-[#050f2e] rounded-full flex items-center justify-center border-2 border-amber-400">
            <Trophy className="w-16 h-16 text-yellow-300 drop-shadow-lg" />
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest mb-3">
        <Sparkles className="w-4 h-4 text-yellow-300" />
        <span>VÒNG NGUYỆT QUẾ VINH QUANG • TRƯỜNG QUAY S9</span>
      </div>

      <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 uppercase tracking-wider mb-2 drop-shadow-md">
        VINH DANH NHÀ LEO NÚI!
      </h2>

      <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto mb-8">
        Bạn đã vượt qua 4 đỉnh núi tri thức đầy gay cấn và thử thách của chương trình Đường lên đỉnh Olympia!
      </p>

      {/* Main Score Display Box */}
      <div className="bg-[#03091e]/90 rounded-2xl p-6 border-2 border-amber-500/50 max-w-sm mx-auto mb-8 shadow-inner">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
          TỔNG ĐIỂM CHUNG CUỘC
        </span>
        <div className="text-6xl md:text-7xl font-black text-amber-400 vtv-score-led mt-1">
          {totalScore}
        </div>
      </div>

      {/* Breakdown per round */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8 text-left">
        <div className="bg-[#050f2e]/80 p-3.5 rounded-xl border border-slate-700/60 shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Khởi động</span>
          <span className="text-xl font-black text-amber-300 vtv-score-led">+{breakdown.kd}</span>
        </div>
        <div className="bg-[#050f2e]/80 p-3.5 rounded-xl border border-slate-700/60 shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">2. VCNV</span>
          <span className="text-xl font-black text-amber-300 vtv-score-led">+{breakdown.vcnv}</span>
        </div>
        <div className="bg-[#050f2e]/80 p-3.5 rounded-xl border border-slate-700/60 shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Tăng tốc</span>
          <span className="text-xl font-black text-amber-300 vtv-score-led">+{breakdown.tt}</span>
        </div>
        <div className="bg-[#050f2e]/80 p-3.5 rounded-xl border border-slate-700/60 shadow">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Về đích</span>
          <span className="text-xl font-black text-amber-300 vtv-score-led">
            {breakdown.vd >= 0 ? `+${breakdown.vd}` : breakdown.vd}
          </span>
        </div>
      </div>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="w-full max-w-md py-4 px-8 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/40 transition-all inline-flex items-center justify-center gap-2 text-base uppercase tracking-wider cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" />
        <span>Chinh Phục Trận Thi Đấu Mới</span>
      </button>
    </div>
  );
}

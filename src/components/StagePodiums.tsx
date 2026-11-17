'use client';

import React from 'react';
import { Trophy, Star, Bell, Sparkles } from 'lucide-react';

export interface ContestantState {
  id: string;
  slot: number; // 1, 2, 3, 4
  name: string;
  school?: string;
  avatar: string;
  score: number;
  isActiveTurn?: boolean;
  hasStarOfHope?: boolean;
  isBuzzed?: boolean;
  isEliminated?: boolean;
}

interface StagePodiumsProps {
  contestants: ContestantState[];
  currentRoundName?: string;
}

export default function StagePodiums({ contestants, currentRoundName }: StagePodiumsProps) {
  // Border & accent colors for the 4 slots matching TV
  const slotStyles = [
    {
      badgeBg: 'bg-rose-600',
      borderColor: 'border-rose-500/60',
      activeBorder: 'border-rose-400',
      glow: 'shadow-rose-500/30',
      textColor: 'text-rose-400',
      avatarRing: 'ring-rose-500',
    },
    {
      badgeBg: 'bg-sky-600',
      borderColor: 'border-sky-500/60',
      activeBorder: 'border-sky-400',
      glow: 'shadow-sky-500/30',
      textColor: 'text-sky-400',
      avatarRing: 'ring-sky-500',
    },
    {
      badgeBg: 'bg-emerald-600',
      borderColor: 'border-emerald-500/60',
      activeBorder: 'border-emerald-400',
      glow: 'shadow-emerald-500/30',
      textColor: 'text-emerald-400',
      avatarRing: 'ring-emerald-500',
    },
    {
      badgeBg: 'bg-amber-600',
      borderColor: 'border-amber-500/60',
      activeBorder: 'border-amber-400',
      glow: 'shadow-amber-500/30',
      textColor: 'text-amber-400',
      avatarRing: 'ring-amber-500',
    },
  ];

  return (
    <div className="w-full my-4">
      {/* Studio Lighting Bar */}
      <div className="flex items-center justify-between px-3 py-1 mb-2 bg-[#03091e]/80 border-b border-amber-500/30 rounded-t-lg text-[11px] uppercase tracking-widest text-amber-300/80 font-bold">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>SÂN KHẤU TRƯỜNG QUAY S9 • 4 BỤC THI ĐẤU</span>
        </span>
        {currentRoundName && (
          <span className="text-yellow-400">
            {currentRoundName}
          </span>
        )}
      </div>

      {/* 4 Podiums Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {contestants.map((c, idx) => {
          const style = slotStyles[idx % slotStyles.length];
          const isActive = c.isActiveTurn;
          const isBuzzed = c.isBuzzed;

          return (
            <div
              key={c.id || idx}
              className={`vtv-podium relative p-2.5 sm:p-3 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
                isBuzzed
                  ? 'border-red-500 buzzer-active bg-red-950/40'
                  : isActive
                  ? `vtv-podium-active ${style.activeBorder} bg-gradient-to-b from-[#0b1f58] to-[#040e2d]`
                  : `${style.borderColor} hover:border-amber-400/50`
              }`}
            >
              {/* Overhead Spotlight Effect for Active Turn */}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-amber-400/30 blur-md rounded-full" />
              )}

              {/* Slot Number & Badges Header */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`${style.badgeBg} text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded vtv-badge tracking-wider`}
                >
                  VỊ TRÍ {c.slot || idx + 1}
                </span>

                <div className="flex items-center gap-1">
                  {c.hasStarOfHope && (
                    <span
                      title="Đang kích hoạt Ngôi sao hy vọng"
                      className="flex items-center text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-400/60 animate-pulse"
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-300 mr-0.5" />
                      NSHV
                    </span>
                  )}
                  {isBuzzed && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-bounce">
                      <Bell className="w-2.5 h-2.5" /> CHUÔNG
                    </span>
                  )}
                </div>
              </div>

              {/* Contestant Name & Avatar */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 flex items-center justify-center text-base sm:text-lg border ${style.avatarRing} shadow-md overflow-hidden shrink-0`}>
                  {c.avatar || '👨‍🎓'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate leading-snug">
                    {c.name}
                  </h4>
                  {c.school && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {c.school}
                    </p>
                  )}
                </div>
              </div>

              {/* Score Display Box */}
              <div className="mt-1 pt-1.5 border-t border-slate-700/60 flex items-center justify-between bg-black/40 px-2.5 py-1 rounded">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  ĐIỂM SỐ
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 vtv-score-led">
                  {c.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

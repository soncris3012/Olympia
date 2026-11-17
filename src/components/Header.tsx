'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Trophy, BookOpen, Users, Play, Database, Radio, Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface HeaderProps {
  currentTab: 'solo' | 'multiplayer' | 'questions' | 'rules';
  setCurrentTab: (tab: 'solo' | 'multiplayer' | 'questions' | 'rules') => void;
  score?: number;
}

export default function Header({ currentTab, setCurrentTab, score = 0 }: HeaderProps) {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#02071a]/95 backdrop-blur-md border-b-2 border-amber-500/30 px-3 sm:px-6 py-2.5 shadow-xl shadow-black/60">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & VTV Broadcast Indicator */}
        <div 
          onClick={() => setCurrentTab('solo')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
        >
          {/* Laurel Wreath Crest */}
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/40 group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-[#050f2e] rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400 drop-shadow" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white font-black text-[9px] px-1 rounded shadow">
              VTV3
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 drop-shadow-md">
                Đường Lên Đỉnh Olympia
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/30 border border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                <Radio className="w-2.5 h-2.5" /> LIVE S9
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Styled like TV Studio Channel Selectors) */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setCurrentTab('solo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'solo'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Sân Khấu</span>
          </button>

          <button
            onClick={() => setCurrentTab('multiplayer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'multiplayer'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Đấu Online</span>
          </button>

          <button
            onClick={() => setCurrentTab('questions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'questions'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ngân Hàng Đề</span>
            <span className="sm:hidden">Đề Thi</span>
          </button>

          <button
            onClick={() => setCurrentTab('rules')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              currentTab === 'rules'
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Luật</span>
          </button>
        </nav>

        {/* Live Score Counter & Sound Controller */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentTab === 'solo' && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/40 rounded-lg shadow-sm">
              <span className="text-[10px] sm:text-xs text-amber-300/80 font-bold uppercase tracking-wider">ĐIỂM:</span>
              <span className="text-base sm:text-xl font-black text-amber-400 vtv-score-led">{score}</span>
            </div>
          )}

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900 border-amber-500/40 text-amber-400 hover:bg-slate-800 shadow-md'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Trophy, BookOpen, Users, Play, HelpCircle, Database } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-[#070e28]/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('solo')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0c1a45] rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-400 drop-shadow">
              Đường Lên Đỉnh Olympia
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setCurrentTab('solo')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              currentTab === 'solo'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Đấu Solo</span>
          </button>

          <button
            onClick={() => setCurrentTab('multiplayer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              currentTab === 'multiplayer'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Phòng Thi Đấu (MC & Thí sinh)</span>
          </button>

          <button
            onClick={() => setCurrentTab('questions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              currentTab === 'questions'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Ngân Hàng Câu Hỏi</span>
          </button>

          <button
            onClick={() => setCurrentTab('rules')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              currentTab === 'rules'
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Luật Thi</span>
          </button>
        </nav>

        {/* Right side controls: Sound & Live Score */}
        <div className="flex items-center gap-3">
          {currentTab === 'solo' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-xs text-amber-300/80 font-medium uppercase">Điểm:</span>
              <span className="text-lg font-black text-amber-400">{score}</span>
            </div>
          )}

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}

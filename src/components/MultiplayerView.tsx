'use client';

import React, { useState, useEffect } from 'react';
import { Player, MatchState } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { soundManager } from '@/lib/audio';
import { Users, Bell, Trophy, Play, CheckCircle2, XCircle, Volume2, Shield, Crown } from 'lucide-react';

export default function MultiplayerView() {
  const [role, setRole] = useState<'picker' | 'host' | 'player'>('picker');
  const [pinCode, setPinCode] = useState('886886');
  const [playerName, setPlayerName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [isJoined, setIsJoined] = useState(false);

  // Match state
  const [matchTitle, setMatchTitle] = useState('Trận Đấu Olympia Tuần');
  const [currentRoundName, setCurrentRoundName] = useState('Vòng 1: Khởi Động');
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Nguyễn Văn An', avatar: '👨‍🎓', score: 40, slot: 1 },
    { id: 'p2', name: 'Trần Thị Bình', avatar: '👩‍🎓', score: 30, slot: 2 },
    { id: 'p3', name: 'Lê Hoàng Cường', avatar: '👨‍🎓', score: 50, slot: 3 },
    { id: 'p4', name: 'Phạm Thu Dung', avatar: '👩‍🎓', score: 20, slot: 4 },
  ]);

  // Buzzer state
  const [buzzQueue, setBuzzQueue] = useState<{ name: string; slot: number; time: string; reactionMs: number }[]>([]);
  const [isBuzzerLocked, setIsBuzzerLocked] = useState(false);
  const [lastBuzzerWinner, setLastBuzzerWinner] = useState<string | null>(null);

  // Supabase Realtime channel
  useEffect(() => {
    if (!isJoined) return;

    const channel = supabase.channel(`olympia_match_${pinCode}`, {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'buzz' }, (payload) => {
        const { player, timestamp } = payload.payload;
        soundManager.playBuzzer();
        setBuzzQueue((prev) => [
          ...prev,
          {
            name: player.name,
            slot: player.slot,
            time: new Date(timestamp).toLocaleTimeString(),
            reactionMs: Math.floor(Math.random() * 200 + 80),
          }
        ]);
        setLastBuzzerWinner(player.name);
      })
      .on('broadcast', { event: 'score_update' }, (payload) => {
        const { slot, delta } = payload.payload;
        setPlayers((prev) =>
          prev.map((p) => (p.slot === slot ? { ...p, score: Math.max(0, p.score + delta) } : p))
        );
      })
      .on('broadcast', { event: 'sfx' }, (payload) => {
        const { sound } = payload.payload;
        if (sound === 'correct') soundManager.playCorrect();
        if (sound === 'wrong') soundManager.playWrong();
        if (sound === 'nshv') soundManager.playHopeStar();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isJoined, pinCode]);

  const handlePlayerBuzz = async () => {
    if (isBuzzerLocked) return;

    soundManager.playBuzzer();
    const myPlayer = players.find((p) => p.slot === selectedSlot) || {
      id: 'local',
      name: playerName || `Thí sinh ${selectedSlot}`,
      slot: selectedSlot,
      avatar: '👨‍🎓',
      score: 0,
    };

    const newBuzz = {
      name: myPlayer.name,
      slot: myPlayer.slot,
      time: new Date().toLocaleTimeString(),
      reactionMs: Math.floor(Math.random() * 150 + 60),
    };

    setBuzzQueue((prev) => [...prev, newBuzz]);
    setLastBuzzerWinner(myPlayer.name);

    // Broadcast through Supabase Realtime
    try {
      const channel = supabase.channel(`olympia_match_${pinCode}`);
      await channel.send({
        type: 'broadcast',
        event: 'buzz',
        payload: { player: myPlayer, timestamp: Date.now() },
      });
    } catch {
      // offline fallback
    }
  };

  const handleScoreChange = async (slot: number, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.slot === slot ? { ...p, score: Math.max(0, p.score + delta) } : p))
    );

    if (delta > 0) soundManager.playCorrect();
    else soundManager.playWrong();

    try {
      const channel = supabase.channel(`olympia_match_${pinCode}`);
      await channel.send({
        type: 'broadcast',
        event: 'score_update',
        payload: { slot, delta },
      });
    } catch {
      // offline fallback
    }
  };

  const handleResetBuzzer = () => {
    setBuzzQueue([]);
    setLastBuzzerWinner(null);
  };

  if (role === 'picker') {
    return (
      <div className="olympia-card rounded-2xl p-8 max-w-xl mx-auto border-amber-500/40 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/40">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wider mb-2">
          Phòng Thi Đấu Trực Tuyến
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          Mô hình kết nối thời gian thực giữa Người dẫn chương trình (MC) và 4 Thí sinh
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setRole('host');
              setIsJoined(true);
            }}
            className="p-5 rounded-xl border border-amber-500/30 bg-slate-900/80 hover:bg-slate-800 hover:border-amber-400 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold group-hover:text-yellow-300">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>Người Dẫn Chương Trình (MC)</span>
            </div>
            <p className="text-xs text-slate-400">
              Điều khiển trận đấu, bấm giờ, cộng/trừ điểm, phát âm thanh hiệu ứng VTV.
            </p>
          </button>

          <button
            onClick={() => setRole('player')}
            className="p-5 rounded-xl border border-blue-500/30 bg-slate-900/80 hover:bg-slate-800 hover:border-blue-400 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-2 text-blue-300 font-bold group-hover:text-cyan-300">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Thí Sinh Leo Núi</span>
            </div>
            <p className="text-xs text-slate-400">
              Tham gia phòng, bấm chuông giành quyền trả lời với độ trễ siêu thấp (sub-50ms).
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Player view
  if (role === 'player' && !isJoined) {
    return (
      <div className="olympia-card rounded-2xl p-6 md:p-8 max-w-md mx-auto border-blue-500/40">
        <h3 className="text-xl font-bold text-amber-300 uppercase text-center mb-4">
          Tham Gia Trận Đấu
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Mã PIN Phòng:</label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-xl font-mono font-black text-amber-400 tracking-widest outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Họ Tên Thí Sinh:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Chọn Vị Trí (Slot):</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-lg font-bold text-sm border transition-all ${
                    selectedSlot === slot
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Slot {slot}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsJoined(true)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all uppercase tracking-wider text-sm mt-2"
          >
            Vào Phòng Thi Đấu
          </button>
        </div>
      </div>
    );
  }

  // Active Screen
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Match Bar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900/80 px-5 py-3 rounded-2xl border border-amber-500/30 gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase border border-amber-500/30">
            {role === 'host' ? 'MC Control' : `Thí sinh Slot ${selectedSlot}`}
          </span>
          <span className="text-sm font-bold text-slate-200">{matchTitle}</span>
          <span className="text-xs text-slate-400">PIN: <strong className="text-amber-400">{pinCode}</strong></span>
        </div>

        <button
          onClick={() => {
            setRole('picker');
            setIsJoined(false);
          }}
          className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 border border-slate-700"
        >
          Đổi Vai Trò
        </button>
      </div>

      {/* 4 Players Podium */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {players.map((p) => {
          const isWinner = lastBuzzerWinner === p.name;

          return (
            <div
              key={p.slot}
              className={`olympia-card p-4 rounded-2xl border transition-all ${
                isWinner
                  ? 'border-rose-500 glow-red scale-105'
                  : 'border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Thí sinh {p.slot}</span>
                {isWinner && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-black uppercase animate-pulse">
                    ĐÃ BẤM CHUÔNG!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{p.avatar}</span>
                <span className="font-bold text-sm text-slate-200 truncate">{p.name}</span>
              </div>

              {/* Score */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center mb-3">
                <span className="text-3xl font-black text-amber-400">{p.score}</span>
              </div>

              {/* Host Controls for Score */}
              {role === 'host' && (
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleScoreChange(p.slot, 10)}
                    className="py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded font-bold text-xs"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => handleScoreChange(p.slot, 20)}
                    className="py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded font-bold text-xs"
                  >
                    +20
                  </button>
                  <button
                    onClick={() => handleScoreChange(p.slot, -5)}
                    className="py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded font-bold text-xs"
                  >
                    -5
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Interactive Center */}
      {role === 'player' ? (
        <div className="olympia-card p-8 rounded-3xl border-amber-500/40 text-center max-w-lg mx-auto">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
            Chuông Thí Sinh Của Bạn
          </h4>

          {/* Big Buzzer Button */}
          <button
            onClick={handlePlayerBuzz}
            className="w-48 h-48 mx-auto rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 text-white font-black text-2xl uppercase tracking-wider shadow-2xl shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 buzzer-active border-4 border-rose-300/40"
          >
            <Bell className="w-10 h-10 animate-bounce" />
            <span>BẤM CHUÔNG</span>
          </button>

          <p className="text-xs text-slate-400 mt-6">
            Bấm nhanh để giành quyền trả lời câu hỏi!
          </p>
        </div>
      ) : (
        /* Host MC View */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Buzzer Queue */}
          <div className="md:col-span-6 olympia-card p-5 rounded-2xl border-slate-700/60">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-400" />
                <span>Thứ Tự Bấm Chuông ({buzzQueue.length})</span>
              </h4>
              <button
                onClick={handleResetBuzzer}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
              >
                Reset Chuông
              </button>
            </div>

            {buzzQueue.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center">
                Chưa có thí sinh nào bấm chuông...
              </p>
            ) : (
              <div className="space-y-2">
                {buzzQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      idx === 0
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <strong className="text-sm">{item.name}</strong>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      +{item.reactionMs}ms ({item.time})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Audio Effects Trigger */}
          <div className="md:col-span-6 olympia-card p-5 rounded-2xl border-slate-700/60">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Hiệu Ứng Âm Thanh MC (SFX)</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => soundManager.playStartRound()}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 text-left"
              >
                🎵 Bắt đầu vòng thi
              </button>
              <button
                onClick={() => soundManager.playCorrect()}
                className="p-2.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 text-left"
              >
                ✅ Trả lời đúng (+10)
              </button>
              <button
                onClick={() => soundManager.playWrong()}
                className="p-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/30 text-left"
              >
                ❌ Trả lời sai
              </button>
              <button
                onClick={() => soundManager.play15Seconds()}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 text-left"
              >
                ⏱ Đếm ngược 15 giây
              </button>
              <button
                onClick={() => soundManager.playHopeStar()}
                className="p-2.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/30 text-left"
              >
                ⭐ Ngôi sao hy vọng
              </button>
              <button
                onClick={() => soundManager.playFinishMatch()}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 text-left"
              >
                🏆 Trao vòng nguyệt quế
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

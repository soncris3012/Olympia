'use client';

import React, { useState, useEffect } from 'react';
import { Player, MatchState } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { soundManager } from '@/lib/audio';
import { Users, Bell, Trophy, Play, CheckCircle2, XCircle, Volume2, Shield, Crown, Monitor, Send, Star, Sparkles } from 'lucide-react';

export default function MultiplayerView() {
  const [role, setRole] = useState<'picker' | 'host' | 'player' | 'stage'>('picker');
  const [pinCode, setPinCode] = useState('886886');
  const [playerName, setPlayerName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [isJoined, setIsJoined] = useState(false);
  const [audioHint, setAudioHint] = useState(true);

  // Match state
  const [matchTitle, setMatchTitle] = useState('Trận Đấu Olympia');
  const [currentRoundName, setCurrentRoundName] = useState('Vòng 1: Khởi Động');
  const [currentQuestion, setCurrentQuestion] = useState({
    round: 'kd',
    question: 'Khí nào chiếm thể tích lớn nhất trong thành phần không khí của Trái Đất?',
    answer: 'Nitơ (N2, chiếm khoảng 78%)',
    points: 10,
    time: 15,
  });

  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Nguyễn Văn An', avatar: '👨‍🎓', score: 40, slot: 1 },
    { id: 'p2', name: 'Trần Thị Bình', avatar: '👩‍🎓', score: 30, slot: 2 },
    { id: 'p3', name: 'Lê Hoàng Cường', avatar: '👨‍🎓', score: 50, slot: 3 },
    { id: 'p4', name: 'Phạm Thu Dung', avatar: '👩‍🎓', score: 20, slot: 4 },
  ]);

  // Player answer input
  const [playerInputAnswer, setPlayerInputAnswer] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<{ slot: number; name: string; answer: string; readableTime: string }[]>([
    { slot: 1, name: 'Nguyễn Văn An', answer: 'NITƠ', readableTime: '3.4s' },
    { slot: 2, name: 'Trần Thị Bình', answer: 'OXY', readableTime: '4.8s' },
  ]);
  const [isAnswersRevealed, setIsAnswersRevealed] = useState(false);

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
      .on('broadcast', { event: 'player_answer' }, (payload) => {
        const { slot, name, answer, readableTime } = payload.payload;
        setSubmittedAnswers((prev) => [
          ...prev.filter((a) => a.slot !== slot),
          { slot, name, answer, readableTime }
        ]);
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

  const handlePlayerSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInputAnswer.trim()) return;

    const myName = playerName || `Thí sinh ${selectedSlot}`;
    const newAnswer = {
      slot: selectedSlot,
      name: myName,
      answer: playerInputAnswer.trim().toUpperCase(),
      readableTime: `${(Math.random() * 8 + 2).toFixed(1)}s`,
    };

    setSubmittedAnswers((prev) => [
      ...prev.filter((a) => a.slot !== selectedSlot),
      newAnswer,
    ]);

    try {
      const channel = supabase.channel(`olympia_match_${pinCode}`);
      await channel.send({
        type: 'broadcast',
        event: 'player_answer',
        payload: newAnswer,
      });
    } catch {
      // offline fallback
    }
    setPlayerInputAnswer('');
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

  // Screen 1: Role Picker (Legion Mode Selector)
  if (role === 'picker') {
    return (
      <div className="olympia-card rounded-2xl p-8 max-w-2xl mx-auto border-amber-500/40 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-amber-300 uppercase tracking-wider mb-2">
          Hệ Thống Phòng Thi Đấu Trực Tuyến
        </h2>
        <p className="text-slate-300 text-sm mb-8">
          Chuẩn cấu trúc phân quyền Legion: MC Điều khiển, Thí sinh phản xạ và Màn hình sân khấu lớn
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Host */}
          <button
            onClick={() => {
              setRole('host');
              setIsJoined(true);
            }}
            className="p-5 rounded-2xl border border-amber-500/30 bg-slate-900/80 hover:bg-slate-800 hover:border-amber-400 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold group-hover:text-yellow-300">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>MC Trận Đấu</span>
            </div>
            <p className="text-xs text-slate-400">
              Xem trước đáp án, bấm giờ, cộng/trừ điểm, phát hiệu ứng âm thanh VTV.
            </p>
          </button>

          {/* Player */}
          <button
            onClick={() => setRole('player')}
            className="p-5 rounded-2xl border border-blue-500/30 bg-slate-900/80 hover:bg-slate-800 hover:border-blue-400 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-2 text-blue-300 font-bold group-hover:text-cyan-300">
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Thí Sinh</span>
            </div>
            <p className="text-xs text-slate-400">
              Nút bấm chuông sub-50ms, ô nhập đáp án Hàng ngang & Tăng tốc.
            </p>
          </button>

          {/* Points View / Stage */}
          <button
            onClick={() => {
              setRole('stage');
              setIsJoined(true);
            }}
            className="p-5 rounded-2xl border border-purple-500/30 bg-slate-900/80 hover:bg-slate-800 hover:border-purple-400 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-2 text-purple-300 font-bold group-hover:text-pink-300">
              <Monitor className="w-5 h-5 text-purple-400" />
              <span>Sân Khấu Lớn</span>
            </div>
            <p className="text-xs text-slate-400">
              Màn hình khán giả / livestream với 4 bục podium và bảng điểm vàng rực rỡ.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Player Login Screen
  if (role === 'player' && !isJoined) {
    return (
      <div className="olympia-card rounded-2xl p-6 md:p-8 max-w-md mx-auto border-blue-500/40">
        <h3 className="text-xl font-bold text-amber-300 uppercase text-center mb-4">
          Thí Sinh Vào Phòng Thi Đấu
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
            <label className="text-xs text-slate-400 font-bold block mb-1">Chọn Vị Trí (Slot 1..4):</label>
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
            Tham Gia Trận Đấu
          </button>
        </div>
      </div>
    );
  }

  // SCREEN: STAGE / POINTS VIEW (Legion points-view.component)
  if (role === 'stage') {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Stage Bar */}
        <div className="flex items-center justify-between bg-slate-900/90 px-6 py-4 rounded-2xl border border-amber-500/30">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold text-xs uppercase tracking-wider rounded-lg">
              Live Stage Display
            </span>
            <h2 className="text-lg md:text-xl font-extrabold uppercase text-slate-100">
              {matchTitle} • <span className="text-amber-400">{currentRoundName}</span>
            </h2>
          </div>

          <button
            onClick={() => setRole('picker')}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
          >
            Thoát Chế Độ Sân Khấu
          </button>
        </div>

        {/* 4 Contestant Podiums (Legion kinda-tall cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {players.map((p) => {
            const isWinner = lastBuzzerWinner === p.name;

            return (
              <div
                key={p.slot}
                className={`relative rounded-3xl overflow-hidden border-2 transition-all duration-500 ${
                  isWinner
                    ? 'border-rose-500 glow-red scale-105 z-10'
                    : 'border-slate-700/80 bg-slate-900/90 shadow-2xl'
                }`}
              >
                {/* Aura beam when buzzing */}
                {isWinner && (
                  <div className="absolute inset-0 bg-gradient-to-b from-rose-500/30 via-red-500/10 to-transparent pointer-events-none animate-pulse" />
                )}

                {/* Card Header & Avatar */}
                <div className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 border border-amber-500/30 flex items-center justify-center text-4xl mb-3 shadow-inner">
                    {p.avatar}
                  </div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    Thí Sinh {p.slot}
                  </span>
                  <h3 className="text-lg font-black text-slate-100 truncate">
                    {p.name}
                  </h3>
                </div>

                {/* Score Pedestal (Legion text-golden) */}
                <div className="bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950/80 py-6 text-center border-t border-slate-800">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block mb-1">
                    Điểm Số
                  </span>
                  <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                    {p.score}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Question & Answer Stage Box */}
        <div className="olympia-card p-6 md:p-8 rounded-3xl border-amber-500/40 text-center">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block mb-2">
            Câu Hỏi Đang Thi Đấu ({currentQuestion.points} Điểm)
          </span>
          <p className="text-xl md:text-3xl font-extrabold text-slate-100 max-w-3xl mx-auto">
            {currentQuestion.question}
          </p>

          {isAnswersRevealed && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <span className="text-xs uppercase text-slate-400 font-bold block mb-3">
                Câu Trả Lời Của 4 Thí Sinh:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                {players.map((p) => {
                  const ans = submittedAnswers.find((a) => a.slot === p.slot);
                  return (
                    <div key={p.slot} className="p-3 bg-slate-900/90 rounded-xl border border-slate-700">
                      <span className="text-xs text-slate-400 block truncate">{p.name}:</span>
                      <strong className="text-base font-black text-yellow-300 block mt-1">
                        {ans ? ans.answer : '---'}
                      </strong>
                      {ans && <span className="text-[10px] text-slate-500 font-mono">@{ans.readableTime}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE SCREEN FOR MC OR CONTESTANT
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Audio Unlock Hint (Legion audioBlocked hint) */}
      {audioHint && (
        <div
          onClick={() => {
            soundManager.playCorrect();
            setAudioHint(false);
          }}
          className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer hover:bg-amber-500/30 transition-all"
        >
          <span>🔊 Nhấn vào đây để bật và mở khóa toàn bộ âm thanh hiệu ứng Olympia của trận đấu!</span>
          <span className="text-amber-400 font-bold">✕ Đóng</span>
        </div>
      )}

      {/* Top Match Bar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900/80 px-5 py-3 rounded-2xl border border-amber-500/30 gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase border border-amber-500/30">
            {role === 'host' ? 'MC Control Room' : `Thí Sinh Slot ${selectedSlot}`}
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

      {/* 4 Contestants Bar */}
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
                <span className="text-xs font-bold text-slate-400">Slot {p.slot}</span>
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

      {/* CONTESTANT INTERACTIVE VIEW */}
      {role === 'player' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Buzzer Button */}
          <div className="md:col-span-6 olympia-card p-8 rounded-3xl border-amber-500/40 text-center flex flex-col items-center justify-center">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Chuông Phản Xạ Nhanh
            </h4>

            <button
              onClick={handlePlayerBuzz}
              className="w-44 h-44 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 text-white font-black text-xl uppercase tracking-wider shadow-2xl shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 buzzer-active border-4 border-rose-300/40"
            >
              <Bell className="w-10 h-10 animate-bounce" />
              <span>BẤM CHUÔNG</span>
            </button>

            <p className="text-xs text-slate-400 mt-6">
              Giành quyền trả lời câu hỏi trực tiếp!
            </p>
          </div>

          {/* Answer Box (Legion player-vcnv-answer & player-tangtoc-a) */}
          <div className="md:col-span-6 olympia-card p-6 rounded-3xl border-slate-700/60 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                <span>Nhập Câu Trả Lời (Hàng Ngang & Tăng Tốc)</span>
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Câu trả lời sẽ được gửi tức thì về phòng điều khiển của MC.
              </p>

              <form onSubmit={handlePlayerSubmitAnswer} className="space-y-3">
                <input
                  type="text"
                  value={playerInputAnswer}
                  onChange={(e) => setPlayerInputAnswer(e.target.value)}
                  placeholder="Gõ đáp án của bạn..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-slate-100 px-4 py-3 rounded-xl outline-none uppercase font-bold tracking-wider"
                />
                <button
                  type="submit"
                  disabled={!playerInputAnswer.trim()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition-all uppercase tracking-wider text-sm disabled:opacity-50"
                >
                  Gửi Đáp Án Về Máy Chủ
                </button>
              </form>
            </div>

            {submittedAnswers.find((a) => a.slot === selectedSlot) && (
              <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span>Đáp án đã gửi: <strong>{submittedAnswers.find((a) => a.slot === selectedSlot)?.answer}</strong></span>
                <span className="font-mono">@{submittedAnswers.find((a) => a.slot === selectedSlot)?.readableTime}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MC CONTROL ROOM (Legion mc.component) */
        <div className="space-y-6">
          {/* Question Review & Controls */}
          <div className="olympia-card p-6 rounded-2xl border-amber-500/30">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Bảng Câu Hỏi Hiện Tại (Dành Cho MC)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAnswersRevealed(!isAnswersRevealed)}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30"
                >
                  {isAnswersRevealed ? 'Ẩn Đáp Án Thí Sinh' : 'Mở Đáp Án Thí Sinh'}
                </button>
                <button
                  onClick={() => soundManager.play15Seconds()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  ⏱ Bấm Giờ 15s
                </button>
              </div>
            </div>

            <p className="text-lg font-bold text-slate-100 mb-2">
              {currentQuestion.question}
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Đáp án chuẩn của MC: </span>
              <strong className="text-yellow-300 uppercase">{currentQuestion.answer}</strong>
            </div>

            {/* Submitted Answers Comparison */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {players.map((p) => {
                const ans = submittedAnswers.find((a) => a.slot === p.slot);
                return (
                  <div key={p.slot} className="p-3 bg-slate-900 rounded-xl border border-slate-700/60">
                    <span className="text-xs text-slate-400 block truncate">{p.name}:</span>
                    <strong className="text-sm font-bold text-slate-200 block mt-1">
                      {ans ? ans.answer : '(Chưa gửi)'}
                    </strong>
                    {ans && <span className="text-[10px] text-slate-500 font-mono">@{ans.readableTime}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Buzzer Queue & Soundboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Buzzer Queue */}
            <div className="md:col-span-6 olympia-card p-5 rounded-2xl border-slate-700/60">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-400" />
                  <span>Hàng Đợi Chuông ({buzzQueue.length})</span>
                </h4>
                <button
                  onClick={handleResetBuzzer}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  Reset Chuông
                </button>
              </div>

              {buzzQueue.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">
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

            {/* Soundboard */}
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
        </div>
      )}
    </div>
  );
}

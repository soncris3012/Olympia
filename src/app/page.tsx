'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RoundKD from '@/components/RoundKD';
import RoundVCNV from '@/components/RoundVCNV';
import RoundTT from '@/components/RoundTT';
import RoundVD from '@/components/RoundVD';
import RoundFinish from '@/components/RoundFinish';
import MultiplayerView from '@/components/MultiplayerView';
import QuestionBankView from '@/components/QuestionBankView';
import RulesModal from '@/components/RulesModal';
import { OlympiaQuestion, Obstacle } from '@/lib/types';
import { fetchQuestionsFromSupabase, fetchObstaclesFromSupabase } from '@/lib/supabase';
import { Trophy, Play, Sparkles, User, Award, ShieldCheck, Radio } from 'lucide-react';
import { soundManager } from '@/lib/audio';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'solo' | 'multiplayer' | 'questions' | 'rules'>('solo');
  const [soloStage, setSoloStage] = useState<'intro' | 'kd' | 'vcnv' | 'tt' | 'vd' | 'finish'>('intro');
  const [candidateName, setCandidateName] = useState('Thí Sinh Olympia');

  // Question bank state
  const [allQuestions, setAllQuestions] = useState<OlympiaQuestion[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [loading, setLoading] = useState(true);

  // Scores
  const [totalScore, setTotalScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    kd: 0,
    vcnv: 0,
    tt: 0,
    vd: 0,
  });

  // Load questions and obstacles from Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [qData, obsData] = await Promise.all([
          fetchQuestionsFromSupabase(),
          fetchObstaclesFromSupabase(),
        ]);
        setAllQuestions(qData);
        setObstacles(obsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartSolo = () => {
    soundManager.playStartRound();
    setTotalScore(0);
    setScoreBreakdown({ kd: 0, vcnv: 0, tt: 0, vd: 0 });
    setSoloStage('kd');
  };

  const handleScoreUpdate = (delta: number) => {
    setTotalScore((prev) => Math.max(0, prev + delta));
  };

  const handleKDComplete = (earned: number) => {
    setScoreBreakdown((prev) => ({ ...prev, kd: earned }));
    setSoloStage('vcnv');
  };

  const handleVCNVComplete = (earned: number) => {
    setScoreBreakdown((prev) => ({ ...prev, vcnv: earned }));
    setSoloStage('tt');
  };

  const handleTTComplete = (earned: number) => {
    setScoreBreakdown((prev) => ({ ...prev, tt: earned }));
    setSoloStage('vd');
  };

  const handleVDComplete = (earned: number) => {
    setScoreBreakdown((prev) => ({ ...prev, vd: earned }));
    setSoloStage('finish');
  };

  const handleRestart = () => {
    setTotalScore(0);
    setScoreBreakdown({ kd: 0, vcnv: 0, tt: 0, vd: 0 });
    setSoloStage('intro');
  };

  const kdQuestions = allQuestions.filter((q) => q.round === 'kd');
  const ttQuestions = allQuestions.filter((q) => q.round === 'tt');
  const vdQuestions = allQuestions.filter((q) => q.round === 'vd');

  return (
    <div className="min-h-screen vtv-studio-bg text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} score={totalScore} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-amber-300 font-bold uppercase tracking-wider text-sm">
              Đang tải bộ đề Olympia...
            </p>
          </div>
        ) : (
          <>
            {/* Solo Mode View */}
            {currentTab === 'solo' && (
              <>
                {soloStage === 'intro' && (
                  <div className="vtv-question-box rounded-3xl p-6 sm:p-10 md:p-12 max-w-3xl mx-auto border-amber-500/60 shadow-2xl text-center relative overflow-hidden my-4">
                    {/* Live Broadcast Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-widest mb-4 animate-pulse">
                      <Radio className="w-3.5 h-3.5" />
                      <span>TRỰC TIẾP TRƯỜNG QUAY S9 • VTV3</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 mb-3 drop-shadow-lg">
                      Đường Lên Đỉnh Olympia
                    </h2>

                    <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                      Chào mừng bạn đến với đấu trường trí tuệ danh giá nhất dành cho học sinh Việt Nam. Hãy bước lên bục thi đấu và chinh phục 4 chặng núi:
                      <br />
                      <strong className="text-amber-300">Khởi Động</strong> •{' '}
                      <strong className="text-amber-300">Vượt Chướng Ngại Vật</strong> •{' '}
                      <strong className="text-amber-300">Tăng Tốc</strong> •{' '}
                      <strong className="text-amber-300">Về Đích</strong>
                    </p>

                    <div className="max-w-md mx-auto mb-8">
                      <label className="text-xs text-amber-300 font-black uppercase block mb-2 text-left tracking-wider">
                        Họ tên thí sinh leo núi:
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="Nhập họ tên của bạn..."
                          className="w-full bg-black/70 border-2 border-amber-500/60 focus:border-amber-400 pl-11 pr-4 py-3 rounded-xl text-base text-yellow-200 font-bold outline-none shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                      <button
                        onClick={handleStartSolo}
                        className="py-4 px-8 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/40 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider group cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
                        <span>Bước Lên Bục Thi Đấu</span>
                      </button>
                    </div>

                    {/* Features Badges matching TV rounds */}
                    <div className="pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                      <div className="p-3 bg-[#03091e]/80 rounded-xl border border-slate-800 shadow">
                        <span className="text-xs font-black text-amber-400 block mb-0.5 uppercase">1. Khởi Động</span>
                        <span className="text-[11px] text-slate-400">10 câu hỏi tốc độ</span>
                      </div>
                      <div className="p-3 bg-[#03091e]/80 rounded-xl border border-slate-800 shadow">
                        <span className="text-xs font-black text-amber-400 block mb-0.5 uppercase">2. VCNV</span>
                        <span className="text-[11px] text-slate-400">4 hàng ngang & ảnh bí mật</span>
                      </div>
                      <div className="p-3 bg-[#03091e]/80 rounded-xl border border-slate-800 shadow">
                        <span className="text-xs font-black text-amber-400 block mb-0.5 uppercase">3. Tăng Tốc</span>
                        <span className="text-[11px] text-slate-400">Tốc độ & phản xạ 40-10đ</span>
                      </div>
                      <div className="p-3 bg-[#03091e]/80 rounded-xl border border-slate-800 shadow">
                        <span className="text-xs font-black text-amber-400 block mb-0.5 uppercase">4. Về Đích</span>
                        <span className="text-[11px] text-slate-400">Gói 20/30đ & Ngôi sao hy vọng</span>
                      </div>
                    </div>
                  </div>
                )}

                {soloStage === 'kd' && (
                  <RoundKD
                    questions={kdQuestions}
                    candidateName={candidateName}
                    onScoreUpdate={handleScoreUpdate}
                    onComplete={handleKDComplete}
                  />
                )}

                {soloStage === 'vcnv' && (
                  <RoundVCNV
                    obstacles={obstacles}
                    candidateName={candidateName}
                    onScoreUpdate={handleScoreUpdate}
                    onComplete={handleVCNVComplete}
                  />
                )}

                {soloStage === 'tt' && (
                  <RoundTT
                    questions={ttQuestions}
                    candidateName={candidateName}
                    onScoreUpdate={handleScoreUpdate}
                    onComplete={handleTTComplete}
                  />
                )}

                {soloStage === 'vd' && (
                  <RoundVD
                    questions={vdQuestions}
                    candidateName={candidateName}
                    onScoreUpdate={handleScoreUpdate}
                    onComplete={handleVDComplete}
                  />
                )}

                {soloStage === 'finish' && (
                  <RoundFinish
                    totalScore={totalScore}
                    breakdown={scoreBreakdown}
                    onRestart={handleRestart}
                  />
                )}
              </>
            )}

            {/* Multiplayer View */}
            {currentTab === 'multiplayer' && <MultiplayerView />}

            {/* Questions Bank View */}
            {currentTab === 'questions' && <QuestionBankView />}

            {/* Rules View */}
            {currentTab === 'rules' && <RulesModal />}
          </>
        )}
      </main>
    </div>
  );
}

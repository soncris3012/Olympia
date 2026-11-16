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
import { Trophy, Play, Sparkles, User, Award, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen olympia-gradient-bg text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} score={totalScore} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-amber-300 font-bold uppercase tracking-wider text-sm">
              Đang kết nối Supabase và tải bộ đề Olympia...
            </p>
          </div>
        ) : (
          <>
            {/* Solo Mode View */}
            {currentTab === 'solo' && (
              <>
                {soloStage === 'intro' && (
                  <div className="olympia-card rounded-3xl p-8 md:p-12 max-w-3xl mx-auto border-amber-500/40 glow-gold text-center relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Trận Đấu Đỉnh Cao • 4 Vòng Thi Chuẩn VTV</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-500 mb-4 drop-shadow">
                      Đường Lên Đỉnh Olympia
                    </h2>

                    <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                      Hãy nhập tên của bạn và bắt đầu hành trình chinh phục 4 đỉnh núi tri thức:
                      <br />
                      <strong className="text-amber-300">Khởi Động</strong> •{' '}
                      <strong className="text-amber-300">Vượt Chướng Ngại Vật</strong> •{' '}
                      <strong className="text-amber-300">Tăng Tốc</strong> •{' '}
                      <strong className="text-amber-300">Về Đích</strong>
                    </p>

                    <div className="max-w-md mx-auto mb-8">
                      <label className="text-xs text-slate-400 font-bold block mb-2 text-left">
                        Tên thí sinh leo núi:
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="Nhập họ tên của bạn..."
                          className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 pl-11 pr-4 py-3 rounded-xl text-base text-slate-100 font-semibold outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleStartSolo}
                        className="py-4 px-8 rounded-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 text-base uppercase tracking-wider group"
                      >
                        <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
                        <span>Bắt Đầu Chinh Phục Ngay</span>
                      </button>
                    </div>

                    {/* Features Badges */}
                    <div className="mt-10 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-amber-400 block mb-0.5">Khởi Động</span>
                        <span className="text-[11px] text-slate-400">5s mỗi câu, đa lĩnh vực</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-amber-400 block mb-0.5">VCNV</span>
                        <span className="text-[11px] text-slate-400">4 hàng ngang + mảnh ghép</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-amber-400 block mb-0.5">Tăng Tốc</span>
                        <span className="text-[11px] text-slate-400">Điểm số theo tốc độ</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-amber-400 block mb-0.5">Về Đích</span>
                        <span className="text-[11px] text-slate-400">Ngôi sao hy vọng (x2 điểm)</span>
                      </div>
                    </div>
                  </div>
                )}

                {soloStage === 'kd' && (
                  <RoundKD
                    questions={kdQuestions}
                    onScoreUpdate={handleScoreUpdate}
                    onComplete={handleKDComplete}
                  />
                )}

                {soloStage === 'vcnv' && (
                  <RoundVCNV
                    obstacles={obstacles}
                    onScoreUpdate={handleScoreUpdate}
                    onComplete={handleVCNVComplete}
                  />
                )}

                {soloStage === 'tt' && (
                  <RoundTT
                    questions={ttQuestions}
                    onScoreUpdate={handleScoreUpdate}
                    onComplete={handleTTComplete}
                  />
                )}

                {soloStage === 'vd' && (
                  <RoundVD
                    questions={vdQuestions}
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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Ứng dụng Web "Đường lên đỉnh Olympia" • Dữ liệu Supabase • Sẵn sàng triển khai trên Vercel
        </p>
      </footer>
    </div>
  );
}

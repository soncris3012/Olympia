'use client';

import React, { useState, useEffect } from 'react';
import { OlympiaQuestion, RoundType } from '@/lib/types';
import { fetchQuestionsFromSupabase, addQuestionToSupabase } from '@/lib/supabase';
import { Plus, Search, Filter, BookOpen, Check, AlertCircle, Database, Sparkles } from 'lucide-react';

export default function QuestionBankView() {
  const [questions, setQuestions] = useState<OlympiaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<RoundType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newRound, setNewRound] = useState<RoundType>('kd');
  const [newCategory, setNewCategory] = useState('Khoa học Tự nhiên');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newPoints, setNewPoints] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchQuestionsFromSupabase();
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setSubmitting(true);
    const res = await addQuestionToSupabase({
      round: newRound,
      category: newCategory,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      explanation: newExplanation.trim() || undefined,
      points: Number(newPoints),
      time_limit: newRound === 'kd' ? 5 : newRound === 'tt' ? 20 : newPoints === 30 ? 20 : 15,
    });

    setSubmitting(false);

    if (res.success) {
      setStatusMessage({ text: 'Đã thêm câu hỏi thành công!', type: 'success' });
      setNewQuestion('');
      setNewAnswer('');
      setNewExplanation('');
      setIsAddModalOpen(false);
      loadData();
    } else {
      setStatusMessage({ text: `Lỗi: ${res.error}`, type: 'error' });
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchRound = selectedRound === 'all' || q.round === selectedRound;
    const matchSearch =
      !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRound && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-amber-300 uppercase tracking-wider">
              Ngân Hàng Câu Hỏi Olympia
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tổng cộng: <strong className="text-amber-400">{questions.length}</strong> câu hỏi chuẩn bị cho các vòng thi
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Câu Hỏi Mới</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
        }`}>
          {statusMessage.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo từ khóa câu hỏi, đáp án, môn học..."
            className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-amber-400 pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Round Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'kd', label: 'Khởi động' },
            { id: 'tt', label: 'Tăng tốc' },
            { id: 'vd', label: 'Về đích' },
            { id: 'chp', label: 'Câu hỏi phụ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRound(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedRound === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Đang tải câu hỏi...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 olympia-card rounded-2xl p-8">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-500" />
          <p className="font-semibold text-sm">Không tìm thấy câu hỏi phù hợp.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="olympia-card p-4 rounded-xl border-slate-700/60 hover:border-amber-500/40 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[11px] uppercase border border-amber-500/30">
                    {q.round.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {q.category || 'Tổng hợp'}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  +{q.points} Điểm
                </span>
              </div>

              <p className="text-slate-100 text-sm md:text-base font-semibold">
                {q.question}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="text-slate-400">Đáp án: </span>
                  <strong className="text-yellow-300 uppercase tracking-wide">{q.answer}</strong>
                </div>
                {q.explanation && (
                  <p className="text-xs text-slate-400 italic">
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="olympia-card max-w-lg w-full p-6 rounded-2xl border-amber-500/50 glow-gold max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-amber-300 uppercase">
                Thêm Câu Hỏi Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Vòng thi:</label>
                  <select
                    value={newRound}
                    onChange={(e) => setNewRound(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                  >
                    <option value="kd">Khởi động (kd)</option>
                    <option value="tt">Tăng tốc (tt)</option>
                    <option value="vd">Về đích (vd)</option>
                    <option value="chp">Câu hỏi phụ (chp)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Điểm số:</label>
                  <select
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                  >
                    <option value={10}>10 điểm</option>
                    <option value={20}>20 điểm</option>
                    <option value={30}>30 điểm</option>
                    <option value={40}>40 điểm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Lĩnh vực / Môn học:</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Toán học, Lịch sử, Hóa học..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Nội dung câu hỏi:</label>
                <textarea
                  rows={3}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Đáp án:</label>
                <input
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Đáp án chính xác..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Giải thích (tùy chọn):</label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Giải thích thêm về đáp án..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !newQuestion.trim() || !newAnswer.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 font-bold text-white text-sm shadow transition-all disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Câu Hỏi'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm font-semibold hover:bg-slate-700"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { BookOpen, Trophy, Zap, Flag, HelpCircle } from 'lucide-react';

export default function RulesModal() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-amber-500/20 text-center">
        <h2 className="text-2xl font-black text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <span>Luật Thi Đấu "Đường Lên Đỉnh Olympia"</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-400">
          Quy chuẩn thi đấu chính thức theo format truyền hình VTV3
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Round 1 */}
        <div className="olympia-card p-5 rounded-2xl border-slate-700/60">
          <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="text-base uppercase tracking-wider">Vòng 1: Khởi Động</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Mỗi câu hỏi có tối đa <strong className="text-amber-300">5 giây</strong> suy nghĩ và đưa ra đáp án.</li>
            <li>Trả lời đúng được <strong className="text-emerald-400">+10 điểm</strong>; trả lời sai hoặc bỏ qua không bị trừ điểm.</li>
            <li>Ở lượt chung, thí sinh bấm chuông giành quyền trả lời; nếu sai bị <strong className="text-rose-400">-5 điểm</strong>.</li>
          </ul>
        </div>

        {/* Round 2 */}
        <div className="olympia-card p-5 rounded-2xl border-slate-700/60">
          <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">
              2
            </span>
            <h3 className="text-base uppercase tracking-wider">Vòng 2: Vượt Chướng Ngại Vật</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Gồm 4 hàng ngang và 1 ô trung tâm che giấu một bức ảnh và từ khóa CNV.</li>
            <li>Mỗi hàng ngang có <strong className="text-amber-300">15 giây</strong> trả lời, đúng được <strong className="text-emerald-400">+10 điểm</strong> và lật mở 1 góc ảnh.</li>
            <li>Bấm chuông đoán CNV đúng: hàng 1 (+60đ), hàng 2 (+50đ), hàng 3 (+40đ), hàng 4 (+30đ), sau ô trung tâm (+20đ).</li>
            <li>Nếu đoán sai CNV: Thí sinh bị <strong className="text-rose-400">loại khỏi phần thi VCNV</strong>.</li>
          </ul>
        </div>

        {/* Round 3 */}
        <div className="olympia-card p-5 rounded-2xl border-slate-700/60">
          <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">
              3
            </span>
            <h3 className="text-base uppercase tracking-wider">Vòng 3: Tăng Tốc</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Gồm 4 câu hỏi tư duy (sắp xếp, logic IQ, dãy số, manh mối dữ kiện).</li>
            <li>Thời gian suy nghĩ: Câu 1, 2 (20 giây); Câu 3, 4 (30 giây).</li>
            <li>Điểm thưởng theo tốc độ gửi đáp án chính xác:</li>
            <div className="grid grid-cols-4 gap-1 text-center font-bold text-[11px] my-1">
              <span className="p-1 rounded bg-slate-800 text-amber-400">Nhanh nhất: +40</span>
              <span className="p-1 rounded bg-slate-800 text-amber-300">Thứ 2: +30</span>
              <span className="p-1 rounded bg-slate-800 text-slate-300">Thứ 3: +20</span>
              <span className="p-1 rounded bg-slate-800 text-slate-400">Thứ 4: +10</span>
            </div>
          </ul>
        </div>

        {/* Round 4 */}
        <div className="olympia-card p-5 rounded-2xl border-slate-700/60">
          <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">
              4
            </span>
            <h3 className="text-base uppercase tracking-wider">Vòng 4: Về Đích</h3>
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Thí sinh chọn 3 câu hỏi từ 2 mức điểm: 20 điểm (15s) và 30 điểm (20s).</li>
            <li><strong className="text-yellow-300">Ngôi sao hy vọng (NSHV):</strong> Được dùng 1 lần. Đúng được <strong className="text-emerald-400">nhân đôi điểm</strong>; sai bị <strong className="text-rose-400">trừ đúng số điểm</strong> câu hỏi.</li>
            <li>Nếu trả lời sai, các thí sinh còn lại có 5 giây bấm chuông cướp quyền; trả lời đúng nhận điểm, sai bị trừ 50% điểm câu hỏi.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

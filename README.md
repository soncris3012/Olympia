# 🏆 ĐƯỜNG LÊN ĐỈNH OLYMPIA (WEB VERSION)

Dự án ứng dụng Web trò chơi truyền hình **Đường lên đỉnh Olympia** được phát triển dựa trên kiến trúc của `HuyenThoaiVuaHung/Legendary` & `Legion`, hiện đại hóa với **Next.js 15, Tailwind CSS, Supabase Realtime** và triển khai tối ưu trên **Vercel**.

---

## 🌟 Tính Năng Nổi Bật

1. **Đầy đủ 4 vòng thi chuẩn VTV**:
   - ⚡ **Khởi động**: Đếm ngược 5 giây/câu, hệ thống câu hỏi phong phú đa lĩnh vực.
   - 🧩 **Vượt chướng ngại vật**: 4 hàng ngang, lật mở 4 góc ảnh bí mật, ô trung tâm và cơ chế bấm chuông giải CNV với điểm thưởng luân chuyển (60, 50, 40, 30, 20 điểm).
   - 🚀 **Tăng tốc**: 4 câu hỏi tư duy logic/sắp xếp/chuỗi sự kiện với thời gian tăng dần (20s - 30s) và điểm số theo tốc độ phản ứng (40, 30, 20, 10 điểm).
   - 🎯 **Về đích**: Tự chọn gói điểm (20 - 20 - 20, 20 - 20 - 30, 20 - 30 - 30, 30 - 30 - 30), kích hoạt **Ngôi sao hy vọng** (x2 điểm hoặc bị trừ điểm nếu sai).
   - 👑 **Vinh danh & Trao vòng nguyệt quế**: Hiệu ứng pháo hoa rực rỡ và bảng tổng kết thành tích.

2. **Hai chế độ trải nghiệm**:
   - 🎮 **Đấu Solo / Luyện tập**: Người chơi có thể tự mình vượt qua cả 4 vòng thi bất kỳ lúc nào mà không cần chuẩn bị nhiều thiết bị.
   - 👥 **Phòng thi đấu trực tuyến (MC & Thí sinh)**: Kết nối realtime qua Supabase Realtime Channels, chuông bấm sub-50ms và bảng điều khiển âm thanh MC.

3. **Âm thanh VTV Olympia chính thức**:
   - Nhạc hiệu bắt đầu vòng thi, nhạc đếm ngược 15s/20s/30s, chuông giành quyền, đúng/sai, Ngôi sao hy vọng, nhạc trao giải.

4. **Ngân hàng câu hỏi Supabase**:
   - Hơn 40 câu hỏi mẫu chất lượng cao chia đều cho tất cả các vòng và môn học (Toán, Lý, Hóa, Sinh, Sử, Địa, Văn, Thể thao, Tiếng Anh, Logic).
   - Giao diện tra cứu, tìm kiếm và thêm câu hỏi mới trực tiếp vào PostgreSQL trên Supabase.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & Database**: Supabase (PostgreSQL, Realtime Broadcast, RLS Security).
- **Deployment**: Vercel.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Local

### 1. Clone repository
```bash
git clone https://github.com/soncris3012/Olympia.git
cd Olympia
```

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Cấu hình biến môi trường (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Khởi chạy
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## ☁️ Triển Khai Lên Vercel (1-Click)

Dự án đã được cấu hình tương thích 100% với Vercel CLI:
```bash
vercel --prod
```
Các biến môi trường `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` có thể cấu hình trực tiếp trên Vercel Dashboard trong mục **Settings > Environment Variables**.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đường Lên Đỉnh Olympia | Web Game & Đấu Trực Tuyến",
  description: "Trò chơi truyền hình Đường lên đỉnh Olympia trên nền tảng Web với đầy đủ 4 vòng thi: Khởi động, Vượt chướng ngại vật, Tăng tốc, Về đích.",
  icons: {
    icon: "/images/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#050b1f] text-slate-100">{children}</body>
    </html>
  );
}

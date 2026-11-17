import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "보고 읽고", template: "%s | 보고 읽고" },
  description: "보고 읽은 영화와 책의 기록장",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted">
          영화 정보는 TMDB, 책 정보는 카카오 책 검색에서 가져옵니다. 이 서비스는 TMDB와 제휴하거나 TMDB의 인증을 받은 것이 아닙니다.
        </footer>
      </body>
    </html>
  );
}

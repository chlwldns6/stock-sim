import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '가상 주식 시뮬레이터',
  description: 'AI vs 나 — 누가 더 잘할까?',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

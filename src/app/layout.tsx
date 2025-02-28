import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'バイト管理くん',
  description: 'バイト管理を楽に！',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

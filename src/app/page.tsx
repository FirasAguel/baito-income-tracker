// src/app/page.tsx
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto py-10 text-center">
      <h1 className="mb-6 text-3xl font-bold">シフト管理アプリ</h1>
      <div className="space-x-4">
        <Link href="/shift">
          <button className="rounded bg-blue-500 px-4 py-2 text-white">シフト管理</button>
        </Link>
        <Link href="/settings">
          <button className="rounded bg-green-500 px-4 py-2 text-white">勤務先設定</button>
        </Link>
      </div>
    </div>
  );
}
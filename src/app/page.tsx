// src/app/page.tsx
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto py-10 text-center">
      <h1 className="mb-6 text-3xl font-bold">シフト管理アプリ</h1>
      <div className="space-x-4">
        <Link href="/shift">
          <button className="rounded bg-blue-500 px-4 py-2 text-white">シフトカレンダー</button>
        </Link>
        <Link href="/shift_settings">
          <button className="rounded bg-green-500 px-4 py-2 text-white">勤務先設定</button>
        </Link>
        <Link href="/incomeGoal_setting">
          <button className="rounded bg-orange-500 px-4 py-2 text-white">年収目標設定</button>
        </Link>
        <Link href="/barChart">
          <button className="rounded bg-gray-500 px-4 py-2 text-white">給料履歴</button>
        </Link>
        <Link href="/pieChart">
          <button className="rounded bg-purple-500 px-4 py-2 text-white">給料見込</button>
        </Link>
      </div>
    </div>
  );
}
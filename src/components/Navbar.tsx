'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 flex w-full items-center justify-between bg-teal-500 p-4 text-white shadow-md">
      <div className="text-lg font-bold">Baito Tracker</div>
      <div className="container mx-auto text-center">
        <div className="space-x-4">
          <Link href="/shift">
            <button className="rounded bg-white px-4 py-2 text-teal-500">
              シフトカレンダー
            </button>
          </Link>
          <Link href="/shift_settings">
            <button className="rounded bg-white px-4 py-2 text-teal-500">
              勤務先設定
            </button>
          </Link>
          <Link href="/incomeGoal_setting">
            <button className="rounded bg-white px-4 py-2 text-teal-500">
              年収目標設定
            </button>
          </Link>
          <Link href="/barChart">
            <button className="rounded bg-white px-4 py-2 text-teal-500">
              給料履歴
            </button>
          </Link>
          <Link href="/pieChart">
            <button className="rounded bg-white px-4 py-2 text-teal-500">
              給料見込
            </button>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded bg-white px-3 py-1 text-teal-500">🌙</button>
        <button className="rounded bg-white px-3 py-1 text-teal-500">⚙️</button>
      </div>
    </nav>
  );
}

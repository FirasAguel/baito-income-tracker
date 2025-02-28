'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function ShiftPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar onMenuToggle={setMenuOpen} />
      <main className={`transition-all ${menuOpen ? 'mt-76' : ''} p-6`}>
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="mb-4 text-center text-2xl font-bold">
            シフト管理カレンダー
          </h1>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
            <select className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
            <input
              type="datetime-local"
              className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <input
              type="number"
              className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button className="w-full max-w-xs rounded bg-blue-500 px-4 py-2 text-white">
              追加
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Calendar from '@/app/calendar/page';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar onMenuToggle={setMenuOpen} />
      <main
        className={`flex items-center justify-center transition-all ${
          menuOpen ? 'mt-76' : ''
        }`}
      >
        <div
          className={`flex pt-24 pb-6 transition-all duration-300 ${
            menuOpen ? 'h-[64vh] w-5/6' : 'h-[80vh] w-2/3'
          }`}
        >
          <Calendar />
        </div>
      </main>
    </div>
  );
}

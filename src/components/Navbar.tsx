'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar({
  onMenuToggle,
}: {
  onMenuToggle: (isOpen: boolean) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    const newState = !menuOpen;
    setMenuOpen(newState);
    onMenuToggle(newState); // Notify parent to adjust layout
  };

  return (
    <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-teal-500 p-4 text-white shadow-md">
      {/* Logo */}
      <div className="text-lg font-bold">Baito Tracker</div>

      {/* Desktop Navigation */}
      <div className="hidden space-x-4 md:flex">
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

      {/* Mobile Menu Toggle */}
      <button className="md:hidden" onClick={toggleMenu}>
        🍔
      </button>

      {/* Right Side Icons */}
      <div className="hidden items-center gap-4 md:flex">
        <button className="rounded bg-white px-3 py-1 text-teal-500">🌙</button>
        <button className="rounded bg-white px-3 py-1 text-teal-500">⚙️</button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-teal-500 p-4 shadow-md md:hidden">
          <div className="flex flex-col space-y-2">
            <Link href="/shift">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500">
                シフトカレンダー
              </button>
            </Link>
            <Link href="/shift_settings">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500">
                勤務先設定
              </button>
            </Link>
            <Link href="/incomeGoal_setting">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500">
                年収目標設定
              </button>
            </Link>
            <Link href="/barChart">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500">
                給料履歴
              </button>
            </Link>
            <Link href="/pieChart">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500">
                給料見込
              </button>
            </Link>
            <div className="flex justify-center gap-4 pt-2">
              <button className="rounded bg-white px-3 py-1 text-teal-500">
                🌙
              </button>
              <button className="rounded bg-white px-3 py-1 text-teal-500">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

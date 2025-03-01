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
    <nav className="fixed top-0 left-0 z-50 flex w-full items-center bg-teal-500 p-4 text-white shadow-md">
      {/* Logo */}
      <div className="flex-shrink-0 text-lg font-bold">Baito Tracker</div>

      <div className="flex-grow"></div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:space-x-4">
        <Link href="/home">
          <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
            シフトカレンダー
          </button>
        </Link>
        <Link href="/shift">
          <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
            シフト一覧
          </button>
        </Link>
        <Link href="/shift_settings">
          <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
            勤務先設定
          </button>
        </Link>
        <Link href="/incomeGoal_setting">
          <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
            年収目標設定
          </button>
        </Link>
        <Link href="/barChart">
          <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
            給料履歴
          </button>
        </Link>
        <Link href="/pieChart">
          <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
            給料見込
          </button>
        </Link>
      </div>

      <div className="flex-grow"></div>

      <Link href="/logout">
        <button className="rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
          ログアウト
        </button>
      </Link>

      {/* Mobile Menu Toggle */}
      <button className="md:hidden" onClick={toggleMenu}>
        ☰
      </button>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-teal-500 p-4 shadow-md md:hidden">
          <div className="flex flex-col space-y-2">
            <Link href="/home">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
                シフトカレンダー
              </button>
            </Link>
            <Link href="/shift">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
                シフト一覧
              </button>
            </Link>
            <Link href="/shift_settings">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
                勤務先設定
              </button>
            </Link>
            <Link href="/incomeGoal_setting">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
                年収目標設定
              </button>
            </Link>
            <Link href="/barChart">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
                給料履歴
              </button>
            </Link>
            <Link href="/pieChart">
              <button className="w-full rounded bg-white px-4 py-2 text-teal-500 hover:bg-teal-100">
                給料見込
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

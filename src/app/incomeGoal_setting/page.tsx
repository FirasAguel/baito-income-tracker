// src/app/incomeGoal_setting/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface IncomeGoal {
  year: string;
  incomeGoal: number;
}

export default function IncomeGoalSetting() {
  const currentYear = new Date().getFullYear();
  const [menuOpen, setMenuOpen] = useState(false);
  const [incomeGoalData, setIncomeGoalData] = useState<IncomeGoal>({
    year: currentYear.toString(),
    incomeGoal: 0,
  });
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const storedData = localStorage.getItem('incomeGoals');
    if (storedData) {
      const incomeGoals: { [key: string]: number } = JSON.parse(storedData);
      setIncomeGoalData((prev) => ({
        ...prev,
        incomeGoal: incomeGoals[prev.year] || 0,
      }));
    }
  }, [incomeGoalData.year]);

  const handleSave = () => {
    const storedData = localStorage.getItem('incomeGoals');
    let incomeGoals: { [key: string]: number } = storedData
      ? JSON.parse(storedData)
      : {};
    if (incomeGoalData.incomeGoal === 0) {
      delete incomeGoals[incomeGoalData.year];
    } else {
      incomeGoals[incomeGoalData.year] = incomeGoalData.incomeGoal * 10000;
    }
    localStorage.setItem('incomeGoals', JSON.stringify(incomeGoals));
    setMessage('保存しました');
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIncomeGoalData((prev) => ({ ...prev, year: e.target.value }));
    setMessage('');
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncomeGoalData((prev) => ({
      ...prev,
      incomeGoal: parseInt(e.target.value, 10) || 0,
    }));
    setMessage('');
  };

  const years: string[] = Array.from({ length: 11 }, (_, i) =>
    (currentYear + i).toString()
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar onMenuToggle={setMenuOpen} />
      <main
        className={`container mx-auto py-10 transition-all ${menuOpen ? 'mt-88' : 'mt-12'} px-4`}
      >
        <h1 className="mb-4 text-2xl font-bold">年収目標設定</h1>
        <Link href="/">
          <button className="mb-4 rounded bg-teal-500 px-4 py-2 text-white">
            戻る
          </button>
        </Link>
        {message && <div className="mb-4 text-green-500">{message}</div>}

        <div className="mb-6 flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="yearSelect" className="text-lg">
              年を選択:
            </label>
            <select
              id="yearSelect"
              value={incomeGoalData.year}
              onChange={handleYearChange}
              className="border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="incomeGoalInput" className="text-lg">
              収入目標:
            </label>
            <input
              id="incomeGoalInput"
              type="number"
              value={incomeGoalData.incomeGoal}
              onChange={handleIncomeChange}
              className="w-24 border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <span>万円</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="rounded bg-teal-500 px-4 py-2 text-white"
        >
          保存
        </button>
      </main>
    </div>
  );
}

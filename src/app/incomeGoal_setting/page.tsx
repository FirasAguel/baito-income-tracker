// src/app/incomeGoal_setting/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function IncomeGoalSetting() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [incomeGoal, setIncomeGoal] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const storedData = localStorage.getItem('incomeGoals');
    if (storedData) {
      const incomeGoals: { [key: string]: number } = JSON.parse(storedData);
      setIncomeGoal(incomeGoals[selectedYear]?.toString() || '');
    }
  }, [selectedYear]);

  const handleSave = () => {
    const storedData = localStorage.getItem('incomeGoals');
    let incomeGoals: { [key: string]: number } = storedData ? JSON.parse(storedData) : {};
    if (incomeGoal === '') {
      delete incomeGoals[selectedYear];
    } else {
      incomeGoals[selectedYear] = parseInt(incomeGoal, 10) * 10000;
    }
    localStorage.setItem('incomeGoals', JSON.stringify(incomeGoals));
    setMessage('保存しました');
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
    setMessage('');
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncomeGoal(e.target.value);
    setMessage('');
  };

  const years: string[] = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString());

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">年収目標設定</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">戻る</button>
      </Link>
      {message && <div className="mb-4 text-green-500">{message}</div>}

      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="yearSelect" className="text-lg">年を選択:</label>
          <select id="yearSelect" value={selectedYear} onChange={handleYearChange} className="border p-2">
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="incomeGoalInput" className="text-lg">収入目標:</label>
          <input id="incomeGoalInput" type="number" value={incomeGoal} onChange={handleIncomeChange} className="border p-2 w-24" />
          <span>万円</span>
        </div>
      </div>
      <button onClick={handleSave} className="rounded bg-blue-500 px-4 py-2 text-white">保存</button>
    </div>
  );
}

// src/app/incomeGoal_setting/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase';

interface IncomeGoal {
  year: string;
  incomeGoal: number;
}

export default function IncomeGoalSetting() {
  const currentYear = new Date().getFullYear();
  const [incomeGoalData, setIncomeGoalData] = useState<IncomeGoal>({ year: currentYear.toString(), incomeGoal: 0 });
  const [message, setMessage] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchIncomeGoal = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('income_goals')
        .select('income_goal')
        .eq('year', incomeGoalData.year)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setIncomeGoalData((prev) => ({ ...prev, incomeGoal: data.income_goal / 10000 }));
      } else {
        setIncomeGoalData((prev) => ({ ...prev, incomeGoal: 0 }));
      }
    };

    fetchIncomeGoal();
  }, [incomeGoalData.year, userId]);

  const handleSave = async () => {
    if (!userId) {
      setMessage('ユーザーがログインしていません');
      return;
    }

    const { error } = await supabase
      .from('income_goals')
      .upsert([
        {
          year: incomeGoalData.year,
          income_goal: incomeGoalData.incomeGoal * 10000,
          user_id: userId,
        },
      ]);

    if (error) {
      setMessage('保存に失敗しました');
    } else {
      setMessage('保存しました');
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIncomeGoalData((prev) => ({ ...prev, year: e.target.value }));
    setMessage('');
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncomeGoalData((prev) => ({ ...prev, incomeGoal: parseInt(e.target.value, 10) || 0 }));
    setMessage('');
  };

  const years: string[] = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString());

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">年収目標設定</h1>
      <Link href="/shift">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">戻る</button>
      </Link>
      {message && <div className="mb-4 text-green-500">{message}</div>}

      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="yearSelect" className="text-lg">年を選択:</label>
          <select id="yearSelect" value={incomeGoalData.year} onChange={handleYearChange} className="border p-2">
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="incomeGoalInput" className="text-lg">収入目標:</label>
          <input id="incomeGoalInput" type="text" value={incomeGoalData.incomeGoal} onChange={handleIncomeChange} className="border p-2 w-24" />
          <span>万円</span>
        </div>
      </div>
      <button onClick={handleSave} className="rounded bg-blue-500 px-4 py-2 text-white">保存</button>
    </div>
  );
}
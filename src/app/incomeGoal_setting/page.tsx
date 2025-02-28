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
  const [incomeGoalData, setIncomeGoalData] = useState<IncomeGoal>({
    year: currentYear.toString(),
    incomeGoal: 0,
  });
  const [message, setMessage] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user and set userId
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      }
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  // Once userId or selected year changes, fetch the income goal from Supabase
  useEffect(() => {
    const fetchIncomeGoal = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('income_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('year', incomeGoalData.year)
          .single();
        if (error) {
          console.error('Error fetching income goal:', error);
        }
        if (data) {
          // Convert stored income (assumed to be stored as number of yen)
          // to "万円" (divide by 10000)
          setIncomeGoalData({
            year: data.year,
            incomeGoal: data.income_goal / 10000,
          });
        }
      }
    };
    fetchIncomeGoal();
  }, [userId, incomeGoalData.year]);

  // Also load localStorage income goals (if any) and update state accordingly
  useEffect(() => {
    const storedData = localStorage.getItem('incomeGoals');
    if (storedData) {
      const incomeGoals: { [key: string]: number } = JSON.parse(storedData);
      setIncomeGoalData((prev) => ({
        ...prev,
        incomeGoal: incomeGoals[prev.year] || prev.incomeGoal,
      }));
    }
  }, [incomeGoalData.year]);

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

  const handleSave = async () => {
    // Update localStorage
    const storedData = localStorage.getItem('incomeGoals');
    let incomeGoals: { [key: string]: number } = storedData
      ? JSON.parse(storedData)
      : {};
    if (incomeGoalData.incomeGoal === 0) {
      delete incomeGoals[incomeGoalData.year];
    } else {
      incomeGoals[incomeGoalData.year] = incomeGoalData.incomeGoal;
    }
    localStorage.setItem('incomeGoals', JSON.stringify(incomeGoals));

    // Upsert to Supabase
    if (userId) {
      const { error } = await supabase.from('income_goals').upsert([
        {
          year: incomeGoalData.year,
          income_goal: incomeGoalData.incomeGoal * 10000, // store as yen
          user_id: userId,
        },
      ]);
      if (error) {
        console.error('Error saving income goal:', error);
        setMessage('保存に失敗しました');
      } else {
        setMessage('保存しました');
      }
    }
  };

  const years: string[] = Array.from({ length: 11 }, (_, i) =>
    (currentYear + i).toString()
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">年収目標設定</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
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
            className="border p-2"
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
            className="w-24 border p-2"
          />
          <span>万円</span>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        保存
      </button>
    </div>
  );
}

// src/app/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Shift, IncomeGoal } from '../../types';
import Link from 'next/link';

export default function IncomeStatistics() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [incomegoal, setIncomeGoal] = useState<IncomeGoal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedShifts = localStorage.getItem('shifts');
    if (storedShifts) {
      try {
        setShifts(JSON.parse(storedShifts));
      } catch (e) {
        setError('シフトデータの読み込みに失敗しました');
      }
    }
  }, []);

  useEffect(() => {
    const storedIncomeGoal = localStorage.getItem('incomegoal');
    if (storedIncomeGoal) {
      try {
        setIncomeGoal(JSON.parse(storedIncomeGoal));
      } catch (e) {
        setError('年収目標の読み込みに失敗しました');
      }
    }
  }, []);

  const getDailyIncomeSum = () => {
    const dailySums: { [key: string]: number } = {};
    shifts.forEach((shift) => {
      if (!shift.endDate) return;
      const dateKey = shift.endDate;
      const income = shift.income; 
      dailySums[dateKey] = dailySums[dateKey] + income;
    });
    return dailySums;
  };

  const getMonthlyIncomeSum = () => {
    const monthlySums: { [key: string]: number } = {};
    shifts.forEach((shift) => {
      if (!shift.endDate) return;
      const date = new Date(shift.endDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const income = shift.income; 
      monthlySums[monthKey] = monthlySums[monthKey] + income;
    });
    return monthlySums;
  };

  const getYearlyIncomeSum = () => {
    const yearlySums: { [key: string]: number } = {};
    shifts.forEach((shift) => {
      if (!shift.endDate) return;
      const yearKey = new Date(shift.endDate).getFullYear().toString();
      const income = shift.income; 
      yearlySums[yearKey] = yearlySums[yearKey] + income;
    });
    return yearlySums;
  };

  const dailySums = getDailyIncomeSum();
  const monthlySums = getMonthlyIncomeSum();
  const yearlySums = getYearlyIncomeSum();

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">収入履歴</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
          戻る
        </button>
      </Link>
      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* Daily Income Sum */}
      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">日別収入履歴</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-200">日付</th>
                <th className="px-4 py-2 border border-gray-200">収入</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailySums).map(([date, income]) => (
                  <tr key={date} className="border-b">
                    <td className="px-4 py-2 border border-gray-200">{date}</td>
                    <td className="px-4 py-2 border border-gray-200">
                      {income}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Income Sum */}
      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">月別収入履歴</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-200">月</th>
                <th className="px-4 py-2 border border-gray-200">収入</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlySums).map(([date, income]) => (
                <tr key={date} className="border-b">
                  <td className="px-4 py-2 border border-gray-200">{date}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    {income}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Income Sum */}
      <div>
        <h2 className="mb-2 text-xl font-semibold">年別収入履歴</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-200">年</th>
                <th className="px-4 py-2 border border-gray-200">収入</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(yearlySums).map(([date, income]) => (
                <tr key={date} className="border-b">
                  <td className="px-4 py-2 border border-gray-200">{date}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    {income}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

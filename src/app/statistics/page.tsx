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

  const getDailySums = () => {
    const dailySums: { [key: string]: { income: number; hours: number } } = {};
    shifts.forEach((shift) => {
      if (!shift.endDate) return;
      const dateKey = shift.endDate;
      const income = shift.income || 0;
      const hours = shift.hours || 0;
      if (!dailySums[dateKey]) {
        dailySums[dateKey] = { income: 0, hours: 0 };
      }
      dailySums[dateKey].income += income;
      dailySums[dateKey].hours += hours;
    });
    return dailySums;
  };
  
  const getMonthlySums = () => {
    const monthlySums: { [key: string]: { income: number; hours: number } } = {};
    shifts.forEach((shift) => {
      if (!shift.endDate) return;
      const date = new Date(shift.endDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const income = shift.income || 0; 
      const hours = shift.hours || 0;
      if (!monthlySums[monthKey]) {
        monthlySums[monthKey] = { income: 0, hours: 0 };
      }
      monthlySums[monthKey].income += income;
      monthlySums[monthKey].hours += hours;
    });
    return monthlySums;
  };

  const getYearlySums = () => {
    const yearlySums: { [key: string]: { income: number; hours: number } } = {};
    shifts.forEach((shift) => {
      if (!shift.endDate) return;
      const yearKey = new Date(shift.endDate).getFullYear().toString();
      const income = shift.income || 0; 
      const hours = shift.hours || 0;
      if (!yearlySums[yearKey]) {
        yearlySums[yearKey] = { income: 0, hours: 0 };
      }
      yearlySums[yearKey].income += income;
      yearlySums[yearKey].hours += hours;
    });
    return yearlySums;
  };

  const dailySums = getDailySums();
  const monthlySums = getMonthlySums();
  const yearlySums= getYearlySums();

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">収入履歴</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
          戻る
        </button>
      </Link>
      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* Daily Sum */}
      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">日別履歴</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-200">日付</th>
                <th className="px-4 py-2 border border-gray-200">収入</th>
                <th className="px-4 py-2 border border-gray-200">勤務時間</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailySums).map(([date, { income, hours }]) => (
                <tr key={date} className="border-b">
                  <td className="px-4 py-2 border border-gray-200">{date}</td>
                  <td className="px-4 py-2 border border-gray-200">{income}</td>
                  <td className="px-4 py-2 border border-gray-200">{hours}</td>
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
                <th className="px-4 py-2 border border-gray-200">勤務時間</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlySums).map(([date, { income, hours }]) => (
                <tr key={date} className="border-b">
                  <td className="px-4 py-2 border border-gray-200">{date}</td>
                  <td className="px-4 py-2 border border-gray-200">{income}</td>
                  <td className="px-4 py-2 border border-gray-200">{hours}</td>
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
                <th className="px-4 py-2 border border-gray-200">勤務時間</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(yearlySums).map(([date, { income, hours }]) => (
                <tr key={date} className="border-b">
                  <td className="px-4 py-2 border border-gray-200">{date}</td>
                  <td className="px-4 py-2 border border-gray-200">{income}</td>
                  <td className="px-4 py-2 border border-gray-200">{hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

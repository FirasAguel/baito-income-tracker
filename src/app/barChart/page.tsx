// src/app/barChart/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { createClient } from '@supabase/supabase-js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Shift = {
  id: number;
  endDate: string;
  income: number;
  job: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const IncomeSummaryPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('すべて');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Fetch raw shifts for the user
        const { data: shiftsData, error } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', user.id);
        if (error) {
          console.error('データを読み込めませんでした:', error);
        } else if (shiftsData) {
          setShifts(shiftsData as Shift[]);
        }
      } else {
        console.error('ユーザーが認証されていません');
      }
    };
    fetchData();
  }, []);

  // Compute available years from the shifts data
  const years = Array.from(
    new Set(
      shifts.map((shift) => new Date(shift.endDate).getFullYear().toString())
    )
  );

  // Build a set of months (formatted as "YYYY-MM") for shifts that match the selected year (or all years if 'all')
  let monthsSet = new Set<string>();
  shifts.forEach((shift) => {
    const date = new Date(shift.endDate);
    const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    if (selectedYear === 'all' || monthStr.startsWith(selectedYear)) {
      monthsSet.add(monthStr);
    }
  });
  const months = Array.from(monthsSet).sort((a, b) => a.localeCompare(b));

  // Aggregate income for the selected job by month.
  // If "すべて" is selected, sum income from all shifts.
  const getJobIncome = (job: string) => {
    return months.map((month) => {
      const monthlyShifts = shifts.filter((shift) => {
        const date = new Date(shift.endDate);
        const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;
        if (selectedYear !== 'all' && !monthStr.startsWith(selectedYear))
          return false;
        if (job !== 'すべて' && shift.job !== job) return false;
        return monthStr === month;
      });
      return monthlyShifts.reduce(
        (sum, shift) => sum + (Number(shift.income) || 0),
        0
      );
    });
  };

  const chartData = {
    labels: months,
    datasets: [
      {
        label: selectedJob,
        data: getJobIncome(selectedJob),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) =>
            `${Number(value).toLocaleString()} 円`,
        },
        title: {
          display: true,
          text: '収入 (円)',
        },
      },
    },
  };

  // Compute unique jobs from shifts and prepend "すべて" for all workplaces combined
  const uniqueJobs = Array.from(new Set(shifts.map((shift) => shift.job)));
  const jobOptions = ['すべて', ...uniqueJobs];

  return (
    <div className="min-h-screen bg-gray-100 px-5 py-10">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-semibold">給料履歴</h1>
        <Link href="/shift">
          <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
            戻る
          </button>
        </Link>

        {/* 年選択ボタン */}
        <div className="mb-4 flex flex-wrap justify-center space-x-4">
          <button
            onClick={() => setSelectedYear('all')}
            className={`rounded-md px-4 py-2 transition ${
              selectedYear === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            すべての年
          </button>
          {years
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`rounded-md px-4 py-2 transition ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {year}
              </button>
            ))}
        </div>

        {/* 仕事選択ボタン */}
        <div className="mb-8 flex flex-wrap justify-center space-x-4">
          {jobOptions.map((job) => (
            <button
              key={job}
              onClick={() => setSelectedJob(job)}
              className={`rounded-md px-4 py-2 transition ${
                selectedJob === job
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {job}
            </button>
          ))}
        </div>

        {/* 棒グラフ */}
        <div className="mb-6">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default IncomeSummaryPage;

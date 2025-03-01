// src/app/barChart/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('すべて');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Compute available years from shifts data
  const years = Array.from(
    new Set(
      shifts.map((shift) => new Date(shift.endDate).getFullYear().toString())
    )
  );

  // Build a set of months (formatted as "YYYY-MM") for shifts that match the selected year (or all years if 'all')
  const monthsSet = new Set<string>();
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
  const jobOptions = [
    'すべて',
    ...uniqueJobs.filter((job) => job !== 'すべて'),
  ];

  return (
    <div className="flex flex-col bg-white text-gray-900">
      <Navbar onMenuToggle={setMenuOpen} />
      <main
        className={`container mx-auto py-10 transition-all ${menuOpen ? 'mt-88' : 'mt-12'} px-4`}
      >
        <h1 className="mb-6 text-center text-3xl font-semibold">給料履歴</h1>
        <Link href="/home">
          <button className="mb-4 rounded bg-teal-500 px-4 py-2 text-white">
            戻る
          </button>
        </Link>

        {/* 年選択ボタン */}
        <div className="mb-4 flex flex-wrap justify-center space-x-4">
          <button
            onClick={() => setSelectedYear('all')}
            className={`rounded-md px-4 py-2 transition ${
              selectedYear === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-teal-300 text-teal-700 hover:bg-teal-400'
            }`}
          >
            すべての年
          </button>
          {[...years].sort((a, b) => Number(a) - Number(b)).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`rounded-md px-4 py-2 transition ${
                selectedYear === year
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-300 text-teal-700 hover:bg-teal-400'
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
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-300 text-teal-700 hover:bg-teal-400'
              }`}
            >
              {job}
            </button>
          ))}
        </div>

        {/* 棒グラフ */}
        <div className="mb-6">
          <Bar data={chartData} options={chartOptions} height={100} />
        </div>
      </main>
    </div>
  );
};

export default IncomeSummaryPage;

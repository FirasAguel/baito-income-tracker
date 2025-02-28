// src/app/barChart/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Bar } from 'react-chartjs-2';
import { JobStatistics } from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const IncomeSummaryPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState<JobStatistics[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('jobStatistics');
      if (storedData) {
        const parsedData: JobStatistics[] = JSON.parse(storedData);
        setData(parsedData);
      }
    } catch (error) {
      console.error(
        'ローカルストレージからデータを読み込めませんでした:',
        error
      );
    }
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-5 py-10">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <h1 className="mb-4 text-3xl font-semibold">データがありません</h1>
          <p className="text-gray-600">
            ローカルストレージにデータを追加してください。
          </p>
        </div>
      </div>
    );
  }

  const years = Array.from(
    new Set(
      data.flatMap((item) =>
        Object.keys(item.monthly.income).map((date) => date.split('-')[0])
      )
    )
  );
  const months = Array.from(
    new Set(data.flatMap((item) => Object.keys(item.monthly.income)))
  )
    .filter((month) => selectedYear === 'all' || month.startsWith(selectedYear))
    .sort((a, b) => a.localeCompare(b));

  const getJobIncome = (job: string) => {
    return months.map((month) => {
      if (job === 'all') {
        return data.reduce(
          (sum, item) => sum + (item.monthly.income[month] || 0),
          0
        );
      }
      const jobData = data.find((item) => item.job === job);
      return jobData?.monthly.income[month] || 0;
    });
  };

  const chartData = {
    labels: months,
    datasets: [
      {
        label: selectedJob === 'all' ? 'すべての仕事' : selectedJob,
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

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar onMenuToggle={setMenuOpen} />
      <main
        className={`container mx-auto py-10 transition-all ${menuOpen ? 'mt-88' : 'mt-12'} px-4`}
      >
        <h1 className="mb-6 text-center text-3xl font-semibold">給料履歴</h1>
        <Link href="/">
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
          {years.map((year) => (
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
          <button
            onClick={() => setSelectedJob('all')}
            className={`rounded-md px-4 py-2 transition ${
              selectedJob === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-teal-300 text-teal-700 hover:bg-teal-400'
            }`}
          >
            すべて
          </button>
          {data.map((item) => (
            <button
              key={item.job}
              onClick={() => setSelectedJob(item.job)}
              className={`rounded-md px-4 py-2 transition ${
                selectedJob === item.job
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-300 text-teal-700 hover:bg-teal-400'
              }`}
            >
              {item.job}
            </button>
          ))}
        </div>

        {/* 棒グラフ */}
        <div className="mb-6">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </main>
    </div>
  );
};

export default IncomeSummaryPage;

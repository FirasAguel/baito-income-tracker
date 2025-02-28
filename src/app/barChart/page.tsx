// src/app/barChart/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { createClient } from '@supabase/supabase-js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const IncomeSummaryPage: React.FC = () => {
  const [data, setData] = useState<JobStatistics[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: jobData, error } = await supabase
          .from('job_statistics')
          .select('*')
          .eq('user_id', user.id);
        if (error) {
          console.error('データを読み込めませんでした:', error);
        } else if (jobData) {
          setData(jobData as JobStatistics[]);
        }
      } else {
        console.error('ユーザーが認証されていません');
      }
    };
    fetchData();
  }, []);

  // When data is loaded, set the default selected job to the first unique job.
  useEffect(() => {
    const uniqueJobs = Array.from(new Set(data.map((item) => item.job)));
    if (data.length > 0 && selectedJob === '' && uniqueJobs.length > 0) {
      setSelectedJob(uniqueJobs[0]);
    }
  }, [data, selectedJob]);

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

  // Aggregate income for the selected job by summing income from all records that match.
  const getJobIncome = (job: string) => {
    return months.map((month) =>
      data
        .filter((item) => item.job === job)
        .reduce((sum, item) => sum + (item.monthly.income[month] || 0), 0)
    );
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

  // Compute unique jobs for button rendering.
  const uniqueJobs = Array.from(new Set(data.map((item) => item.job)));

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
          {uniqueJobs.map((job) => (
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

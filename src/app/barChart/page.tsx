// src/app/barChart/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { Bar } from "react-chartjs-2";
import { JobStatistics } from '../../types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeSummaryPage: React.FC = () => {
  const [data, setData] = useState<JobStatistics[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("jobStatistics");
      if (storedData) {
        const parsedData: JobStatistics[] = JSON.parse(storedData);
        setData(parsedData);
      }
    } catch (error) {
      console.error("ローカルストレージからデータを読み込めませんでした:", error);
    }
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-5 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-semibold mb-4">データがありません</h1>
          <p className="text-gray-600">ローカルストレージにデータを追加してください。</p>
        </div>
      </div>
    );
  }

  const months = Object.keys(data[0].monthly.income);

  const getJobIncome = (job: string) => {
    return months.map((month) => {
      if (job === "all") {
        return data.reduce((sum, item) => sum + (item.monthly.income[month] || 0), 0);
      }
      const jobData = data.find((item) => item.job === job);
      return jobData?.monthly.income[month] || 0;
    });
  };

  const chartData = {
    labels: months,
    datasets: [
      {
        label: selectedJob === "all" ? "すべての仕事" : selectedJob,
        data: getJobIncome(selectedJob),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
   // 縦軸に「(円)」を表示するオプション
   const chartOptions = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => `${Number(value).toLocaleString()} 円`, 
        },
        title: {
          display: true,
          text: "収入 (円)",
        },
      },
    },
  };
  

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center mb-6">給料履歴</h1>
        <Link href="/">
            <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
            戻る
            </button>
        </Link>

        {/* 仕事選択ボタン */}
        <div className="flex flex-wrap justify-center space-x-4 mb-8">
          <button
            onClick={() => setSelectedJob("all")}
            className={`px-4 py-2 rounded-md transition ${
              selectedJob === "all" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            すべて
          </button>
          {data.map((item) => (
            <button
              key={item.job}
              onClick={() => setSelectedJob(item.job)}
              className={`px-4 py-2 rounded-md transition ${
                selectedJob === item.job ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
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
      </div>
    </div>
  );
};

export default IncomeSummaryPage;

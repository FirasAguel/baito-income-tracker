// src/app/pieChart/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { JobStatistics, IncomeGoal } from '../../types';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { createClient } from "@supabase/supabase-js";

type IncomeGoalMapping = { [year: string]: number };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#845EC2',
  '#D65DB1',
  '#FF6F91',
  '#FF9671'
];

const PieChartPage: React.FC = () => {
  const [incomeGoalData, setIncomeGoalData] = useState<IncomeGoalMapping | null>(null);
  const [jobStatistics, setJobStatistics] = useState<JobStatistics[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: incomeGoalsData, error: incomeGoalsError } = await supabase
          .from("income_goals")
          .select("*")
          .eq('user_id', user.id);
        if (incomeGoalsError) {
          console.error("从 Supabase 获取收入目标数据出错:", incomeGoalsError);
        }
      
        const incomeGoals: IncomeGoalMapping = {};
        if (incomeGoalsData) {
          incomeGoalsData.forEach((record: any) => {
            incomeGoals[record.year] = record.income_goal;
          });
        }
        setIncomeGoalData(incomeGoals);

        const { data: jobStatsData, error: jobStatsError } = await supabase
          .from("job_statistics")
          .select("*");
        if (jobStatsError) {
          console.error("从 Supabase 获取工作统计数据出错:", jobStatsError);
        }
        setJobStatistics(jobStatsData as JobStatistics[]);

        const allYears = [
          ...new Set([
            ...Object.keys(incomeGoals),
            ...((jobStatsData as JobStatistics[]) || []).flatMap(job =>
              Object.keys(job.yearly.income)
            )
          ])
        ].sort();
          
          const currentYear = new Date().getFullYear().toString();
          if (allYears.includes(currentYear)) {
            setSelectedYear(currentYear);
          } else if (allYears.length > 0) {
            setSelectedYear(allYears[0]);
          }
        }};
    fetchUserData();
  }, []);

  if (!incomeGoalData || jobStatistics.length === 0 || !selectedYear) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  const availableYears = [
    ...new Set([
      ...Object.keys(incomeGoalData),
      ...jobStatistics.flatMap(job => Object.keys(job.yearly.income))
    ])
  ].sort();

  const incomeGoal = selectedYear as keyof IncomeGoal in incomeGoalData 
  ? incomeGoalData[selectedYear as keyof IncomeGoal] 
  : 0;
  const numericIncomeGoal = typeof incomeGoal === 'string' ? Number(incomeGoal) : incomeGoal;

  const individualJobs = jobStatistics.filter(job => job.job !== 'all');
  const totalJobIncome = individualJobs.reduce((acc, job) => {
    return acc + (job.yearly.income[selectedYear] || 0);
  }, 0);
  
  const pieData = individualJobs.map(job => {
    const income = job.yearly.income[selectedYear] || 0;
    return {
      name: job.job,
      income,
      percentage: numericIncomeGoal > 0 ? (income / numericIncomeGoal * 100).toFixed(2) : '0.00'
    };
  });

  const remainingIncome = numericIncomeGoal - totalJobIncome;
  if (remainingIncome > 0) {
    pieData.push({
      name: '未達成',
      income: remainingIncome,
      percentage: (remainingIncome / numericIncomeGoal * 100).toFixed(2)
    });
  }
  
  const allJobsRecord = jobStatistics.find(job => job.job === 'all');
  const totalAllJobsIncome = allJobsRecord ? (allJobsRecord.yearly.income[selectedYear] || 0) : 0;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">給料見込</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
          戻る
        </button>
      </Link>

      {/* 年選択ボタン */}
      <div className="flex flex-wrap justify-center space-x-4 mb-4">
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-md transition ${
              selectedYear === year ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">目標金額：{incomeGoal}円</h2>
      <PieChart width={400} height={400}>
        <Pie 
          data={pieData} 
          dataKey="income" 
          nameKey="name" 
          cx="50%" 
          cy="50%" 
          outerRadius={150} 
          label={({ name, percentage, income }) => `${name}: ${percentage}% (${income})`}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
        <Legend />
      </PieChart>
      <p className="mt-4 text-lg">給料見込み: {totalAllJobsIncome}円</p>
    </div>
  );
};

export default PieChartPage;

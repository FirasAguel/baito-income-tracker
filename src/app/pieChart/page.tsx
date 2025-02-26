"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { JobStatistics, IncomeGoal } from '../../types';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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
  const [incomeGoalData, setIncomeGoalData] = useState<IncomeGoal | null>(null);
  const [jobStatistics, setJobStatistics] = useState<JobStatistics[]>([]);

  useEffect(() => {
    const incomeGoalStr = localStorage.getItem('incomeGoals');
    const jobStatisticsStr = localStorage.getItem('jobStatistics');
    
    if (incomeGoalStr && jobStatisticsStr) {
      try {
        const parsedIncomeGoal = JSON.parse(incomeGoalStr) as IncomeGoal;
        const parsedJobStatistics = JSON.parse(jobStatisticsStr) as JobStatistics[];
        setIncomeGoalData(parsedIncomeGoal);
        setJobStatistics(parsedJobStatistics);
      } catch (error) {
        console.error("解析 localStorage 数据时出错:", error);
      }
    }
  }, []);

  if (!incomeGoalData || jobStatistics.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }
  
  const targetYear = Object.keys(incomeGoalData)[0] as keyof IncomeGoal;
  const incomeGoal = incomeGoalData[targetYear];
  const numericIncomeGoal = typeof incomeGoal === 'string' ? Number(incomeGoal) : incomeGoal;

  const individualJobs = jobStatistics.filter(job => job.job !== 'all');
  const totalJobIncome = individualJobs.reduce((acc, job) => {
    return acc + (job.yearly.income[targetYear] || 0);
  }, 0);
  
  const pieData = individualJobs.map(job => {
    const income = job.yearly.income[targetYear] || 0;
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
  const totalAllJobsIncome = allJobsRecord ? (allJobsRecord.yearly.income[targetYear] || 0) : 0;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">給料見込</h1>
        <Link href="/">
            <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
            戻る
            </button>
        </Link>
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

// src/app/pieChart/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { createClient } from '@supabase/supabase-js';

type Shift = {
  id: number;
  endDate: string;
  income: number;
  job: string;
};

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
  '#FF9671',
];

const PieChartPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [incomeGoalData, setIncomeGoalData] =
    useState<IncomeGoalMapping | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          // Fetch income goals for the user
          const { data: incomeGoalsData, error: incomeGoalsError } =
            await supabase
              .from('income_goals')
              .select('*')
              .eq('user_id', user.id);
          if (incomeGoalsError) {
            console.error('Error fetching income goals:', incomeGoalsError);
          }

          const incomeGoals: IncomeGoalMapping = {};
          if (incomeGoalsData) {
            incomeGoalsData.forEach((record: any) => {
              incomeGoals[record.year] = record.income_goal;
            });
          }
          setIncomeGoalData(incomeGoals);

          // Fetch raw shifts for the user
          const { data: shiftsData, error: shiftsError } = await supabase
            .from('shifts')
            .select('*')
            .eq('user_id', user.id);
          if (shiftsError) {
            console.error('Error fetching shifts:', shiftsError);
          }
          if (shiftsData) {
            setShifts(shiftsData as Shift[]);
          }

          // Determine available years from income goals and shifts
          const shiftYears = shiftsData
            ? Array.from(
                new Set(
                  shiftsData.map((shift: Shift) =>
                    new Date(shift.endDate).getFullYear().toString()
                  )
                )
              )
            : [];
          const availableYears = Array.from(
            new Set([...Object.keys(incomeGoals), ...shiftYears])
          ).sort();
          const currentYear = new Date().getFullYear().toString();
          if (availableYears.includes(currentYear)) {
            setSelectedYear(currentYear);
          } else if (availableYears.length > 0) {
            setSelectedYear(availableYears[0]);
          }
        }
      } catch (error) {
        console.error('localStorage データの解析エラー:', error);
      }
    };
    fetchUserData();
  }, []);

  if (!incomeGoalData || shifts.length === 0 || !selectedYear) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // Compute available years for the buttons
  const shiftYears = shifts.map((shift) =>
    new Date(shift.endDate).getFullYear().toString()
  );
  const availableYears = Array.from(
    new Set([...Object.keys(incomeGoalData), ...shiftYears])
  ).sort();

  const incomeGoal =
    selectedYear in incomeGoalData ? incomeGoalData[selectedYear] : 0;
  const numericIncomeGoal =
    typeof incomeGoal === 'string' ? Number(incomeGoal) : incomeGoal;

  // Filter shifts for the selected year
  const shiftsInYear = shifts.filter(
    (shift) => new Date(shift.endDate).getFullYear().toString() === selectedYear
  );

  // Aggregate income for each unique job from shiftsInYear
  const aggregatedJobs = shiftsInYear.reduce(
    (acc: Record<string, number>, shift) => {
      const income = Number(shift.income) || 0;
      acc[shift.job] = (acc[shift.job] || 0) + income;
      return acc;
    },
    {}
  );

  // Build pie chart data from the aggregated jobs
  const aggregatedPieData = Object.entries(aggregatedJobs).map(
    ([job, income]) => ({
      name: job,
      income,
      percentage:
        numericIncomeGoal > 0
          ? ((income / numericIncomeGoal) * 100).toFixed(2)
          : '0.00',
    })
  );

  // Total income from all shifts for the year
  const totalShiftsIncome = shiftsInYear.reduce(
    (acc, shift) => acc + (Number(shift.income) || 0),
    0
  );

  // If the total income is less than the target, add a slice for the remaining target
  if (numericIncomeGoal > totalShiftsIncome) {
    const remainingIncome = numericIncomeGoal - totalShiftsIncome;
    aggregatedPieData.push({
      name: '未達成',
      income: remainingIncome,
      percentage: ((remainingIncome / numericIncomeGoal) * 100).toFixed(2),
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar onMenuToggle={setMenuOpen} />
      <main
        className={`container mx-auto py-10 transition-all ${menuOpen ? 'mt-88' : 'mt-12'} px-4`}
      >
        <h1 className="mb-6 text-center text-3xl font-semibold">給料見込</h1>
        <Link href="/">
          <button className="mb-4 rounded bg-teal-500 px-4 py-2 text-white">
            戻る
          </button>
        </Link>

        {/* 年選択ボタン */}
        <div className="mb-4 flex flex-wrap justify-center space-x-4">
          {availableYears.map((year) => (
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

        <h2 className="mb-4 text-2xl font-bold">目標金額：{incomeGoal}円</h2>
        <PieChart width={400} height={400}>
          <Pie
            data={aggregatedPieData}
            dataKey="income"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label={({ name, percentage, income }) =>
              `${name}: ${percentage}% (${income})`
            }
          >
            {aggregatedPieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, name]}
          />
          <Legend />
        </PieChart>
        <p className="mt-4 text-lg">給料見込み: {totalShiftsIncome}円</p>
      </main>
    </div>
  );
};

export default PieChartPage;

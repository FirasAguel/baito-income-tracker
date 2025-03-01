// src/app/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Shift, JobRate } from '../../types';
import Link from 'next/link';

interface JobStatistics {
  job: string;
  daily: {
    income: { [date: string]: number };
    hours: { [date: string]: number };
  };
  monthly: {
    income: { [month: string]: number };
    hours: { [month: string]: number };
  };
  yearly: {
    income: { [year: string]: number };
  };
}

export default function IncomeStatistics() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [jobRates, setJobRates] = useState<JobRate[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedShifts = localStorage.getItem('shifts');
      if (storedShifts) setShifts(JSON.parse(storedShifts));
      const storedJobRates = localStorage.getItem('jobRates');
      if (storedJobRates) setJobRates(JSON.parse(storedJobRates));
    } catch (e) {
      console.error('データの読み込みに失敗しました', e);
      setError('データの読み込みに失敗しました');
    }
  }, []);

  const getSums = (
    shiftsData: Shift[],
    type: 'daily' | 'monthly' | 'yearly'
  ) => {
    const incomeSums: { [key: string]: { income: number; hours: number } } = {};

    shiftsData.forEach((shift) => {
      if (!shift.endDate) return;
      const date = new Date(shift.endDate);
      let key = '';

      if (type === 'daily') {
        key = shift.endDate;
      } else if (type === 'monthly') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        key = date.getFullYear().toString();
      }

      if (!incomeSums[key]) {
        incomeSums[key] = { income: 0, hours: 0 };
      }
      incomeSums[key].income += shift.income || 0;
      incomeSums[key].hours += shift.hours || 0;
    });

    return incomeSums;
  };

  const filteredShifts =
    selectedJob === 'all'
      ? shifts
      : shifts.filter((shift) => shift.job === selectedJob);

  const dailySums = getSums(filteredShifts, 'daily');
  const monthlySums = getSums(filteredShifts, 'monthly');
  const yearlySums = getSums(filteredShifts, 'yearly');

  useEffect(() => {
    if (shifts.length > 0 && jobRates.length > 0) {
      const stats: JobStatistics[] = jobRates.map((jobRate) => {
        const job = jobRate.job;
        const jobShifts = shifts.filter((shift) => shift.job === job);
        const daily = getSums(jobShifts, 'daily');
        const monthly = getSums(jobShifts, 'monthly');
        const yearly = getSums(jobShifts, 'yearly');
        const yearlyIncome = Object.fromEntries(
          Object.entries(yearly).map(([k, v]) => [k, v.income])
        );

        return {
          job,
          daily: {
            income: Object.fromEntries(
              Object.entries(daily).map(([k, v]) => [k, v.income])
            ),
            hours: Object.fromEntries(
              Object.entries(daily).map(([k, v]) => [k, v.hours])
            ),
          },
          monthly: {
            income: Object.fromEntries(
              Object.entries(monthly).map(([k, v]) => [k, v.income])
            ),
            hours: Object.fromEntries(
              Object.entries(monthly).map(([k, v]) => [k, v.hours])
            ),
          },
          yearly: {
            income: yearlyIncome,
          },
        };
      });
      // all jobs
      const allDaily = getSums(shifts, 'daily');
      const allMonthly = getSums(shifts, 'monthly');
      const allYearly = getSums(shifts, 'yearly');
      const allYearlyIncome = Object.fromEntries(
        Object.entries(allYearly).map(([k, v]) => [k, v.income])
      );
      const allStats: JobStatistics = {
        job: 'all',
        daily: {
          income: Object.fromEntries(
            Object.entries(allDaily).map(([k, v]) => [k, v.income])
          ),
          hours: Object.fromEntries(
            Object.entries(allDaily).map(([k, v]) => [k, v.hours])
          ),
        },
        monthly: {
          income: Object.fromEntries(
            Object.entries(allMonthly).map(([k, v]) => [k, v.income])
          ),
          hours: Object.fromEntries(
            Object.entries(allMonthly).map(([k, v]) => [k, v.hours])
          ),
        },
        yearly: {
          income: allYearlyIncome,
        },
      };
      stats.push(allStats);
      localStorage.setItem('jobStatistics', JSON.stringify(stats));
    }
  }, [shifts, jobRates]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">収入履歴</h1>
      <Link href="/home">
        <button className="mb-4 rounded bg-teal-500 px-4 py-2 text-white">
          戻る
        </button>
      </Link>

      <div className="mb-4">
        <select
          className="mr-2 border p-2"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          <option value="all">All</option>
          {jobRates.map((job) => (
            <option key={job.job} value={job.job}>
              {job.job}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* Daily Sum */}
      <div className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">日別履歴</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-[#c7dfde]">
              <tr>
                <th className="border border-gray-200 px-4 py-2">日付</th>
                <th className="border border-gray-200 px-4 py-2">収入</th>
                <th className="border border-gray-200 px-4 py-2">勤務時間</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailySums).map(([date, { income, hours }]) => (
                <tr key={date} className="border-b">
                  <td className="border border-gray-200 px-4 py-2">{date}</td>
                  <td className="border border-gray-200 px-4 py-2">{income}</td>
                  <td className="border border-gray-200 px-4 py-2">{hours}</td>
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
            <thead className="bg-[#c7dfde]">
              <tr>
                <th className="border border-gray-200 px-4 py-2">月</th>
                <th className="border border-gray-200 px-4 py-2">収入</th>
                <th className="border border-gray-200 px-4 py-2">勤務時間</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlySums).map(([date, { income, hours }]) => (
                <tr key={date} className="border-b">
                  <td className="border border-gray-200 px-4 py-2">{date}</td>
                  <td className="border border-gray-200 px-4 py-2">{income}</td>
                  <td className="border border-gray-200 px-4 py-2">{hours}</td>
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
            <thead className="bg-[#c7dfde]">
              <tr>
                <th className="border border-gray-200 px-4 py-2">年</th>
                <th className="border border-gray-200 px-4 py-2">収入</th>
                <th className="border border-gray-200 px-4 py-2">勤務時間</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(yearlySums).map(([date, { income, hours }]) => (
                <tr key={date} className="border-b">
                  <td className="border border-gray-200 px-4 py-2">{date}</td>
                  <td className="border border-gray-200 px-4 py-2">{income}</td>
                  <td className="border border-gray-200 px-4 py-2">{hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

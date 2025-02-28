// src/app/shift_settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface JobRate {
  id: number;
  job: string;
  rate: number;
  nightRate: number;
}

export default function JobSettings() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobRates, setJobRates] = useState<JobRate[]>([]);
  const [newJob, setNewJob] = useState('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedJobRates = localStorage.getItem('jobRates');
    if (savedJobRates) {
      const parsedJobRates = JSON.parse(savedJobRates).map((job: JobRate) => ({
        ...job,
        rate: Number(job.rate) || 0,
        nightRate:
          Math.round(Number(job.nightRate)) ||
          Math.round(Number(job.rate) * 1.25),
      }));
      setJobRates(parsedJobRates);
    } else {
      setJobRates([
        { id: 1, job: 'コンビニ', rate: 1200, nightRate: 1200 * 1.25 },
        { id: 2, job: 'カフェ', rate: 1300, nightRate: 1300 * 1.25 },
      ]);
    }
  }, []);

  const addJobRate = () => {
    if (newJob && newRate) {
      const newId =
        jobRates.length > 0 ? jobRates[jobRates.length - 1].id + 1 : 1;
      const rate = Number(newRate) || 0;
      const nightRate = Math.round(rate * 1.25);
      const updatedJobRates = [
        ...jobRates,
        { id: newId, job: newJob, rate, nightRate },
      ];
      setJobRates(updatedJobRates);
      localStorage.setItem('jobRates', JSON.stringify(updatedJobRates));
      setNewJob('');
      setNewRate('');
      setError(null);
    } else {
      setError('勤務先と時給を入力してください。');
    }
  };

  const deleteJobRate = (id: number) => {
    const updatedJobRates = jobRates.filter((j) => j.id !== id);
    setJobRates(updatedJobRates);
    localStorage.setItem('jobRates', JSON.stringify(updatedJobRates));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar onMenuToggle={setMenuOpen} />
      <main
        className={`container mx-auto py-10 transition-all ${menuOpen ? 'mt-88' : 'mt-12'} px-4`}
      >
        <h1 className="mb-4 text-2xl font-bold">勤務先と時給設定</h1>
        <Link href="/">
          <button className="mb-4 rounded bg-teal-500 px-4 py-2 text-white">
            戻る
          </button>
        </Link>
        {error && <div className="mb-4 text-red-500">{error}</div>}

        <div className="mb-6">
          <input
            type="text"
            placeholder="勤務先"
            className="mr-2 border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={newJob}
            onChange={(e) => setNewJob(e.target.value)}
          />
          <input
            type="number"
            placeholder="時給"
            className="mr-2 w-24 border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={newRate}
            onChange={(e) => setNewRate(Number(e.target.value) || '')}
          />
          <button
            onClick={addJobRate}
            className="rounded bg-teal-500 px-4 py-2 text-white"
          >
            追加
          </button>
        </div>

        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">勤務先</th>
              <th className="px-4 py-2">通常時給 (円)</th>
              <th className="px-4 py-2">深夜時給 (円)</th>
              <th className="px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {jobRates.map((job) => (
              <tr key={job.id} className="border-b">
                <td className="px-4 py-2 text-center">{job.job}</td>
                <td className="px-4 py-2 text-center">{job.rate}</td>
                <td className="px-4 py-2 text-center">{job.nightRate}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => deleteJobRate(job.id)}
                    className="rounded bg-red-500 px-3 py-1 text-white"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

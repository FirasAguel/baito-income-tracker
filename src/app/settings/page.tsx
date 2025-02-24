// src/app/settings/page.tsx
'use client';

import { useState } from 'react';

interface JobRate {
  id: number;
  job: string;
  rate: number;
}

export default function JobSettings() {
  const [jobRates, setJobRates] = useState<JobRate[]>([
    { id: 1, job: 'コンビニ', rate: 1200 },
    { id: 2, job: 'カフェ', rate: 1300 },
  ]);
  const [newJob, setNewJob] = useState('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const addJobRate = () => {
    if (newJob && newRate) {
      const newId = jobRates.length > 0 ? jobRates[jobRates.length - 1].id + 1 : 1;
      setJobRates([...jobRates, { id: newId, job: newJob, rate: Number(newRate) }]);
      setNewJob('');
      setNewRate('');
      setError(null);
    } else {
      setError('勤務先と時給を入力してください。');
    }
  };

  const deleteJobRate = (id: number) => {
    setJobRates(jobRates.filter((j) => j.id !== id));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">勤務先と時給設定</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="勤務先"
          className="mr-2 border p-2"
          value={newJob}
          onChange={(e) => setNewJob(e.target.value)}
        />
        <input
          type="number"
          placeholder="時給"
          className="mr-2 border p-2 w-24"
          value={newRate}
          onChange={(e) => setNewRate(Number(e.target.value) || '')}
        />
        <button
          onClick={addJobRate}
          className="rounded bg-blue-500 px-4 py-2 text-white"
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
              <td className="px-4 py-2 text-center">{(job.rate * 1.25).toFixed(0)}</td>
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
    </div>
  );
}

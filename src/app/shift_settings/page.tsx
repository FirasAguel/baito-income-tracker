// src/app/shift_settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface JobRate {
  id: number;
  job: string;
  rate: number;
  nightRate: number;
}

export default function JobSettings() {
  const [jobRates, setJobRates] = useState<JobRate[]>([]);
  const [newJob, setNewJob] = useState('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from('job_rates')
          .select('*')
          .eq('user_id', user.id); 
        if (error) {
          console.error('Error fetching job rates:', error);
        } else {
          setJobRates(data || []);
        }
      }
    };
    fetchUserData();
  }, []);

  const addJobRate = async () => {
    if (newJob && newRate) {
      const rate = Number(newRate) || 0;
      const nightRate = Math.round(rate * 1.25);
      const { data, error } = await supabase
        .from('job_rates')
        .insert([{ job: newJob, rate, nightRate }])
        .select();
      if (error) {
        console.error('Error adding job rate:', error);
        setError('データ追加に失敗しました。');
      } else {
        setJobRates([...jobRates, ...(data || [])]);
        setNewJob('');
        setNewRate('');
        setError(null);
      }
    } else {
      setError('勤務先と時給を入力してください。');
    }
  };

  const deleteJobRate = async (id: number) => {
    if (!userId) return;

    const { error } = await supabase
      .from('job_rates')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); 

    if (error) {
      console.error('Error deleting job rate:', error);
    } else {
      setJobRates(jobRates.filter((j) => j.id !== id));
    }
  };


  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">勤務先と時給設定</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">戻る</button>
      </Link>
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
    </div>
  );
}

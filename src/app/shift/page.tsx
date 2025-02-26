// src/app/shift/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { JobRate } from '../../types';
import Link from 'next/link';

interface Shift {
  id: number;
  startDate: string;
  endDate: string;
  job: string;
  hours: number;
  startTime: string; // 出勤時間
  endTime: string;   // 退社時間
  rate: number;
  nightRate: number;
  income: number;
}

export default function ShiftCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [jobRates, setJobRates] = useState<JobRate[]>([]);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    startTime: '',
    endTime: '',
    hours: 0,
    job: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load jobRates from localStorage
    const savedJobRates = localStorage.getItem('jobRates');
    if (savedJobRates) {
      const parsedJobRates: JobRate[] = JSON.parse(savedJobRates);
      setJobRates(parsedJobRates);
      if (parsedJobRates.length > 0) {
        setNewShift((prevState) => ({
          ...prevState,
          job: parsedJobRates[0].job,
          rate: parsedJobRates[0].rate,
          nightRate: parsedJobRates[0].nightRate,
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (newShift.job) {
      const foundJob = jobRates.find((j) => j.job === newShift.job);
      if (foundJob) {
        setNewShift((prev) => ({ ...prev, rate: foundJob.rate }));
      }
    }
  }, [newShift.job, jobRates]);

  // 勤務時間を計算する関数（退社時間 - 出勤時間）
  const calculateWorkHours = (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end.getTime() - start.getTime();
    return diffInMs / (1000 * 60 * 60); // ミリ秒を時間に変換
  };

  // 退社時間を計算する関数（出勤時間 + 勤務時間）
  const calculateEndTime = (startTime: string, hours: number): string => {
    const start = new Date(startTime);
    const totalMinutes = hours * 60; 
    start.setMinutes(start.getMinutes() + totalMinutes); 
    return start.toLocaleString('ja-JP', {
      hour12: false, 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  };

  // 出勤時間を計算する関数（退社時間 - 勤務時間）
  const calculateStartTime = (endTime: string, hours: number): string => {
    const end = new Date(endTime);
    const totalMinutes = hours * 60; 
    end.setMinutes(end.getMinutes() - totalMinutes);
    return end.toLocaleString('ja-JP', {
      hour12: false, 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  };

  const calculateIncome = (startTime: string, endTime: string, rate: number, nightRate: number): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    let totalIncome = 0;
  
    while (start < end) {
      const currentHour = start.getHours();
      const currentMinute = start.getMinutes();
  
      const isNightTime =
        (currentHour > 22 || (currentHour === 22 && currentMinute >= 0)) || 
        (currentHour < 4 || (currentHour === 4 && currentMinute <= 59));  
  
      const currentRate = isNightTime ? nightRate : rate;
      totalIncome += currentRate / 60; 
  
      start.setMinutes(start.getMinutes() + 1);
    }
  
    return Math.round(totalIncome); 
  };


  const addShift = () => {
    // 勤務先が入力されていない場合、エラーを表示して処理を中断
    if (!newShift.job) {
      setError('勤務先を選択してください');
      return;
    }

    const selectedJob = jobRates.find((j) => j.job === newShift.job);
    if (!selectedJob) {
      setError('設定に勤務先を入力してください');
      return;
    }

    const rate = selectedJob.rate;
    const nightRate = selectedJob.nightRate;
    let shift: Shift | null = null;
  
    if (newShift.startTime && newShift.endTime) {
      // ケース1：出勤時間と退社時間が入力されている場合、勤務時間を計算する
      const hours = calculateWorkHours(newShift.startTime, newShift.endTime);
      const income = calculateIncome(newShift.startTime, newShift.endTime, rate, nightRate);
      shift = {
        id: Date.now(),
        startDate: newShift.startTime.split('T')[0],
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        rate: rate,
        nightRate: nightRate,
        income: income,
      };
    } else if (newShift.startTime && newShift.hours) {
      // ケース2：出勤時間と勤務時間が入力されている場合、退社時間を計算する
      const endTime = calculateEndTime(newShift.startTime, newShift.hours);
      const income = calculateIncome(newShift.startTime, endTime, rate, nightRate);
      shift = {
        id: Date.now(),
        startDate: newShift.startTime.split('T')[0],
        endDate: endTime.split('T')[0],
        job: newShift.job,
        hours: newShift.hours,
        startTime: newShift.startTime,
        endTime,
        rate: rate,
        nightRate: nightRate,
        income: income,
      };
    } else if (newShift.endTime && newShift.hours) {
      // ケース3：退社時間と勤務時間が入力されている場合、出勤時間を計算する
      const startTime = calculateStartTime(newShift.endTime, newShift.hours);
      const income = calculateIncome(startTime, newShift.endTime, rate, nightRate);
      shift = {
        id: Date.now(),
        startDate: startTime.split('T')[0],
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours: newShift.hours,
        startTime,
        endTime: newShift.endTime,
        rate: rate,
        nightRate: nightRate,
        income: income,
      };
    } else {
      // 必要な2つの項目が入力されていない場合、エラーを表示する
      setError('勤務先とともに、出勤時間、退社時間、または勤務時間のうち2つを入力してください。');
      return;
    }
    setShifts([...shifts, shift]);
    setNewShift({ startTime: '', endTime: '', hours: 0, job: jobRates[0]?.job || '' });
    setError(null);
  };

  const deleteShift = (id: number) => {
    setShifts(shifts.filter((shift) => shift.id !== id));
  };

  const formatTimeDisplay = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString('ja-JP', {
      hour12: false, 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ''); 
  };
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}時間${m}分`;
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">シフト管理カレンダー</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">戻る</button>
      </Link>
      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* シフト入力フォーム */}
      <div className="mb-6">
      <select
          className="mr-2 border p-2"
          value={newShift.job || ''}
          onChange={(e) => setNewShift({ ...newShift, job: e.target.value })}
        >
          {jobRates.map((job) => (
            <option key={job.job} value={job.job}>{job.job}</option>
          ))}
        </select>
         <input
          type="datetime-local"
          placeholder="出勤時間"
          className="mr-2 border p-2"
          value={newShift.startTime || ''}
          onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value})}
        />
        {/* 退社時間が入力されていなければ勤務時間を入力 */}
        <input
          type="datetime-local"
          placeholder="退勤時間"
          className="mr-2 border p-2"
          value={newShift.endTime || ''}
          onChange={e => setNewShift({ ...newShift, endTime: e.target.value})}
        />
        {/* 勤務時間が入力されていなければ退社時間を入力 */}
        <input
          type="number"
          placeholder="勤務時間"
          className="mr-2 w-24 border p-2"
          value={newShift.hours || ''}
          onChange={e => setNewShift({ ...newShift, hours: Number(e.target.value)})}
        />
        <button
          onClick={addShift}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          追加
        </button>
      </div>

      {/* シフト表示一覧 */}
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">日付</th>
            <th className="px-4 py-2">勤務先</th>
            <th className="px-4 py-2">出勤時間</th>
            <th className="px-4 py-2">退勤時間</th>
            <th className="px-4 py-2">勤務時間 (h)</th>
            <th className="px-4 py-2">収入 (¥)</th>
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-b">
              <td className="px-4 py-2 text-center">{shift.startDate}</td>
              <td className="px-4 py-2 text-center">{shift.job}</td>
              <td className="px-4 py-2 text-center">{formatTimeDisplay(shift.startTime)}</td>
              <td className="px-4 py-2 text-center">{formatTimeDisplay(shift.endTime)}</td>
              <td className="px-4 py-2 text-center">{formatHours(shift.hours)}</td>
              <td className="px-4 py-2 text-center">{shift.income}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => deleteShift(shift.id)}
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

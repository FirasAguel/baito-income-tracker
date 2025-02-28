'use client';

import { useState, useEffect } from 'react';
import { JobRate } from '../../types';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Shift {
  id: number;
  startDate: string;
  endDate: string;
  job: string;
  hours: number;
  startTime: string;
  endTime: string;
  rate: number;
  nightRate: number;
  income: number;
}

export default function ShiftCalendar() {
  // Single declarations for state variables
  const [menuOpen, setMenuOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [jobRates, setJobRates] = useState<JobRate[]>([]);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    startTime: '',
    endTime: '',
    hours: 0,
    job: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Combined useEffect for initializing state from localStorage
  useEffect(() => {
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
    const savedShifts = localStorage.getItem('shifts');
    if (savedShifts) {
      const parsedShifts: Shift[] = JSON.parse(savedShifts);
      setShifts(parsedShifts);
    }
  }, []);

  // Update newShift when job changes
  useEffect(() => {
    if (newShift.job) {
      const foundJob = jobRates.find((j) => j.job === newShift.job);
      if (foundJob) {
        setNewShift((prev) => ({
          ...prev,
          rate: foundJob.rate,
          nightRate: foundJob.nightRate,
        }));
      }
    }
  }, [newShift.job, jobRates]);

  // Helper functions
  const calculateWorkHours = (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end.getTime() - start.getTime();
    return diffInMs / (1000 * 60 * 60);
  };

  // Calculate end time (出勤時間 + 勤務時間)
  const calculateEndTime = (startTime: string, hours: number): string => {
    const start = new Date(startTime);
    const totalMinutes = hours * 60;
    start.setMinutes(start.getMinutes() + totalMinutes);
    return start
      .toLocaleString('ja-JP', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', '');
  };

  // Calculate start time (退社時間 - 勤務時間)
  const calculateStartTime = (endTime: string, hours: number): string => {
    const end = new Date(endTime);
    const totalMinutes = hours * 60;
    end.setMinutes(end.getMinutes() - totalMinutes);
    return end
      .toLocaleString('ja-JP', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', '');
  };

  const calculateIncome = (
    startTime: string,
    endTime: string,
    rate: number,
    nightRate: number
  ): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    let totalIncome = 0;
    while (start < end) {
      const currentHour = start.getHours();
      const currentMinute = start.getMinutes();
      const isNightTime =
        currentHour > 22 ||
        (currentHour === 22 && currentMinute >= 0) ||
        currentHour < 4 ||
        (currentHour === 4 && currentMinute <= 59);
      const currentRate = isNightTime ? nightRate : rate;
      totalIncome += currentRate / 60;
      start.setMinutes(start.getMinutes() + 1);
    }
    return Math.round(totalIncome);
  };

  const addShift = () => {
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
      // Case 1: Both start and end times are provided.
      const hours = calculateWorkHours(newShift.startTime, newShift.endTime);
      const income = calculateIncome(
        newShift.startTime,
        newShift.endTime,
        rate,
        nightRate
      );
      shift = {
        id: Date.now(),
        startDate: newShift.startTime.split('T')[0],
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        rate,
        nightRate,
        income,
      };
    } else if (newShift.startTime && newShift.hours) {
      // Case 2: Start time and work hours provided.
      const endTime = calculateEndTime(newShift.startTime, newShift.hours);
      const income = calculateIncome(
        newShift.startTime,
        endTime,
        rate,
        nightRate
      );
      shift = {
        id: Date.now(),
        startDate: newShift.startTime.split('T')[0],
        endDate: endTime.split(' ')[0].replace(/\//g, '-'),
        job: newShift.job,
        hours: newShift.hours,
        startTime: newShift.startTime,
        endTime,
        rate,
        nightRate,
        income,
      };
    } else if (newShift.endTime && newShift.hours) {
      // Case 3: End time and work hours provided.
      const startTime = calculateStartTime(newShift.endTime, newShift.hours);
      const income = calculateIncome(
        startTime,
        newShift.endTime,
        rate,
        nightRate
      );
      shift = {
        id: Date.now(),
        startDate: startTime.split(' ')[0].replace(/\//g, '-'),
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours: newShift.hours,
        startTime,
        endTime: newShift.endTime,
        rate,
        nightRate,
        income,
      };
    } else {
      setError(
        '勤務先とともに、出勤時間、退社時間、または勤務時間のうち2つを入力してください。'
      );
      return;
    }
    const updatedShifts = [...shifts, shift];
    setShifts(updatedShifts);
    localStorage.setItem('shifts', JSON.stringify(updatedShifts));
    setNewShift({
      startTime: '',
      endTime: '',
      hours: 0,
      job: jobRates[0]?.job || '',
    });
    setError(null);
  };

  const deleteShift = (id: number) => {
    const updatedShifts = shifts.filter((shift) => shift.id !== id);
    setShifts(updatedShifts);
    localStorage.setItem('shifts', JSON.stringify(updatedShifts));
  };

  const formatTimeDisplay = (time: string) => {
    const date = new Date(time);
    return date
      .toLocaleString('ja-JP', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', '');
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}時間${m}分`;
  };

  return (
    <div className="container mx-auto py-10">
      <Navbar onMenuToggle={setMenuOpen} />
      {/*<main className={`transition-all ${menuOpen ? 'mt-76' : ''} p-6`}></main>*/}
      <h1 className="mb-4 text-2xl font-bold">シフト管理カレンダー</h1>
      <Link href="/">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
          戻る
        </button>
      </Link>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <main
        className={`container mx-auto py-10 transition-all ${menuOpen ? 'mt-88' : 'mt-12'} px-4`}
      >
        <Link href="/">
          <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
            戻る
          </button>
        </Link>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <select className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none" />
          <input
            type="datetime-local"
            className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <input
            type="number"
            className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <button className="w-full max-w-xs rounded bg-blue-500 px-4 py-2 text-white">
            追加
          </button>
        </div>
      </main>
    </div>
  );
}

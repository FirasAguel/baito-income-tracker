'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { JobRate } from '../../types';
import Link from 'next/link';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import supabase from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Shift {
  id: number;
  startDate: string;
  endDate: string;
  job: string;
  hours: number;
  startTime: string; // 出勤時間
  endTime: string; // 退社時間
  rate: number;
  nightRate: number;
  income: number;
  user_id?: string | null;
}

export default function ShiftCalendar() {
  // State declarations
  const [menuOpen, setMenuOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [jobRates, setJobRates] = useState<JobRate[]>([]);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    startTime: '',
    endTime: '',
    hours: 0,
    job: '',
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user data, job rates, and shifts from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log('Current user ID:', user.id);
        const { data: jobRatesData } = await supabase
          .from('job_rates')
          .select('*')
          .eq('user_id', user.id);
        if (jobRatesData) {
          setJobRates(jobRatesData);
          if (jobRatesData.length > 0) {
            setNewShift((prevState) => ({
              ...prevState,
              job: jobRatesData[0].job,
              rate: jobRatesData[0].rate,
              nightRate: jobRatesData[0].nightRate,
            }));
            const { data: shiftsData } = await supabase
              .from('shifts')
              .select('*')
              .eq('user_id', user.id);
            if (shiftsData) setShifts(shiftsData);
          }
        }
      } else {
        console.error('User is not authenticated');
      }
    };

    fetchUserData();
  }, []);

  // Calculate work hours (退社時間 - 出勤時間)
  // Helper functions
  const calculateWorkHours = (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  // Calculate end time (出勤時間 + 勤務時間)
  // Calculate end time (出勤時間 + 勤務時間)
  const calculateEndTime = (startTime: string, hours: number): string => {
    const start = new Date(startTime);
    start.setMinutes(start.getMinutes() + hours * 60);
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
    end.setMinutes(end.getMinutes() - hours * 60);
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

  // Format date string to JST
  const formatToJST = (dateStr: string): string => {
    const dt = new Date(dateStr);
    return dt
      .toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
      .replace(',', '');
  };

  const formatTimeDisplay = (time: string): string => {
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
  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}時間${m}分`;
  };

  const addShift = async () => {
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
    // Get the next shift id from Supabase
    const { data: existingShifts } = await supabase
      .from('shifts')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    const nextId =
      existingShifts && existingShifts.length > 0
        ? existingShifts[0].id + 1
        : 1;
    let shift: Shift | null = null;

    if (newShift.startTime && newShift.endTime) {
      // Case 1: Both start and end times are provided.
      const hours = calculateWorkHours(newShift.startTime, newShift.endTime);
      const startTimeFormatted = formatToJST(newShift.startTime);
      const endTimeFormatted = formatToJST(newShift.endTime);
      const income = calculateIncome(
        newShift.startTime,
        newShift.endTime,
        rate,
        nightRate
      );
      shift = {
        id: nextId,
        startDate: newShift.startTime.split('T')[0],
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        rate,
        nightRate,
        income,
        user_id: userId,
      };
    } else if (newShift.startTime && newShift.hours) {
      const calculatedEndTime = calculateEndTime(
        newShift.startTime,
        newShift.hours
      );
      const startTimeFormatted = formatToJST(newShift.startTime);
      const endTimeFormatted = formatToJST(calculatedEndTime);
      const income = calculateIncome(
        newShift.startTime,
        calculatedEndTime,
        rate,
        nightRate
      );
      shift = {
        id: nextId,
        startDate: newShift.startTime.split('T')[0],
        endDate: calculatedEndTime.split(' ')[0].replace(/\//g, '-'),
        job: newShift.job,
        hours: newShift.hours,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        rate,
        nightRate,
        income,
        user_id: userId,
      };
    } else if (newShift.endTime && newShift.hours) {
      const calculatedStartTime = calculateStartTime(
        newShift.endTime,
        newShift.hours
      );
      const startTimeFormatted = formatToJST(calculatedStartTime);
      const endTimeFormatted = formatToJST(newShift.endTime);
      const income = calculateIncome(
        calculatedStartTime,
        newShift.endTime,
        rate,
        nightRate
      );
      shift = {
        id: nextId,
        startDate: calculatedStartTime.split(' ')[0].replace(/\//g, '-'),
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours: newShift.hours,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        rate,
        nightRate,
        income,
        user_id: userId,
      };
    } else {
      setError(
        '勤務先とともに、出勤時間、退社時間、または勤務時間のうち2つを入力してください。'
      );
      return;
    }

    const { error: insertError } = await supabase
      .from('shifts')
      .insert([shift]);
    if (insertError) {
      console.error(insertError);
      setError('シフトの追加に失敗しました。');
      return;
    }
    // Refresh shifts list
    const { data: shiftsData } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId);
    if (shiftsData) {
      setShifts(shiftsData);
    }
    setNewShift({
      startTime: '',
      endTime: '',
      hours: 0,
      job: jobRates[0]?.job || '',
    });
    setError(null);
  };

  const deleteShift = async (id: number) => {
    const { error: deleteError } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id);
    if (deleteError) {
      setError('シフトの削除に失敗しました。');
      return;
    }
    setShifts(shifts.filter((shift) => shift.id !== id));
  };

  // Toast Warning Hook using shifts data (without jobStatistics)
  useEffect(() => {
    if (!shifts || shifts.length === 0) return;

    const currentYear = new Date().getFullYear().toString();
    const today = new Date();

    // Calculate current week (Monday to Sunday)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Sum hours for shifts within the current week
    const weeklyShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.startDate);
      return shiftDate >= monday && shiftDate <= sunday;
    });
    const weeklyHours = weeklyShifts.reduce(
      (acc, shift) => acc + shift.hours,
      0
    );

    // Sum income for shifts in the current year
    const yearlyShifts = shifts.filter((shift) => {
      return new Date(shift.startDate).getFullYear().toString() === currentYear;
    });
    const yearlyIncome = yearlyShifts.reduce(
      (acc, shift) => acc + shift.income,
      0
    );

    // Weekly warning: if between 35 and 40 hours, show remaining hours warning
    if (weeklyHours >= 35 && weeklyHours < 40) {
      const remainingHours = 40 - weeklyHours;
      console.log('Showing weekly warning toast');
      toast.warning(`今週はあと${remainingHours}時間働けます.`, {
        position: 'top-right',
        autoClose: 10000,
      });
    }

    // Yearly warnings: split into two thresholds
    // Warning for approaching 103万円の壁
    if (yearlyIncome > 950000 && yearlyIncome < 1030000) {
      // When the remaining income is less than 10k yen, the floored number will be 0.
      const remainingIncome103 = Math.floor((1030000 - yearlyIncome) / 10000);
      const displayRemaining103 =
        remainingIncome103 > 0 ? `${remainingIncome103}万円` : '1万円未満';
      console.log('Showing yearly warning toast for 103万円');
      toast.warning(
        `今年はあと${displayRemaining103}で103万円の壁を超えてしまいます.`,
        {
          position: 'top-right',
          autoClose: 10000,
        }
      );
    }
    // Warning for approaching 130万円の壁
    if (yearlyIncome >= 1030000 && yearlyIncome < 1300000) {
      const remainingIncome130 = Math.floor((1300000 - yearlyIncome) / 10000);
      const displayRemaining130 =
        remainingIncome130 > 0 ? `${remainingIncome130}万円` : '1万円未満';
      console.log('Showing yearly warning toast for 130万円');
      toast.warning(
        `今年は103万円の壁をすでに超えてしまい、あと${displayRemaining130}で130万円の壁を超えてしまいます.`,
        {
          position: 'top-right',
          autoClose: 10000,
        }
      );
    }
  }, [shifts]);

  return (
    <div className="container mx-auto py-10">
      <Navbar onMenuToggle={setMenuOpen} />
      <main className={`transition-all ${menuOpen ? 'mt-88' : 'mt-12'} px-6`}>
        <h1 className="mb-4 text-2xl font-bold">シフト一覧</h1>
        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/home">
            <button className="mb-4 rounded bg-teal-500 px-4 py-2 text-white">
              戻る
            </button>
          </Link>
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {/* Shift Input Form */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <select
            className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={newShift.job || ''}
            onChange={(e) => setNewShift({ ...newShift, job: e.target.value })}
          >
            {jobRates.map((job) => (
              <option key={job.job} value={job.job}>
                {job.job}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            placeholder="出勤時間"
            className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={newShift.startTime || ''}
            onChange={(e) =>
              setNewShift({ ...newShift, startTime: e.target.value })
            }
          />
          <input
            type="datetime-local"
            placeholder="退勤時間"
            className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={newShift.endTime || ''}
            onChange={(e) =>
              setNewShift({ ...newShift, endTime: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="勤務時間"
            className="w-full max-w-xs border border-teal-500 p-2 text-teal-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={newShift.hours || ''}
            onChange={(e) =>
              setNewShift({ ...newShift, hours: Number(e.target.value) })
            }
          />
          <button
            onClick={addShift}
            className="w-20 max-w-xs rounded bg-teal-500 px-4 py-2 text-white"
          >
            追加
          </button>
        </div>
        {/* Shifts List Table */}
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
                <td className="px-4 py-2 text-center">
                  {formatTimeDisplay(shift.startTime)}
                </td>
                <td className="px-4 py-2 text-center">
                  {formatTimeDisplay(shift.endTime)}
                </td>
                <td className="px-4 py-2 text-center">
                  {formatHours(shift.hours)}
                </td>
                <td className="px-4 py-2 text-center">{shift.income}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => deleteShift(shift.id)}
                    className="rounded bg-red-400 px-3 py-1 text-white"
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

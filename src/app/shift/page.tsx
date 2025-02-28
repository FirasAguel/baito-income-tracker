// src/app/shift/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { JobRate, JobStatistics } from '../../types';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  user_id: string | null;
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
  const [jobStatistics, setJobStatistics] = useState<JobStatistics | null>(
    null
  ); // only needs job:"all"
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log('当前用户 ID:', user.id); // 确保获取到用户 ID
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

            const { data: jobStatsData } = await supabase
              .from('job_statistics')
              .select('*')
              .eq('job', 'all')
              .single();
            if (jobStatsData) setJobStatistics(jobStatsData);
          }
        }
      } else {
        console.error('ユーザーが認証されていません');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!jobStatistics) return;

    const currentYear = new Date().getFullYear().toString();
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDays = Math.floor(
      (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);
    const currentWeek = mondayDate.toISOString().split('T')[0];
    const weeklyHours = jobStatistics?.weekly?.hours?.[currentWeek] || 0;
    const yearlyIncome = jobStatistics?.yearly?.income?.[currentYear] || 0;

    if (weeklyHours >= 35 && weeklyHours < 40) {
      const remainingHours = 40 - weeklyHours;
      console.log('Showing weekly warning toast');
      toast.warning(`今週はあと${remainingHours}時間働けます.`, {
        position: 'top-right',
        autoClose: 5000,
      });
    }

    if (yearlyIncome > 950000 && yearlyIncome < 1300000) {
      const remainingIncome = Math.floor((1300000 - yearlyIncome) / 10000);
      console.log('Showing yearly warning toast');
      toast.warning(
        `今年はあと${remainingIncome}万円で103万円の壁を超えてしまいます.`,
        { position: 'top-right', autoClose: 5000 }
      );
    }
  }, [jobStatistics]);

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

  // 出勤時間を計算する関数（退社時間 - 勤務時間）
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

  const addShift = async () => {
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
    const { data: shifts } = await supabase
      .from('shifts')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    let shift: Shift | null = null;
    const nextId = shifts && shifts.length > 0 ? shifts[0].id + 1 : 1;

    const formatToJST = (date: string) => {
      const dt = new Date(date);
      return dt
        .toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        .replace(',', '');
    };

    if (newShift.startTime && newShift.endTime) {
      // ケース1：出勤時間と退社時間が入力されている場合、勤務時間を計算する
      const hours = calculateWorkHours(newShift.startTime, newShift.endTime);
      const endTime_f = formatToJST(new Date(newShift.endTime).toISOString());
      const startTime_f = formatToJST(
        new Date(newShift.startTime).toISOString()
      );
      const income = calculateIncome(
        newShift.startTime,
        newShift.endTime,
        rate,
        nightRate
      );
      console.log(startTime_f, endTime_f);
      shift = {
        id: nextId,
        startDate: newShift.startTime.split('T')[0],
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours,
        startTime: startTime_f,
        endTime: endTime_f,
        rate: rate,
        nightRate: nightRate,
        income: income,
        user_id: userId,
      };
    } else if (newShift.startTime && newShift.hours) {
      // ケース2：出勤時間と勤務時間が入力されている場合、退社時間を計算する

      const endTime = calculateEndTime(newShift.startTime, newShift.hours);
      const endTime_f = formatToJST(
        new Date(
          endTime.replace('/', '-').replace('/', '-').replace(' ', 'T')
        ).toISOString()
      );
      const startTime_f = formatToJST(
        new Date(newShift.startTime).toISOString()
      );
      const income = calculateIncome(
        newShift.startTime,
        endTime,
        rate,
        nightRate
      );
      shift = {
        id: nextId,
        startDate: newShift.startTime.split('T')[0],
        endDate: endTime.split(' ')[0].replace(/\//g, '-'),
        job: newShift.job,
        hours: newShift.hours,
        startTime: startTime_f,
        endTime: endTime_f,
        rate: rate,
        nightRate: nightRate,
        income: income,
        user_id: userId,
      };
    } else if (newShift.endTime && newShift.hours) {
      // ケース3：退社時間と勤務時間が入力されている場合、出勤時間を計算する
      const startTime = calculateStartTime(newShift.endTime, newShift.hours);
      const startTime_f = formatToJST(
        new Date(
          startTime.replace('/', '-').replace('/', '-').replace(' ', 'T')
        ).toISOString()
      );
      const income = calculateIncome(
        startTime,
        newShift.endTime,
        rate,
        nightRate
      );
      const endTime_f = formatToJST(new Date(newShift.endTime).toISOString());
      shift = {
        id: nextId,
        startDate: startTime.split(' ')[0].replace(/\//g, '-'),
        endDate: newShift.endTime.split('T')[0],
        job: newShift.job,
        hours: newShift.hours,
        startTime: startTime_f,
        endTime: endTime_f,
        rate: rate,
        nightRate: nightRate,
        income: income,
        user_id: userId,
      };
    } else {
      // 必要な2つの項目が入力されていない場合、エラーを表示する
      setError(
        '勤務先とともに、出勤時間、退社時間、または勤務時間のうち2つを入力してください。'
      );
      return;
    }
    const { data, error } = await supabase.from('shifts').insert([shift]);

    if (error) {
      console.error(error);
      console.log('Shifts data:', data);
      setError('シフトの追加に失敗しました。');
      return;
    }
    if (data && Array.isArray(data)) {
      setShifts((prevShifts) => [...prevShifts, ...data]);
    } else {
      setError('シフトのデータが正しく返されませんでした。');
    }
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
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) {
      setError('シフトの削除に失敗しました。');
      return;
    }
    setShifts(shifts.filter((shift) => shift.id !== id));
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
      <h1 className="mb-4 text-2xl font-bold">シフト管理カレンダー</h1>
      <Link href="/logout">
        <button className="mb-4 rounded bg-gray-500 px-4 py-2 text-white">
          logout
        </button>
      </Link>
      <button
        className="mb-4 rounded bg-blue-500 px-4 py-2 text-white"
        onClick={() => router.push('/shift_settings')}
      >
        勤務先設定
      </button>
      <button
        className="mb-4 rounded bg-green-500 px-4 py-2 text-white"
        onClick={() => router.push('/incomeGoal_setting')}
      >
        年収目標設定
      </button>
      <button
        className="mb-4 rounded bg-orange-500 px-4 py-2 text-white"
        onClick={() => router.push('/barChart')}
      >
        給料履歴
      </button>
      <button
        className="mb-4 rounded bg-purple-500 px-4 py-2 text-white"
        onClick={() => router.push('/pieChart')}
      >
        給料見込
      </button>
      <ToastContainer position="top-right" autoClose={5000} />
      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* シフト入力フォーム */}
      <div className="mb-6">
        <select
          className="mr-2 border p-2"
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
          className="mr-2 border p-2"
          value={newShift.startTime || ''}
          onChange={(e) =>
            setNewShift({ ...newShift, startTime: e.target.value })
          }
        />
        {/* 退社時間が入力されていなければ勤務時間を入力 */}
        <input
          type="datetime-local"
          placeholder="退勤時間"
          className="mr-2 border p-2"
          value={newShift.endTime || ''}
          onChange={(e) =>
            setNewShift({ ...newShift, endTime: e.target.value })
          }
        />
        {/* 勤務時間が入力されていなければ退社時間を入力 */}
        <input
          type="number"
          placeholder="勤務時間"
          className="mr-2 w-24 border p-2"
          value={newShift.hours || ''}
          onChange={(e) =>
            setNewShift({ ...newShift, hours: Number(e.target.value) })
          }
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

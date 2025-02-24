// src/app/shift/page.tsx
'use client';

import { useState} from 'react';

interface Shift {
  id: number;
  date: string;
  job: string;
  hours: number;
  startTime: string; // 出勤時間
  endTime: string;   // 退社時間
}

export default function ShiftCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, date: '2025-03-01', job: 'コンビニ', hours: 4.5, startTime: '2025-03-01T09:00', endTime: '2025-03-01T13:00' },
    { id: 2, date: '2025-03-02', job: 'カフェ', hours: 6, startTime: '2025-03-02T10:00', endTime: '2025-03-02T16:00' },
  ]);

  const [newShift, setNewShift] = useState<Partial<Shift>>({
    startTime: new Date().toLocaleString('ja-JP', {
      hour12: false, 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),// 現在の時刻をデフォルトとして設定
    endTime: '',
    hours: 0,
  });

  const [error, setError] = useState<string | null>(null);

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

  const addShift = () => {
    if (newShift.job && newShift.startTime && (newShift.endTime || newShift.hours)) {
      const shift = {
        id: Date.now(),
        date: newShift.startTime.split('T')[0],
        job: newShift.job,
        hours: newShift.hours || calculateWorkHours(newShift.startTime, newShift.endTime!),
        startTime: newShift.startTime,
        endTime: newShift.endTime || calculateEndTime(newShift.startTime, newShift.hours!),
      } as Shift;

      setShifts([...shifts, shift]);
      setNewShift({ startTime: new Date().toISOString().slice(0, 16), endTime: '', hours: 0 });
      setError(null);
    } else {
      setError('出勤時間、退社時間、または勤務時間をすべて入力してください。');
    }
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

      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* シフト入力フォーム */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="勤務先"
          className="mr-2 border p-2"
          value={newShift.job || ''}
          onChange={(e) => setNewShift({ ...newShift, job: e.target.value })}
        />
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
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-b">
              <td className="px-4 py-2 text-center">{shift.date}</td>
              <td className="px-4 py-2 text-center">{shift.job}</td>
              <td className="px-4 py-2 text-center">{formatTimeDisplay(shift.startTime)}</td>
              <td className="px-4 py-2 text-center">{formatTimeDisplay(shift.endTime)}</td>
              <td className="px-4 py-2 text-center">{formatHours(shift.hours)}</td>
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

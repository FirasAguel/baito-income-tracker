// src/pages/shift/index.tsx
'use client';

import { useState } from 'react';

interface Shift {
  id: number;
  date: string;
  job: string;
  hours: number;
}

export default function ShiftCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, date: '2025-03-01', job: 'コンビニ', hours: 4 },
    { id: 2, date: '2025-03-02', job: 'カフェ', hours: 6 },
  ]);

  const [newShift, setNewShift] = useState<Partial<Shift>>({});
  const [error, setError] = useState<string | null>(null);

  const addShift = () => {
    if (newShift.date && newShift.job && newShift.hours) {
      setShifts([...shifts, { id: Date.now(), ...newShift } as Shift]);
      setNewShift({});
      setError(null);
    } else {
      setError('日付、勤務先、勤務時間をすべて入力してください。');
    }
  };

  const deleteShift = (id: number) => {
    setShifts(shifts.filter((shift) => shift.id !== id));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">シフト管理カレンダー</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      {/* シフト入力フォーム */}
      <div className="mb-6">
        <input
          type="date"
          className="mr-2 border p-2"
          value={newShift.date || ''}
          onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
        />
        <input
          type="text"
          placeholder="勤務先"
          className="mr-2 border p-2"
          value={newShift.job || ''}
          onChange={(e) => setNewShift({ ...newShift, job: e.target.value })}
        />
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
            <th className="px-4 py-2">勤務時間 (h)</th>
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-b">
              <td className="px-4 py-2 text-center">{shift.date}</td>
              <td className="px-4 py-2 text-center">{shift.job}</td>
              <td className="px-4 py-2 text-center">{shift.hours}</td>
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

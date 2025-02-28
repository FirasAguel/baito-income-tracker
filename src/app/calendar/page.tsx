'use client';

import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

const locales = {
  'ja-JP': require('date-fns/locale/ja'),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function ShiftCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    const savedShifts = localStorage.getItem('shifts');
    if (savedShifts) {
      setShifts(JSON.parse(savedShifts));
    }
  }, []);

  // Convert shifts to calendar events
  const events: Event[] = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.job} - ¥${shift.income}`,
    start: new Date(shift.startTime),
    end: new Date(shift.endTime),
    allDay: false,
  }));

  return (
    <div className="flex h-screen flex-col">
      <h1 className="p-4 text-2xl font-bold">シフトカレンダー</h1>
      <div className="mb-4 flex-grow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }} // Auto-fit parent div
        />
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// Import drag and drop addon and its styles
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.scss';

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
  // eslint-disable-next-line
  'ja-JP': require('date-fns/locale/ja'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Wrap Calendar with drag and drop HOC
const DragAndDropCalendar = withDragAndDrop(Calendar);

// Income calculation function (same as in your manual input page)
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

  // Update shift when dragged & dropped
  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      setShifts((prev) => {
        const existing = prev.find((shift) => shift.id === event.id);
        if (!existing) return prev;

        const originalStart = new Date(existing.startTime);
        const originalEnd = new Date(existing.endTime);

        let newStartTime: Date;
        let newEndTime: Date;

        if (droppedOnAllDaySlot) {
          // In month view, only update the date portion,
          // keeping the original hours and minutes.
          newStartTime = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
            originalStart.getHours(),
            originalStart.getMinutes()
          );
          newEndTime = new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate(),
            originalEnd.getHours(),
            originalEnd.getMinutes()
          );
        } else {
          // Otherwise, update fully (for example, in week or day views)
          newStartTime = start;
          newEndTime = end;
        }

        const updatedIncome = calculateIncome(
          newStartTime.toISOString(),
          newEndTime.toISOString(),
          existing.rate,
          existing.nightRate
        );

        const updatedShift: Shift = {
          ...existing,
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          startDate: newStartTime.toISOString().split('T')[0],
          endDate: newEndTime.toISOString().split('T')[0],
          income: updatedIncome,
        };

        const newShifts = prev.map((shift) =>
          shift.id === event.id ? updatedShift : shift
        );
        localStorage.setItem('shifts', JSON.stringify(newShifts));
        return newShifts;
      });
    },
    []
  );

  // Resize handler (similarly updating the shift details)
  const resizeEvent = useCallback(({ event, start, end }) => {
    setShifts((prev) => {
      const existing = prev.find((shift) => shift.id === event.id);
      if (!existing) return prev;

      const updatedIncome = calculateIncome(
        start.toISOString(),
        end.toISOString(),
        existing.rate,
        existing.nightRate
      );

      const updatedShift: Shift = {
        ...existing,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        income: updatedIncome,
      };

      const newShifts = prev.map((shift) =>
        shift.id === event.id ? updatedShift : shift
      );
      localStorage.setItem('shifts', JSON.stringify(newShifts));
      return newShifts;
    });
  }, []);

  return (
    <div className="flex-grow">
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        resizable
      />
    </div>
  );
}

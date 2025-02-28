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
import supabase from '@/lib/supabase';

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

const DragAndDropCalendar = withDragAndDrop(Calendar);

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
  const [currentView, setCurrentView] = useState('month');

  // Fetch shifts from Supabase on mount
  useEffect(() => {
    const fetchShifts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: shiftsData, error } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', user.id);
        if (error) {
          console.error('Error fetching shifts:', error);
        } else if (shiftsData) {
          setShifts(shiftsData);
        }
      }
    };
    fetchShifts();
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
    async ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      setShifts((prev) => {
        const existing = prev.find((shift) => shift.id === event.id);
        if (!existing) return prev;

        const originalStart = new Date(existing.startTime);
        const originalEnd = new Date(existing.endTime);

        let newStartTime: Date;
        let newEndTime: Date;

        // If in month view, only update the date portion and keep original time
        if (currentView === 'month') {
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
        } else if (droppedOnAllDaySlot) {
          // For all-day drops (e.g. in week/day views)
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

        // Update Supabase with the changed shift
        supabase
          .from('shifts')
          .update({
            startTime: updatedShift.startTime,
            endTime: updatedShift.endTime,
            startDate: updatedShift.startDate,
            endDate: updatedShift.endDate,
            income: updatedShift.income,
          })
          .eq('id', updatedShift.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating shift:', error);
            }
          });

        return prev.map((shift) =>
          shift.id === event.id ? updatedShift : shift
        );
      });
    },
    [currentView]
  );

  // Update shift when resized
  const resizeEvent = useCallback(async ({ event, start, end }) => {
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

      // Update Supabase with the resized shift
      supabase
        .from('shifts')
        .update({
          startTime: updatedShift.startTime,
          endTime: updatedShift.endTime,
          startDate: updatedShift.startDate,
          endDate: updatedShift.endDate,
          income: updatedShift.income,
        })
        .eq('id', updatedShift.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error resizing shift:', error);
          }
        });

      return prev.map((shift) =>
        shift.id === event.id ? updatedShift : shift
      );
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
        onView={(view) => setCurrentView(view)}
      />
    </div>
  );
}

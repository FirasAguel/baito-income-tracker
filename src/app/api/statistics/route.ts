import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { Shift, JobStatistics } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('*');
    const { data: jobRates, error: jobRatesError } = await supabase
      .from('job_rates')
      .select('*');

    if (shiftsError || jobRatesError) {
      throw new Error(shiftsError?.message || jobRatesError?.message);
    }

    const url = new URL(req.url);
    const selectedJob = url.searchParams.get('job') || 'all';

    const getSums = (
      shiftsData: Shift[],
      type: 'daily' | 'weekly' | 'monthly' | 'yearly'
    ) => {
      const incomeSums: Record<string, number> = {};
      const hoursSums: Record<string, number> = {};

      shiftsData.forEach((shift) => {
        if (!shift.endDate) return;
        const date = new Date(shift.endDate);
        let key = '';

        if (type === 'daily') {
          key = shift.endDate;
        } else if (type === 'weekly') {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Set to Monday
          key = `${startOfWeek.getFullYear()}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${startOfWeek.getDate().toString().padStart(2, '0')}`;
        } else if (type === 'monthly') {
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {
          // yearly
          key = date.getFullYear().toString();
        }

        if (!incomeSums[key]) {
          incomeSums[key] = 0;
          hoursSums[key] = 0;
        }

        incomeSums[key] += shift.income || 0;
        hoursSums[key] += shift.hours || 0;
      });

      return { income: incomeSums, hours: hoursSums };
    };

    const filteredShifts =
      selectedJob === 'all'
        ? shifts
        : shifts.filter((shift) => shift.job === selectedJob);

    const stats: JobStatistics[] = await Promise.all(
      jobRates.map(async (jobRate) => {
        const job = jobRate.job;
        const jobShifts = shifts.filter((shift) => shift.job === job);

        const user_id = jobRate.user_id;

        return {
          id: uuidv4(),
          user_id,
          job,
          daily: getSums(jobShifts, 'daily'),
          weekly: getSums(jobShifts, 'weekly'),
          monthly: getSums(jobShifts, 'monthly'),
          yearly: {
            income: Object.fromEntries(
              Object.entries(getSums(jobShifts, 'yearly').income).map(
                ([year, income]) => [year, income]
              )
            ),
          },
        };
      })
    );

    jobRates.forEach((jobRate) => {
      const user_id = jobRate.user_id;
      const userShifts = shifts.filter((shift) => shift.user_id === user_id);

      const allJobStats: JobStatistics = {
        id: uuidv4(),
        user_id,
        job: 'all',
        daily: getSums(userShifts, 'daily'),
        weekly: getSums(userShifts, 'weekly'),
        monthly: getSums(userShifts, 'monthly'),
        yearly: {
          income: Object.fromEntries(
            Object.entries(getSums(userShifts, 'yearly').income).map(
              ([year, income]) => [year, income]
            )
          ),
        },
      };

      stats.push(allJobStats);
    });

    const { error: statsError } = await supabase
      .from('job_statistics')
      .upsert(stats);
    if (statsError) {
      throw new Error(statsError.message);
    }

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

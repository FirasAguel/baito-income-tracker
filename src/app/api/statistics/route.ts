// src/app/api/statistics/route.tsx
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Shift, JobRate } from "@../../../src/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const getShifts = async (): Promise<Shift[]> => {
  const { data, error } = await supabase.from("shifts").select("*");
  if (error) {
    console.error("Error fetching shifts:", error);
    return [];
  }
  return data as Shift[];
};

const getJobRates = async (): Promise<JobRate[]> => {
  const { data, error } = await supabase.from("jobRates").select("*");
  if (error) {
    console.error("Error fetching job rates:", error);
    return [];
  }
  return data as JobRate[];
};

const getSums = (
  shifts: Shift[],
  type: "daily" | "monthly" | "yearly"
): Record<string, { income: number; hours: number }> => {
  const incomeSums: Record<string, { income: number; hours: number }> = {};

  shifts.forEach((shift) => {
    if (!shift.endDate) return;
    const date = new Date(shift.endDate);
    let key = "";

    if (type === "daily") {
      key = shift.endDate;
    } else if (type === "monthly") {
      key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    } else {
      key = date.getFullYear().toString();
    }

    if (!incomeSums[key]) {
      incomeSums[key] = { income: 0, hours: 0 };
    }
    incomeSums[key].income += shift.income || 0;
    incomeSums[key].hours += shift.hours || 0;
  });

  return incomeSums;
};

export async function GET() {
  try {
    const shifts = await getShifts();
    const jobRates = await getJobRates();

    if (!shifts.length || !jobRates.length) {
      return NextResponse.json(
        { message: "No shifts or job rates available." },
        { status: 404 }
      );
    }

    const statistics = jobRates.map((jobRate) => {
      const jobShifts = shifts.filter((shift) => shift.job === jobRate.job);
      return {
        job: jobRate.job,
        daily: getSums(jobShifts, "daily"),
        monthly: getSums(jobShifts, "monthly"),
        yearly: getSums(jobShifts, "yearly"),
      };
    });

    const allDaily = getSums(shifts, "daily");
    const allMonthly = getSums(shifts, "monthly");
    const allYearly = getSums(shifts, "yearly");

    statistics.push({
      job: "all",
      daily: allDaily,
      monthly: allMonthly,
      yearly: allYearly,
    });

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

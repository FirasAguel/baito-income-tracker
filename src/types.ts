export type JobRate = {
    id: number;
    job: string;
    rate: number;
    nightRate: number;
  };

export type IncomeGoal = {
    year: string;
    incomeGoal: number;
  };

export type Shift = {
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

export type JobStatistics = {
  job: string;
  daily: {
    income: { [date: string]: number };
    hours: { [date: string]: number };
  };
  weekly: {
    income: { [week: string]: number };
    hours: { [week: string]: number };
  };
  monthly: {
    income: { [month: string]: number };
    hours: { [month: string]: number };
  };
  yearly: {
    income: { [year: string]: number };
  };
}
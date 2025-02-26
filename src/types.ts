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
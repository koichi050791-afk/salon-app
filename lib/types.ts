export interface Store {
  id: string;
  name: string;
}

export interface WeeklyKPI {
  storeId: string;
  week: string; // e.g. "2026-W15"
  revenue: number;
  visitors: number;
  staffCount: number;
}

export interface Task {
  id: string;
  storeId: string;
  week: string;
  text: string;
  done: boolean;
}

export interface ComputedMetrics {
  averageTicket: number | null;
  revenuePerStaff: number | null;
}

export function computeMetrics(kpi: WeeklyKPI): ComputedMetrics {
  return {
    averageTicket: kpi.visitors > 0 ? kpi.revenue / kpi.visitors : null,
    revenuePerStaff: kpi.staffCount > 0 ? kpi.revenue / kpi.staffCount : null,
  };
}

export function currentWeek(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

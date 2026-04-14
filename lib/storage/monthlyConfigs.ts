export type MonthlyConfig = {
  storeId: string;
  yearMonth: string; // YYYY-MM
  targetSales: number;
  prevYearSales: number;
  forecastSales: number;
  elapsedBusinessDays: number;
  totalBusinessDays: number;
  staffCount: number;
  updatedAt: string;
};

const KEY = "salon_os_monthly_configs";

function loadAll(): MonthlyConfig[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAll(items: MonthlyConfig[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getMonthlyConfig(
  storeId: string,
  yearMonth: string
): MonthlyConfig | null {
  const all = loadAll();
  return (
    all.find(
      (item) => item.storeId === storeId && item.yearMonth === yearMonth
    ) ?? null
  );
}

export function saveMonthlyConfig(
  input: Omit<MonthlyConfig, "updatedAt">
): MonthlyConfig {
  const all = loadAll();

  const nextItem: MonthlyConfig = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const index = all.findIndex(
    (item) =>
      item.storeId === input.storeId && item.yearMonth === input.yearMonth
  );

  if (index >= 0) {
    all[index] = nextItem;
  } else {
    all.push(nextItem);
  }

  saveAll(all);
  return nextItem;
}

export function getAllMonthlyConfigs(): MonthlyConfig[] {
  return loadAll();
}
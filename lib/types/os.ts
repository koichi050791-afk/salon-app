export type StaffRank = "top" | "stylist" | "junior" | "colorist";

export type RiskLevel = "green" | "yellow" | "red" | "empty" | "config_missing";

export type DiagnosisResult = {
  productivity: number;
  avgPrice: number;
  rotation: number;
  productivityRisk: RiskLevel;
  avgPriceRisk: RiskLevel;
  rotationRisk: RiskLevel;
  primaryIssueLabel: string;
  primaryIssueKey: string;
  primaryIssueRisk: RiskLevel;
  actions: string[];
};

export type SavedDiagnosis = {
  id: string;
  date: string; // YYYY-MM-DD
  storeId: string;
  storeLabel: string;
  staffId: string;
  staffName: string;
  staffRank: StaffRank;
  sales: number;
  customers: number;
  hours: number;
  result: DiagnosisResult;
  savedAt: string;
};

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

export type MonthlyStoreMetrics = {
  yearMonth: string;
  cumulativeSales: number;
  cumulativeCustomers: number;
  cumulativeHours: number;
  savedCount: number;
  targetElapsedSales: number;
  achievementRate: number;
  forecastAchievementRate: number;
  yoyRate: number;
  monthlyProductivity: number;
};
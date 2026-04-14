import { MonthlyConfig, MonthlyStoreMetrics, SavedDiagnosis } from "../types/os";

export function calcMonthlyStoreMetrics(
  yearMonth: string,
  config: MonthlyConfig,
  diagnoses: SavedDiagnosis[]
): MonthlyStoreMetrics {
  const cumulativeSales = diagnoses.reduce((sum, item) => sum + item.sales, 0);
  const cumulativeCustomers = diagnoses.reduce((sum, item) => sum + item.customers, 0);
  const cumulativeHours = diagnoses.reduce((sum, item) => sum + item.hours, 0);
  const savedCount = diagnoses.length;

  const targetElapsedSales =
    config.totalBusinessDays > 0
      ? Math.round((config.targetSales / config.totalBusinessDays) * config.elapsedBusinessDays)
      : 0;

  const achievementRate =
    targetElapsedSales > 0 ? cumulativeSales / targetElapsedSales : 0;

  const forecastAchievementRate =
    config.targetSales > 0 ? config.forecastSales / config.targetSales : 0;

  const yoyRate =
    config.prevYearSales > 0 ? config.forecastSales / config.prevYearSales : 0;

  const monthlyProductivity =
    config.elapsedBusinessDays > 0 && config.staffCount > 0
      ? Math.round(
          (cumulativeSales / config.elapsedBusinessDays) *
            config.totalBusinessDays /
            config.staffCount
        )
      : 0;

  return {
    yearMonth,
    cumulativeSales,
    cumulativeCustomers,
    cumulativeHours,
    savedCount,
    targetElapsedSales,
    achievementRate,
    forecastAchievementRate,
    yoyRate,
    monthlyProductivity,
  };
}
import { MonthlyStoreMetrics, RiskLevel } from "../types/os";

export function calcStoreRisk(
  metrics: MonthlyStoreMetrics | null,
  hasConfig: boolean,
  hasData: boolean
): RiskLevel {
  if (!hasConfig) return "config_missing";
  if (!hasData || !metrics) return "empty";

  const productivity = metrics.monthlyProductivity;
  const forecastRate = metrics.forecastAchievementRate;
  const yoyRate = metrics.yoyRate;

  const isRed =
    productivity < 800000 ||
    forecastRate < 0.88 ||
    yoyRate < 0.9;

  if (isRed) return "red";

  const isYellow =
    productivity < 900000 ||
    forecastRate < 0.95 ||
    yoyRate < 0.97;

  if (isYellow) return "yellow";

  return "green";
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "green":
      return "基準クリア";
    case "yellow":
      return "要注意";
    case "red":
      return "優先対応";
    case "config_missing":
      return "設定不足";
    case "empty":
    default:
      return "未入力";
  }
}
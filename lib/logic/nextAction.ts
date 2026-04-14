import type { MonthlyStoreMetrics, RiskLevel } from "../types/os";

type Params = {
  risk: RiskLevel;
  metrics: MonthlyStoreMetrics | null;
  hasConfig: boolean;
  hasData: boolean;
};

export function getNextAction({
  risk,
  metrics,
  hasConfig,
  hasData,
}: Params): string {
  if (!hasConfig || risk === "config_missing") {
    return "まず月次設定を入力し、比較基準を揃える";
  }

  if (!hasData || risk === "empty") {
    return "まず当月データを1件保存し、判断できる状態にする";
  }

  if (!metrics) {
    return "まず当月データと月次設定を揃え、判断材料を整える";
  }

  if (metrics.monthlyProductivity < 800000) {
    return "客単価と予約構成を見直し、月平均生産性の立て直しを優先する";
  }

  if (metrics.forecastAchievementRate < 0.88) {
    return "今月の売上不足対策を優先し、予約回収と単価改善を同時に進める";
  }

  if (metrics.yoyRate < 0.9) {
    return "既存客の再来導線を見直し、失客兆候のある顧客層を確認する";
  }

  if (metrics.monthlyProductivity < 900000) {
    return "高単価メニュー比率と施術効率を点検し、90万ライン回復を優先する";
  }

  if (metrics.forecastAchievementRate < 0.95) {
    return "次回予約と今月残りの売上回収策を先に打つ";
  }

  if (metrics.yoyRate < 0.97) {
    return "既存客の再来率とフォロー導線を確認し、前年比の微減を止める";
  }

  if (metrics.achievementRate < 0.95) {
    return "経過目標との差分を埋めるため、今週の重点施策を1つに絞る";
  }

  return "現状維持でよい。基準クリアを崩さないよう保存と点検を継続する";
}
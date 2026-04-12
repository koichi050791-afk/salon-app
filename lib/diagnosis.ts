import { WeeklyKPI } from "./types";

// ----------------------------------------------------------------
// Thresholds
// ----------------------------------------------------------------
const THRESHOLDS = {
  productivity: 500_000, // revenue ÷ staff  (¥/人)
  avgTicket:      8_000, // revenue ÷ visitors (¥/人)
  traffic:           40, // visitors count
} as const;

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

// 原因の種別
export type IssueKey = "low_ticket" | "low_visitors" | "complex" | "none";

export interface Diagnosis {
  issue:   IssueKey;
  cause:   string;   // 原因ラベル  例: "提案力不足"
  message: string;   // 原因＋結果の文  例: "単価が低いため、生産性が下がっています"
  detail:  string;   // 数値の根拠
  actions: string[];
}

// ----------------------------------------------------------------
// Actions per root cause
// ----------------------------------------------------------------
const ACTIONS: Record<Exclude<IssueKey, "none">, [string, string, string]> = {
  low_ticket: [
    "カウンセリングでオプションメニューを提案する",
    "高単価メニューの説明を丁寧に行う",
    "施術後に追加メニューを案内する習慣をつける",
  ],
  low_visitors: [
    "既存客へのLINEフォローを実施する",
    "全担当客に次回予約の声掛けを行う",
    "SNSでのスタイル投稿を週3回以上行う",
  ],
  complex: [
    "売上・客数・単価の3指標を週ごとに記録する",
    "高単価メニューの提案率を意識して上げる",
    "既存客へのリピート促進に取り組む",
  ],
};

// ----------------------------------------------------------------
// diagnose()
//
// Step 1: 生産性をチェック
// Step 2: 低い場合 → 原因を分解
//   ・単価が低い  → 提案力不足
//   ・客数が少ない → 予約・リピート問題
//   ・どちらでもない → 複合問題
// ----------------------------------------------------------------
export function diagnose(kpi: WeeklyKPI): Diagnosis {
  const fmt = (n: number) => `¥${Math.round(n).toLocaleString()}`;

  const productivity = kpi.staffCount > 0 ? kpi.revenue / kpi.staffCount : 0;
  const avgTicket    = kpi.visitors   > 0 ? kpi.revenue / kpi.visitors   : 0;

  // 生産性が目標以上 → 問題なし
  if (productivity >= THRESHOLDS.productivity) {
    return {
      issue:   "none",
      cause:   "全指標クリア",
      message: "今週はすべての指標が目標をクリアしています",
      detail:  `生産性 ${fmt(productivity)} / 人`,
      actions: [],
    };
  }

  // 生産性が低い → 原因を分解する
  const ticketLow   = avgTicket    < THRESHOLDS.avgTicket;
  const visitorsLow = kpi.visitors < THRESHOLDS.traffic;

  if (ticketLow) {
    return {
      issue:   "low_ticket",
      cause:   "提案力不足",
      message: "単価が低いため、生産性が下がっています",
      detail:  `客単価 ${fmt(avgTicket)}（目標 ${fmt(THRESHOLDS.avgTicket)}）　生産性 ${fmt(productivity)}（目標 ${fmt(THRESHOLDS.productivity)}）`,
      actions: ACTIONS.low_ticket,
    };
  }

  if (visitorsLow) {
    return {
      issue:   "low_visitors",
      cause:   "予約・リピート問題",
      message: "客数が少ないため、売上が伸びていません",
      detail:  `客数 ${kpi.visitors}人（目標 ${THRESHOLDS.traffic}人）　生産性 ${fmt(productivity)}（目標 ${fmt(THRESHOLDS.productivity)}）`,
      actions: ACTIONS.low_visitors,
    };
  }

  return {
    issue:   "complex",
    cause:   "複合問題",
    message: "売上が低く、単価・客数どちらも要因として考えられます",
    detail:  `生産性 ${fmt(productivity)}（目標 ${fmt(THRESHOLDS.productivity)}）　客単価 ${fmt(avgTicket)}　客数 ${kpi.visitors}人`,
    actions: ACTIONS.complex,
  };
}

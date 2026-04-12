// ----------------------------------------------------------------
// Thresholds (個人スタッフ向け)
// ----------------------------------------------------------------
const THRESHOLDS = {
  productivity: 10_000, // sales ÷ hours (¥/h)
  avgTicket:     8_000, // sales ÷ clients (¥/person)
  clients:          20, // 週あたり客数
} as const;

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export type StaffIssueKey = "low_ticket" | "low_clients" | "low_productivity" | "none";

export interface StaffDiagnosis {
  issue:   StaffIssueKey;
  label:   string;
  message: string;
  detail:  string;
  actions: string[];
}

// ----------------------------------------------------------------
// Actions per root label
// ----------------------------------------------------------------
const ACTIONS: Record<Exclude<StaffIssueKey, "none">, [string, string, string]> = {
  low_ticket: [
    "カウンセリングでオプションメニューを提案する",
    "高単価メニューの説明を丁寧に行う",
    "施術後に追加メニューを案内する習慣をつける",
  ],
  low_clients: [
    "既存客へのLINEフォローを実施する",
    "全担当客に次回予約の声掛けを行う",
    "SNSでのスタイル投稿を週3回以上行う",
  ],
  low_productivity: [
    "施術時間の記録を取り、ボトルネックを特定する",
    "単価・客数・時間の3指標を週ごとに振り返る",
    "高単価メニューの予約枠を優先的に確保する",
  ],
};

// ----------------------------------------------------------------
// diagnoseStaff()
// ----------------------------------------------------------------
export function diagnoseStaff(
  sales: number,
  clients: number,
  hours: number
): StaffDiagnosis {
  const fmt = (n: number) => `¥${Math.round(n).toLocaleString()}`;

  const productivity = hours   > 0 ? sales / hours   : 0;
  const avgTicket    = clients > 0 ? sales / clients : 0;

  if (productivity >= THRESHOLDS.productivity) {
    return {
      issue:   "none",
      label:   "全指標クリア",
      message: "今週はすべての指標が目標をクリアしています",
      detail:  `生産性 ${fmt(productivity)}/h　客単価 ${fmt(avgTicket)}　客数 ${clients}人`,
      actions: [],
    };
  }

  const ticketLow  = avgTicket < THRESHOLDS.avgTicket;
  const clientsLow = clients   < THRESHOLDS.clients;

  if (ticketLow && !clientsLow) {
    return {
      issue:   "low_ticket",
      label:   "提案力不足",
      message: "単価が低いため、生産性が下がっています",
      detail:  `客単価 ${fmt(avgTicket)}（目標 ${fmt(THRESHOLDS.avgTicket)}）　生産性 ${fmt(productivity)}/h（目標 ${fmt(THRESHOLDS.productivity)}/h）`,
      actions: ACTIONS.low_ticket,
    };
  }

  if (clientsLow && !ticketLow) {
    return {
      issue:   "low_clients",
      label:   "予約・再来不足",
      message: "客数が少ないため、売上が伸びていません",
      detail:  `客数 ${clients}人（目標 ${THRESHOLDS.clients}人）　生産性 ${fmt(productivity)}/h（目標 ${fmt(THRESHOLDS.productivity)}/h）`,
      actions: ACTIONS.low_clients,
    };
  }

  return {
    issue:   "low_productivity",
    label:   "時間当たり売上不足",
    message: "売上に対して労働時間が多く、効率が低下しています",
    detail:  `生産性 ${fmt(productivity)}/h（目標 ${fmt(THRESHOLDS.productivity)}/h）　客単価 ${fmt(avgTicket)}　客数 ${clients}人`,
    actions: ACTIONS.low_productivity,
  };
}
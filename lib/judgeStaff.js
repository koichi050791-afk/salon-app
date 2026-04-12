// Individual stylist judgment logic.
// Mirrors lib/diagnosis.ts but operates on per-stylist numbers.

const THRESHOLDS = {
  sales:     200_000, // 個人売上 (¥)
  avgTicket:   8_000, // 客単価 (¥/人)
  clients:        20, // 担当客数 (人)
};

const ACTIONS = {
  low_sales: [
    "高単価メニューの提案を積極的に行う",
    "次回予約の声掛けを全担当客に行う",
    "空き時間に既存客へフォロー連絡を入れる",
  ],
  low_ticket: [
    "カウンセリングでオプション提案を行う",
    "施術中に追加メニューを案内する",
    "高単価メニューの説明を丁寧に行う",
  ],
  low_clients: [
    "SNSへの投稿頻度を週3回以上にする",
    "既存客へのLINEフォローを実施する",
    "紹介カードを積極的に渡す",
  ],
};

/**
 * Evaluate individual stylist numbers and return the top-priority issue.
 * Priority: sales → avg_ticket → clients
 *
 * @param {{ sales: number, clients: number }} input
 * @returns {{ issue: string, label: string, detail: string, actions: string[] }}
 */
export function judgeStaff({ sales, clients }) {
  const avgTicket = clients > 0 ? sales / clients : 0;
  const fmt = (n) => `¥${Math.round(n).toLocaleString()}`;

  if (sales < THRESHOLDS.sales) {
    return {
      issue: "low_sales",
      label: "個人売上低下",
      detail: `現在 ${fmt(sales)}　（目標：${fmt(THRESHOLDS.sales)}）`,
      actions: ACTIONS.low_sales,
    };
  }

  if (avgTicket < THRESHOLDS.avgTicket) {
    return {
      issue: "low_ticket",
      label: "客単価不足",
      detail: `現在 ${fmt(avgTicket)} / 人　（目標：${fmt(THRESHOLDS.avgTicket)} / 人）`,
      actions: ACTIONS.low_ticket,
    };
  }

  if (clients < THRESHOLDS.clients) {
    return {
      issue: "low_clients",
      label: "集客不足",
      detail: `現在 ${clients} 人　（目標：${THRESHOLDS.clients} 人）`,
      actions: ACTIONS.low_clients,
    };
  }

  return {
    issue: "none",
    label: "目標達成",
    detail: "今週はすべての目標をクリアしています",
    actions: [],
  };
}

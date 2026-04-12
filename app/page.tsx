"use client";

import { useMemo, useState } from "react";

type Diagnosis = {
  productivity: number;
  avgTicket: number;
  issue: string;
  cause: string;
  message: string;
  actions: string[];
};

function diagnose(sales: number, clients: number, hours: number): Diagnosis {
  const productivity = hours > 0 ? sales / hours : 0;
  const avgTicket = clients > 0 ? sales / clients : 0;

  const PRODUCTIVITY_GOAL = 10000;
  const AVG_TICKET_GOAL = 8000;
  const CLIENTS_GOAL = 20;

  if (productivity >= PRODUCTIVITY_GOAL) {
    return {
      productivity,
      avgTicket,
      issue: "課題なし",
      cause: "基準クリア",
      message: "今週は生産性が基準をクリアしています。",
      actions: [
        "今週の接客内容を維持する",
        "単価が高かったメニュー提案を継続する",
        "次回予約の声かけを継続する",
      ],
    };
  }

  if (avgTicket < AVG_TICKET_GOAL && clients >= CLIENTS_GOAL) {
    return {
      productivity,
      avgTicket,
      issue: "客単価不足",
      cause: "提案力不足",
      message: "客数はあるが単価が低く、生産性が落ちています。",
      actions: [
        "高単価メニューを毎回1つ提案する",
        "仕上げ時に次回の施術提案を入れる",
        "カウンセリングで悩みを深掘りする",
      ],
    };
  }

  if (clients < CLIENTS_GOAL && avgTicket >= AVG_TICKET_GOAL) {
    return {
      productivity,
      avgTicket,
      issue: "客数不足",
      cause: "再来・予約不足",
      message: "単価は取れているが客数が足りず、生産性が落ちています。",
      actions: [
        "全担当客に次回予約の声かけをする",
        "既存客へLINEフォローを行う",
        "空き時間に再来促進連絡を入れる",
      ],
    };
  }

  return {
    productivity,
    avgTicket,
    issue: "時間当たり売上不足",
    cause: "単価・客数の両面不足",
    message: "売上に対して労働時間が多く、全体効率が低下しています。",
    actions: [
      "今週は高単価メニュー提案を徹底する",
      "次回予約の取得率を上げる",
      "空き時間の使い方を見直す",
    ],
  };
}

export default function Home() {
  const [sales, setSales] = useState("100000");
  const [clients, setClients] = useState("10");
  const [hours, setHours] = useState("8");

  const result = useMemo(() => {
    const s = Number(sales) || 0;
    const c = Number(clients) || 0;
    const h = Number(hours) || 0;
    return diagnose(s, c, h);
  }, [sales, clients, hours]);

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 480,
        margin: "0 auto",
        background: "#000",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
        サロンKPIアプリ
      </h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
          週次入力
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            type="number"
            placeholder="売上"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            style={{ padding: 12, fontSize: 16 }}
          />

          <input
            type="number"
            placeholder="客数"
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            style={{ padding: 12, fontSize: 16 }}
          />

          <input
            type="number"
            placeholder="労働時間"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            style={{ padding: 12, fontSize: 16 }}
          />
        </div>
      </section>

      <section
        style={{
          background: "#111827",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ marginBottom: 8 }}>生産性</div>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>
          ¥{Math.round(result.productivity).toLocaleString()} / 時間
        </div>
      </section>

      <section
        style={{
          background: "#111827",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ marginBottom: 8 }}>客単価</div>
        <div style={{ fontSize: 24, fontWeight: "bold" }}>
          ¥{Math.round(result.avgTicket).toLocaleString()}
        </div>
      </section>

      <section
        style={{
          background: "#1f2937",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 6 }}>
          最優先課題
        </div>
        <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
          {result.issue}
        </div>
        <div style={{ marginBottom: 8 }}>原因: {result.cause}</div>
        <div>{result.message}</div>
      </section>

      <section
        style={{
          background: "#172554",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          今週やること
        </div>
        <ol style={{ paddingLeft: 20, margin: 0, display: "grid", gap: 8 }}>
          {result.actions.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
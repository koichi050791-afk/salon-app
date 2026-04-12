"use client";
import { useState } from "react";

const STORE_SETTINGS = {
  sanda: {
    name: "三田店",
    productivity: 15000,
    avgTicket: 16000,
    clients: 8,
  },
  nishikita: {
    name: "西宮北口店",
    productivity: 10000,
    avgTicket: 10000,
    clients: 10,
  },
};

export default function Home() {
  const [store, setStore] = useState("nishikita");
  const [stylist, setStylist] = useState("");
  const [sales, setSales] = useState("");
  const [clients, setClients] = useState("");
  const [hours, setHours] = useState("");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const s = Number(sales);
    const c = Number(clients);
    const h = Number(hours);

    if (!s || !c || !h) return;

    const productivity = Math.round(s / h);
    const avgTicket = Math.round(s / c);

    const PRODUCTIVITY_GOAL = STORE_SETTINGS[store].productivity;
    const AVG_TICKET_GOAL = STORE_SETTINGS[store].avgTicket;
    const CLIENTS_GOAL = STORE_SETTINGS[store].clients;

    let issue = "";
    let cause = "";
    let message = "";
    let actions: string[] = [];

    if (productivity < PRODUCTIVITY_GOAL) {
      if (avgTicket < AVG_TICKET_GOAL) {
        issue = "客単価不足";
        cause = "高単価提案不足";
        message = "単価が低く生産性が下がっています";
        actions = [
          "上位メニュー提案を全員に",
          "カウンセリングで悩み深掘り",
          "単価+1000円を意識",
        ];
      } else if (c < CLIENTS_GOAL) {
        issue = "客数不足";
        cause = "再来導線不足";
        message = "来店数不足で売上が伸びていません";
        actions = [
          "次回予約の徹底",
          "LINEフォロー",
          "空き時間に再来連絡",
        ];
      }
    } else {
      issue = "現状維持圏内";
      cause = "基準到達";
      message = "最低基準はクリア。さらに伸ばせます";
      actions = [
        "単価アップ提案を1回増やす",
        "次回予約率を確認",
        "施術時間の見直し",
      ];
    }

    setResult({
      store: STORE_SETTINGS[store].name,
      stylist,
      productivity,
      avgTicket,
      issue,
      cause,
      message,
      actions,
    });
  };

  return (
    <div style={{ padding: 20, color: "white", background: "black" }}>
      <h1>サロンKPIアプリ</h1>

      <select value={store} onChange={(e) => setStore(e.target.value)}>
        <option value="nishikita">西宮北口店</option>
        <option value="sanda">三田店</option>
      </select>

      <input
        placeholder="スタイリスト名"
        value={stylist}
        onChange={(e) => setStylist(e.target.value)}
      />

      <input
        placeholder="売上"
        value={sales}
        onChange={(e) => setSales(e.target.value)}
      />
      <input
        placeholder="客数"
        value={clients}
        onChange={(e) => setClients(e.target.value)}
      />
      <input
        placeholder="時間"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
      />

      <button onClick={calculate}>保存</button>

      {result && (
        <div>
          <h2>{result.store} / {result.stylist}</h2>
          <p>生産性：{result.productivity}</p>
          <p>客単価：{result.avgTicket}</p>
          <p>課題：{result.issue}</p>
          <p>原因：{result.cause}</p>
          <p>{result.message}</p>
          <ul>
            {result.actions.map((a: string, i: number) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState } from "react";

const STORE_SETTINGS = {
  sanda: {
    name: "三田店",
    minProductivity: 12000,
    minAvgTicket: 13000,
    minClients: 8,
  },
  nishikita: {
    name: "西宮北口店",
    minProductivity: 10000,
    minAvgTicket: 10000,
    minClients: 10,
  },
};

export default function Home() {
  const [store, setStore] = useState("nishikita");
  const [stylist, setStylist] = useState("");
  const [sales, setSales] = useState("100000");
  const [clients, setClients] = useState("10");
  const [hours, setHours] = useState("8");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const s = Number(sales);
    const c = Number(clients);
    const h = Number(hours);

    if (!s || !c || !h) return;

    const productivity = Math.round(s / h);
    const avgTicket = Math.round(s / c);

    const setting = STORE_SETTINGS[store as keyof typeof STORE_SETTINGS];

    let issue = "";
    let cause = "";
    let message = "";
    let actions: string[] = [];

    if (avgTicket < setting.minAvgTicket) {
      issue = "客単価不足";
      cause = "提案不足";
      message = "単価が基準を下回っています。提案強化が必要です。";
      actions = [
        "上位メニュー提案を全員に行う",
        "カウンセリングで悩みを深掘りする",
        "仕上げ時に次回提案を入れる",
      ];
    } else if (c < setting.minClients) {
      issue = "客数不足";
      cause = "再来導線不足";
      message = "客数が不足しています。再来の仕組みが弱いです。";
      actions = [
        "次回予約の声かけを必ず行う",
        "会計前に次回来店時期を伝える",
        "再来につながる提案を1つ入れる",
      ];
    } else if (productivity < setting.minProductivity) {
      issue = "時間効率不足";
      cause = "生産性低下";
      message = "時間あたり売上が低いです。効率改善が必要です。";
      actions = [
        "施術時間の長い工程を見直す",
        "高単価メニュー比率を増やす",
        "予約の取り方を見直す",
      ];
    } else {
      issue = "現状維持圏";
      cause = "基準クリア";
      message = "最低基準はクリアしています。次は伸ばす段階です。";
      actions = [
        "単価アップ提案を1回増やす",
        "次回予約率を確認する",
        "接客内容を振り返る",
      ];
    }

    setResult({
      store: setting.name,
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
    <div style={{ padding: 20, color: "white", background: "black", minHeight: "100vh" }}>
      <h1>サロンKPIアプリ</h1>

      <h2>週次入力</h2>

      <select value={store} onChange={(e) => setStore(e.target.value)}>
        <option value="nishikita">西宮北口店</option>
        <option value="sanda">三田店</option>
      </select>

      <input placeholder="スタイリスト名" value={stylist} onChange={(e) => setStylist(e.target.value)} />
      <input placeholder="売上" value={sales} onChange={(e) => setSales(e.target.value)} />
      <input placeholder="客数" value={clients} onChange={(e) => setClients(e.target.value)} />
      <input placeholder="時間" value={hours} onChange={(e) => setHours(e.target.value)} />

      <button onClick={calculate}>判定する</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>{result.store} / {result.stylist || "未入力"}</h3>
          <p>生産性: ¥{result.productivity}</p>
          <p>客単価: ¥{result.avgTicket}</p>
          <p>課題: {result.issue}</p>
          <p>原因: {result.cause}</p>
          <p>{result.message}</p>

          <h4>今週やること</h4>
          {result.actions.map((a: string, i: number) => (
            <p key={i}>・{a}</p>
          ))}
        </div>
      )}
    </div>
  );
}
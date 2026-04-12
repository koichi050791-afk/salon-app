"use client";

import { useMemo, useState } from "react";

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
} as const;

type StoreKey = keyof typeof STORE_SETTINGS;

type DiagnosisResult = {
  storeName: string;
  stylist: string;
  productivity: number;
  avgTicket: number;
  issue: string;
  cause: string;
  message: string;
  actions: string[];
};

function diagnose(
  storeKey: StoreKey,
  stylist: string,
  sales: number,
  clients: number,
  hours: number
): DiagnosisResult {
  const setting = STORE_SETTINGS[storeKey];
  const productivity = hours > 0 ? Math.round(sales / hours) : 0;
  const avgTicket = clients > 0 ? Math.round(sales / clients) : 0;

  let issue = "";
  let cause = "";
  let message = "";
  let actions: string[] = [];

  if (avgTicket < setting.minAvgTicket) {
    issue = "客単価不足";
    cause = "提案不足";
    message = "客単価が基準を下回っています。提案強化が必要です。";
    actions = [
      "上位メニュー提案を全員に行う",
      "カウンセリングで悩みを深掘りする",
      "仕上げ時に次回提案を入れる",
    ];
  } else if (clients < setting.minClients) {
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

  return {
    storeName: setting.name,
    stylist: stylist.trim(),
    productivity,
    avgTicket,
    issue,
    cause,
    message,
    actions,
  };
}

export default function Home() {
  const [store, setStore] = useState<StoreKey>("nishikita");
  const [stylist, setStylist] = useState("");
  const [sales, setSales] = useState("100000");
  const [clients, setClients] = useState("10");
  const [hours, setHours] = useState("8");
  const [hasCalculated, setHasCalculated] = useState(true);

  const salesNum = Number(sales) || 0;
  const clientsNum = Number(clients) || 0;
  const hoursNum = Number(hours) || 0;

  const result = useMemo(() => {
    return diagnose(store, stylist, salesNum, clientsNum, hoursNum);
  }, [store, stylist, salesNum, clientsNum, hoursNum]);

  const handleCalculate = () => {
    setHasCalculated(true);
  };

  return (
    <main
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          サロンKPIアプリ
        </h1>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          週次入力
        </h2>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <select
            value={store}
            onChange={(e) => setStore(e.target.value as StoreKey)}
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
          >
            <option value="nishikita">西宮北口店</option>
            <option value="sanda">三田店</option>
          </select>

          <input
            type="text"
            placeholder="スタイリスト名"
            value={stylist}
            onChange={(e) => setStylist(e.target.value)}
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
          />

          <input
            type="number"
            placeholder="売上"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
          />

          <input
            type="number"
            placeholder="客数"
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
          />

          <input
            type="number"
            placeholder="時間"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #333",
              background: "#111",
              color: "#fff",
            }}
          />

          <button
            onClick={handleCalculate}
            style={{
              padding: 14,
              fontSize: 18,
              fontWeight: 700,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
            }}
          >
            判定する
          </button>
        </div>

        {hasCalculated && (
          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <section
              style={{
                background: "#0f172a",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  opacity: 0.8,
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                {result.storeName} / {result.stylist || "名前未入力"}
              </div>

              <div
                style={{
                  marginBottom: 8,
                }}
              >
                生産性
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ¥{result.productivity.toLocaleString()} / 時間
              </div>
            </section>

            <section
              style={{
                background: "#0f172a",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  marginBottom: 8,
                }}
              >
                客単価
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ¥{result.avgTicket.toLocaleString()}
              </div>
            </section>

            <section
              style={{
                background: "#1e293b",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  opacity: 0.8,
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                最優先課題
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {result.issue}
              </div>

              <div
                style={{
                  marginBottom: 8,
                  fontSize: 18,
                }}
              >
                原因: {result.cause}
              </div>

              <div
                style={{
                  fontSize: 18,
                  lineHeight: 1.6,
                }}
              >
                {result.message}
              </div>
            </section>

            <section
              style={{
                background: "#1e3a8a",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                今週やること
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  fontSize: 18,
                  lineHeight: 1.6,
                }}
              >
                {result.actions.map((action, index) => (
                  <div key={index}>・{action}</div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
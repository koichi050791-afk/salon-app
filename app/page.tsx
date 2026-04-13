"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getActiveStaffOptions } from "../lib/storage/staffProfiles";
import { RANK_LABELS, type StaffRank } from "../lib/settings-types";

const STORE_SETTINGS: Record<
  string,
  {
    label: string;
    targetProductivity: number;
    targetAvgPrice: number;
    targetRotation: number;
    excludeACR?: boolean;
  }
> = {
  sanda: {
    label: "三田店",
    targetProductivity: 6000,
    targetAvgPrice: 8000,
    targetRotation: 1.0,
    excludeACR: true,
  },
  nishinomiyakita: {
    label: "西宮北口店",
    targetProductivity: 7000,
    targetAvgPrice: 9000,
    targetRotation: 1.2,
  },
  sakasegawa: {
    label: "逆瀬川店",
    targetProductivity: 6500,
    targetAvgPrice: 8500,
    targetRotation: 1.1,
  },
  nigawa: {
    label: "仁川店",
    targetProductivity: 6200,
    targetAvgPrice: 8200,
    targetRotation: 1.0,
  },
  kawanishi: {
    label: "川西店",
    targetProductivity: 6000,
    targetAvgPrice: 8000,
    targetRotation: 1.1,
  },
  umeda: {
    label: "梅田店",
    targetProductivity: 8000,
    targetAvgPrice: 10000,
    targetRotation: 1.3,
  },
};

const ACTIONS: Record<string, string[]> = {
  low_price: [
    "トリートメント・ヘッドスパのセット提案率を計測・目標設定する",
    "施術前カウンセリングでデザイン上位メニューを必ず提示する",
    "高単価メニューの提案回数を増やす",
  ],
  low_rotation: [
    "予約導線の離脱箇所を特定する",
    "繁忙時間帯の予約枠を早めに埋める",
    "施術時間が長い工程を1つ見直す",
  ],
  low_productivity: [
    "生産性が低い曜日・時間帯を特定する",
    "アシスタントとの連携タイミングを見直す",
    "施術時間を10%短縮できる工程を1つ特定する",
  ],
  none: [
    "現在の水準を維持してください",
    "次の目標設定を店長と相談しましょう",
    "後輩スタッフへの技術共有を検討してください",
  ],
};

const HISTORY_KEY = "salon_os_saved_diagnoses";

type RiskLevel = "green" | "yellow" | "red";

type DiagnosisResult = {
  productivity: number;
  avgPrice: number;
  rotation: number;
  productivityRisk: RiskLevel;
  avgPriceRisk: RiskLevel;
  rotationRisk: RiskLevel;
  primaryIssueLabel: string;
  primaryIssueKey: string;
  primaryIssueRisk: RiskLevel;
  actions: string[];
};

type SavedDiagnosis = {
  id: string;
  date: string;
  storeId: string;
  storeLabel: string;
  staffId: string;
  staffName: string;
  staffRank: StaffRank;
  sales: number;
  customers: number;
  hours: number;
  result: DiagnosisResult;
  savedAt: string;
};

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadSavedDiagnoses(): SavedDiagnosis[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveSavedDiagnoses(items: SavedDiagnosis[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

function getRiskLevel(value: number, target: number): RiskLevel {
  const ratio = value / target;
  if (ratio >= 0.95) return "green";
  if (ratio >= 0.8) return "yellow";
  return "red";
}

const RISK_COLORS: Record<
  RiskLevel,
  { text: string; bg: string; border: string }
> = {
  green: {
    text: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
  },
  yellow: {
    text: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
  },
  red: {
    text: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
  },
};

function diagnose(
  sales: number,
  customers: number,
  hours: number,
  storeId: string
): DiagnosisResult {
  const settings = STORE_SETTINGS[storeId];
  const productivity = hours > 0 ? Math.round(sales / hours) : 0;
  const avgPrice = customers > 0 ? Math.round(sales / customers) : 0;
  const rotation = hours > 0 ? Math.round((customers / hours) * 100) / 100 : 0;

  const productivityRisk = getRiskLevel(
    productivity,
    settings.targetProductivity
  );
  const avgPriceRisk = getRiskLevel(avgPrice, settings.targetAvgPrice);
  const rotationRisk = getRiskLevel(rotation, settings.targetRotation);

  let primaryIssueKey = "none";
  let primaryIssueLabel = "課題なし";
  let primaryIssueRisk: RiskLevel = "green";

  if (avgPriceRisk === "red") {
    primaryIssueKey = "low_price";
    primaryIssueLabel = "客単価の向上";
    primaryIssueRisk = "red";
  } else if (rotationRisk === "red") {
    primaryIssueKey = "low_rotation";
    primaryIssueLabel = "回転数の改善";
    primaryIssueRisk = "red";
  } else if (productivityRisk === "red") {
    primaryIssueKey = "low_productivity";
    primaryIssueLabel = "生産性の改善";
    primaryIssueRisk = "red";
  } else if (avgPriceRisk === "yellow") {
    primaryIssueKey = "low_price";
    primaryIssueLabel = "客単価の向上";
    primaryIssueRisk = "yellow";
  } else if (rotationRisk === "yellow") {
    primaryIssueKey = "low_rotation";
    primaryIssueLabel = "回転数の改善";
    primaryIssueRisk = "yellow";
  } else if (productivityRisk === "yellow") {
    primaryIssueKey = "low_productivity";
    primaryIssueLabel = "生産性の改善";
    primaryIssueRisk = "yellow";
  }

  return {
    productivity,
    avgPrice,
    rotation,
    productivityRisk,
    avgPriceRisk,
    rotationRisk,
    primaryIssueLabel,
    primaryIssueKey,
    primaryIssueRisk,
    actions: ACTIONS[primaryIssueKey],
  };
}

export default function Home() {
  const [storeId, setStoreId] = useState("nishinomiyakita");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedStaffName, setSelectedStaffName] = useState("");
  const [selectedStaffRank, setSelectedStaffRank] =
    useState<StaffRank>("stylist");

  const [entryDate, setEntryDate] = useState(todayString());
  const [sales, setSales] = useState("");
  const [customers, setCustomers] = useState("");
  const [hours, setHours] = useState("");

  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [checkedActions, setCheckedActions] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [savedItems, setSavedItems] = useState<SavedDiagnosis[]>([]);

  const staffOptions = useMemo(() => {
    return getActiveStaffOptions(storeId);
  }, [storeId]);

  useEffect(() => {
    setSavedItems(loadSavedDiagnoses());
  }, []);

  useEffect(() => {
    if (staffOptions.length === 0) {
      setSelectedStaffId("");
      setSelectedStaffName("");
      setSelectedStaffRank("stylist");
      return;
    }

    const current = staffOptions.find((s) => s.id === selectedStaffId);

    if (current) {
      setSelectedStaffName(current.name);
      setSelectedStaffRank(current.rank);
      return;
    }

    setSelectedStaffId(staffOptions[0].id);
    setSelectedStaffName(staffOptions[0].name);
    setSelectedStaffRank(staffOptions[0].rank);
  }, [staffOptions, selectedStaffId]);

  const handleDiagnose = async () => {
    const s = parseFloat(sales);
    const c = parseFloat(customers);
    const h = parseFloat(hours);

    if (!selectedStaffId) return;
    if (!s || !c || !h) return;

    setLoading(true);
    setSaveMessage("");
    await new Promise((r) => setTimeout(r, 500));

    const diagnosed = diagnose(s, c, h, storeId);
    setResult(diagnosed);
    setCheckedActions([false, false, false]);
    setLoading(false);
  };

  const handleSave = () => {
    const s = parseFloat(sales);
    const c = parseFloat(customers);
    const h = parseFloat(hours);

    if (!selectedStaffId) return;
    if (!s || !c || !h) return;

    const diagnosed = result ?? diagnose(s, c, h, storeId);

    const newItem: SavedDiagnosis = {
      id: crypto.randomUUID(),
      date: entryDate,
      storeId,
      storeLabel: STORE_SETTINGS[storeId].label,
      staffId: selectedStaffId,
      staffName: selectedStaffName,
      staffRank: selectedStaffRank,
      sales: s,
      customers: c,
      hours: h,
      result: diagnosed,
      savedAt: new Date().toISOString(),
    };

    const nextItems = [newItem, ...savedItems].slice(0, 10);
    saveSavedDiagnoses(nextItems);
    setSavedItems(nextItems);
    setResult(diagnosed);
    setSaveMessage("保存しました");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const toggleCheck = (i: number) => {
    setCheckedActions((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const storeLabel = STORE_SETTINGS[storeId]?.label ?? "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#f1f5f9",
        fontFamily:
          "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#0d1117",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            ✂
          </div>
          <span
            style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}
          >
            サロンOS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/settings"
            style={{
              fontSize: 12,
              color: "#9ca3af",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            設定
          </Link>

          {(storeLabel || selectedStaffName) && (
            <div
              style={{
                fontSize: 12,
                color: "#9ca3af",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 99,
                padding: "4px 12px",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {storeLabel}
              {selectedStaffName ? ` / ${selectedStaffName}` : ""}
            </div>
          )}
        </div>
      </header>

      <main
        style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 48px" }}
      >
        <div
          style={{
            background: "#161b27",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                color: "#9ca3af",
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              店舗選択
            </label>

            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 14px",
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: 15,
                appearance: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {Object.entries(STORE_SETTINGS).map(([id, s]) => (
                <option key={id} value={id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                color: "#9ca3af",
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              スタッフ選択
            </label>

            {staffOptions.length === 0 ? (
              <div
                style={{
                  padding: "13px 14px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10,
                  color: "#fca5a5",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                この店舗にはまだスタッフが登録されていません。先に設定画面で登録してください。
              </div>
            ) : (
              <>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    const found = staffOptions.find(
                      (s) => s.id === e.target.value
                    );
                    setSelectedStaffId(e.target.value);
                    setSelectedStaffName(found?.name ?? "");
                    setSelectedStaffRank(found?.rank ?? "stylist");
                  }}
                  style={{
                    width: "100%",
                    padding: "13px 14px",
                    background: "#0d1117",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    color: "#f1f5f9",
                    fontSize: 15,
                    appearance: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  {staffOptions.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  ランク: {RANK_LABELS[selectedStaffRank]}
                </div>
              </>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                color: "#9ca3af",
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              日付
            </label>

            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 14px",
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                color: "#9ca3af",
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              売上（円）
            </label>

            <input
              type="number"
              inputMode="numeric"
              value={sales}
              onChange={(e) => setSales(e.target.value)}
              placeholder="例：128500"
              style={{
                width: "100%",
                padding: "13px 14px",
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                color: "#9ca3af",
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              客数（人）
            </label>

            <input
              type="number"
              inputMode="numeric"
              value={customers}
              onChange={(e) => setCustomers(e.target.value)}
              placeholder="例：12"
              style={{
                width: "100%",
                padding: "13px 14px",
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 12,
                color: "#9ca3af",
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              稼働時間（h）
            </label>

            <input
              type="number"
              inputMode="decimal"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="例：8.0"
              style={{
                width: "100%",
                padding: "13px 14px",
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
            <button
              onClick={handleDiagnose}
              disabled={loading || staffOptions.length === 0}
              style={{
                width: "100%",
                padding: "15px 0",
                background:
                  loading || staffOptions.length === 0
                    ? "rgba(255,255,255,0.05)"
                    : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                border: "none",
                borderRadius: 10,
                color:
                  loading || staffOptions.length === 0 ? "#6b7280" : "white",
                fontWeight: 800,
                fontSize: 16,
                cursor:
                  loading || staffOptions.length === 0
                    ? "not-allowed"
                    : "pointer",
                letterSpacing: "0.04em",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid #6b7280",
                      borderTopColor: "#f1f5f9",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                  診断中...
                </>
              ) : (
                "診断する"
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={staffOptions.length === 0}
              style={{
                width: "100%",
                padding: "15px 0",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                color: staffOptions.length === 0 ? "#6b7280" : "#f1f5f9",
                fontWeight: 800,
                fontSize: 16,
                cursor: staffOptions.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: "0.04em",
              }}
            >
              保存する
            </button>
          </div>

          {saveMessage && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "#10b981",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              ✓ {saveMessage}
            </div>
          )}

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {result && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: RISK_COLORS[result.productivityRisk].bg,
                  border: `1px solid ${RISK_COLORS[result.productivityRisk].border}`,
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    marginBottom: 4,
                  }}
                >
                  生産性
                </div>

                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    color: RISK_COLORS[result.productivityRisk].text,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ¥{result.productivity.toLocaleString()}
                  <span
                    style={{ fontSize: 14, fontWeight: 600, marginLeft: 4 }}
                  >
                    /時間
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                {[
                  {
                    label: "客単価",
                    value: `¥${result.avgPrice.toLocaleString()}`,
                    risk: result.avgPriceRisk,
                  },
                  {
                    label: "回転数",
                    value: result.rotation.toFixed(2),
                    risk: result.rotationRisk,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      background: RISK_COLORS[item.risk].bg,
                      border: `1px solid ${RISK_COLORS[item.risk].border}`,
                      borderRadius: 14,
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>

                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: RISK_COLORS[item.risk].text,
                        letterSpacing: "-0.02em",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "#161b27",
                border: `1px solid ${RISK_COLORS[result.primaryIssueRisk].border}`,
                borderRadius: 14,
                padding: "20px",
                marginBottom: 16,
                borderLeft: `4px solid ${RISK_COLORS[result.primaryIssueRisk].text}`,
                paddingLeft: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                }}
              >
                最優先課題
              </div>

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: RISK_COLORS[result.primaryIssueRisk].text,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {result.primaryIssueLabel}
              </div>

              {result.primaryIssueKey !== "none" && (
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                  {result.primaryIssueKey === "low_price" &&
                    "客単価が基準値を下回っています。提案強化が必要です。"}
                  {result.primaryIssueKey === "low_rotation" &&
                    "回転数が基準値を下回っています。稼働効率を見直してください。"}
                  {result.primaryIssueKey === "low_productivity" &&
                    "生産性が基準値を下回っています。時間配分を最適化してください。"}
                </div>
              )}

              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                対象スタッフ: {selectedStaffName || "未選択"} /{" "}
                {RANK_LABELS[selectedStaffRank]}
              </div>
            </div>

            <div
              style={{
                background: "#161b27",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: "20px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  marginBottom: 14,
                }}
              >
                今週やること
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {result.actions.map((action, i) => (
                  <div
                    key={i}
                    onClick={() => toggleCheck(i)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: checkedActions[i]
                        ? "rgba(16,185,129,0.06)"
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${
                        checkedActions[i]
                          ? "rgba(16,185,129,0.2)"
                          : "rgba(255,255,255,0.05)"
                      }`,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: `2px solid ${
                          checkedActions[i]
                            ? "#10b981"
                            : "rgba(255,255,255,0.2)"
                        }`,
                        background: checkedActions[i]
                          ? "#10b981"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {checkedActions[i] && (
                        <svg
                          width="11"
                          height="9"
                          viewBox="0 0 11 9"
                          fill="none"
                        >
                          <path
                            d="M1 4L4 7.5L10 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: 14,
                        color: checkedActions[i] ? "#6b7280" : "#d1d5db",
                        lineHeight: 1.5,
                        textDecoration: checkedActions[i]
                          ? "line-through"
                          : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div
          style={{
            background: "#161b27",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginBottom: 14,
            }}
          >
            最近の保存データ
          </div>

          {savedItems.length === 0 ? (
            <div
              style={{
                fontSize: 13,
                color: "#6b7280",
                padding: "10px 0",
              }}
            >
              まだ保存データはありません
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      marginBottom: 6,
                    }}
                  >
                    {item.date} / {item.storeLabel}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      marginBottom: 4,
                    }}
                  >
                    {item.staffName} / {RANK_LABELS[item.staffRank]}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      lineHeight: 1.6,
                    }}
                  >
                    生産性 ¥{item.result.productivity.toLocaleString()}/時間
                    <br />
                    客単価 ¥{item.result.avgPrice.toLocaleString()}
                    <br />
                    最優先課題 {item.result.primaryIssueLabel}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
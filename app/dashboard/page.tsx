"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STORES } from "../../lib/constants/stores";
import { RANK_LABELS, type StaffRank } from "../../lib/settings-types";

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

const RISK_STYLE: Record<
  RiskLevel,
  { text: string; bg: string; border: string; label: string }
> = {
  green: {
    text: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    label: "基準クリア",
  },
  yellow: {
    text: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    label: "要注意",
  },
  red: {
    text: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    label: "優先対応",
  },
};

function loadSavedDiagnoses(): SavedDiagnosis[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function formatDate(date: string) {
  if (!date) return "-";
  return date;
}

export default function DashboardPage() {
  const [items, setItems] = useState<SavedDiagnosis[]>([]);

  useEffect(() => {
    setItems(loadSavedDiagnoses());
  }, []);

  const latestByStore = useMemo(() => {
    const map = new Map<string, SavedDiagnosis>();

    for (const item of items) {
      const current = map.get(item.storeId);
      if (!current) {
        map.set(item.storeId, item);
        continue;
      }

      const currentTime = new Date(current.savedAt).getTime();
      const nextTime = new Date(item.savedAt).getTime();

      if (nextTime > currentTime) {
        map.set(item.storeId, item);
      }
    }

    return map;
  }, [items]);

  const countByStore = useMemo(() => {
    const map = new Map<string, number>();

    for (const item of items) {
      map.set(item.storeId, (map.get(item.storeId) ?? 0) + 1);
    }

    return map;
  }, [items]);

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
          gap: 12,
          flexWrap: "wrap",
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
            style={{
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "-0.02em",
            }}
          >
            サロンOS
          </span>
          <span style={{ color: "#6b7280", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>
            全店ダッシュボード
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              fontSize: 12,
              color: "#9ca3af",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ホーム
          </Link>
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
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 60px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          全店ダッシュボード
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
          各店舗の最新保存データを一覧で確認できます
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {STORES.map((store) => {
            const latest = latestByStore.get(store.id);
            const count = countByStore.get(store.id) ?? 0;
            const risk = latest?.result.primaryIssueRisk ?? "yellow";
            const riskStyle = RISK_STYLE[risk];

            return (
              <div
                key={store.id}
                style={{
                  background: "#161b27",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#f1f5f9",
                        marginBottom: 4,
                      }}
                    >
                      {store.label}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      保存件数 {count}件
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: riskStyle.text,
                      background: riskStyle.bg,
                      border: `1px solid ${riskStyle.border}`,
                      borderRadius: 999,
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {latest ? riskStyle.label : "未入力"}
                  </div>
                </div>

                {!latest ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      padding: "16px 0",
                      lineHeight: 1.6,
                    }}
                  >
                    まだ保存データがありません。
                    <br />
                    ホーム画面から入力・保存してください。
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                          最新保存日
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          {formatDate(latest.date)}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                          最新スタッフ
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>
                          {latest.staffName}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                          {RANK_LABELS[latest.staffRank]}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10 }}>
                        <div
                          style={{
                            flex: 1,
                            background: RISK_STYLE[latest.result.productivityRisk].bg,
                            border: `1px solid ${RISK_STYLE[latest.result.productivityRisk].border}`,
                            borderRadius: 12,
                            padding: "12px 14px",
                          }}
                        >
                          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                            生産性
                          </div>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 900,
                              color: RISK_STYLE[latest.result.productivityRisk].text,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            ¥{latest.result.productivity.toLocaleString()}
                          </div>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            background: RISK_STYLE[latest.result.avgPriceRisk].bg,
                            border: `1px solid ${RISK_STYLE[latest.result.avgPriceRisk].border}`,
                            borderRadius: 12,
                            padding: "12px 14px",
                          }}
                        >
                          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                            客単価
                          </div>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 900,
                              color: RISK_STYLE[latest.result.avgPriceRisk].text,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            ¥{latest.result.avgPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: `1px solid ${riskStyle.border}`,
                          borderLeft: `4px solid ${riskStyle.text}`,
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                          最優先課題
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: riskStyle.text,
                            lineHeight: 1.4,
                          }}
                        >
                          {latest.result.primaryIssueLabel}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
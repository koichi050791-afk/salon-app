"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STORES } from "../../lib/constants/stores";
import { RANK_LABELS } from "../../lib/settings-types";
import { getMonthlyConfig } from "../../lib/storage/monthlyConfigs";
import {
  getLatestSavedDiagnosisByStore,
  getSavedDiagnosesByStoreAndMonth,
} from "../../lib/storage/savedDiagnoses";
import { calcMonthlyStoreMetrics } from "../../lib/logic/monthlyMetrics";
import { calcStoreRisk, getRiskLabel } from "../../lib/logic/risk";
import type {
  MonthlyConfig,
  MonthlyStoreMetrics,
  RiskLevel,
  SavedDiagnosis,
} from "../../lib/types/os";

const RISK_STYLE: Record<
  RiskLevel,
  { text: string; bg: string; border: string }
> = {
  green: {
    text: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
  },
  yellow: {
    text: "#d4a44b",
    bg: "rgba(212,164,75,0.10)",
    border: "rgba(212,164,75,0.24)",
  },
  red: {
    text: "#c97a7a",
    bg: "rgba(201,122,122,0.10)",
    border: "rgba(201,122,122,0.22)",
  },
  empty: {
    text: "#8b94a7",
    bg: "rgba(139,148,167,0.08)",
    border: "rgba(139,148,167,0.18)",
  },
  config_missing: {
    text: "#7c8db5",
    bg: "rgba(124,141,181,0.10)",
    border: "rgba(124,141,181,0.22)",
  },
};

type StoreDashboardCard = {
  storeId: string;
  storeLabel: string;
  latest: SavedDiagnosis | null;
  monthlyConfig: MonthlyConfig | null;
  monthlyMetrics: MonthlyStoreMetrics | null;
  risk: RiskLevel;
  monthSavedCount: number;
};

function currentYearMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString()}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function DashboardPage() {
  const [yearMonth] = useState(currentYearMonth());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const cards = useMemo<StoreDashboardCard[]>(() => {
    return STORES.map((store) => {
      const latest = getLatestSavedDiagnosisByStore(store.id);
      const monthlyConfig = getMonthlyConfig(store.id, yearMonth);
      const monthDiagnoses = getSavedDiagnosesByStoreAndMonth(store.id, yearMonth);

      const hasConfig = !!monthlyConfig;
      const hasData = monthDiagnoses.length > 0;

      const monthlyMetrics =
        monthlyConfig && hasData
          ? calcMonthlyStoreMetrics(yearMonth, monthlyConfig, monthDiagnoses)
          : null;

      const risk = calcStoreRisk(monthlyMetrics, hasConfig, hasData);

      return {
        storeId: store.id,
        storeLabel: store.label,
        latest,
        monthlyConfig,
        monthlyMetrics,
        risk,
        monthSavedCount: monthDiagnoses.length,
      };
    });
  }, [yearMonth, refreshKey]);

  const sortedCards = useMemo(() => {
    const weight: Record<RiskLevel, number> = {
      red: 0,
      yellow: 1,
      config_missing: 2,
      empty: 3,
      green: 4,
    };

    return [...cards].sort((a, b) => {
      const riskDiff = weight[a.risk] - weight[b.risk];
      if (riskDiff !== 0) return riskDiff;
      return a.storeLabel.localeCompare(b.storeLabel, "ja");
    });
  }, [cards]);

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
            href="/monthly-config"
            style={{
              fontSize: 12,
              color: "#9ca3af",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            月次設定
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

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 60px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          全店ダッシュボード
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
          {yearMonth} の月次基準と保存データをもとに、全店の状態を確認できます
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {sortedCards.map((card) => {
            const riskStyle = RISK_STYLE[card.risk];
            const riskLabel = getRiskLabel(card.risk);

            return (
              <div
                key={card.storeId}
                style={{
                  background: "#161b27",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18,
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
                        fontSize: 19,
                        fontWeight: 800,
                        color: "#f1f5f9",
                        marginBottom: 4,
                      }}
                    >
                      {card.storeLabel}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      当月保存件数 {card.monthSavedCount}件
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
                    {riskLabel}
                  </div>
                </div>

                {!card.monthlyConfig ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      padding: "18px 0",
                      lineHeight: 1.7,
                    }}
                  >
                    月次設定がまだありません。
                    <br />
                    先に月次設定画面で基準値を保存してください。
                  </div>
                ) : card.monthSavedCount === 0 || !card.monthlyMetrics ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      padding: "18px 0",
                      lineHeight: 1.7,
                    }}
                  >
                    この月の保存データがまだありません。
                    <br />
                    ホーム画面から入力・保存してください。
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <div
                        style={{
                          flex: 1,
                          background: riskStyle.bg,
                          border: `1px solid ${riskStyle.border}`,
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                          達成率
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            color: riskStyle.text,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {formatPercent(card.monthlyMetrics.achievementRate)}
                        </div>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          background:
                            card.monthlyMetrics.forecastAchievementRate >= 0.95
                              ? "rgba(16,185,129,0.08)"
                              : card.monthlyMetrics.forecastAchievementRate >= 0.88
                              ? "rgba(212,164,75,0.10)"
                              : "rgba(201,122,122,0.10)",
                          border:
                            card.monthlyMetrics.forecastAchievementRate >= 0.95
                              ? "1px solid rgba(16,185,129,0.25)"
                              : card.monthlyMetrics.forecastAchievementRate >= 0.88
                              ? "1px solid rgba(212,164,75,0.24)"
                              : "1px solid rgba(201,122,122,0.22)",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                          予測達成率
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {formatPercent(card.monthlyMetrics.forecastAchievementRate)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <div
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                          前年比
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color:
                              card.monthlyMetrics.yoyRate >= 0.97
                                ? "#10b981"
                                : card.monthlyMetrics.yoyRate >= 0.9
                                ? "#d4a44b"
                                : "#c97a7a",
                          }}
                        >
                          {formatPercent(card.monthlyMetrics.yoyRate)}
                        </div>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                          月平均生産性
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {formatCurrency(card.monthlyMetrics.monthlyProductivity)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 12,
                        padding: "12px 14px",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
                        最新スタッフ
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {card.latest?.staffName ?? "-"}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        {card.latest ? RANK_LABELS[card.latest.staffRank] : "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${riskStyle.border}`,
                        borderLeft: `4px solid ${riskStyle.text}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        marginBottom: 10,
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
                        {card.latest?.result.primaryIssueLabel ?? "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      <div>最新保存日 {card.latest?.date ?? "-"}</div>
                      <div>
                        経過目標 {formatCurrency(card.monthlyMetrics.targetElapsedSales)}
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
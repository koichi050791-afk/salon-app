"use client";

import { useEffect, useMemo, useState } from "react";
import { STORES } from "../../lib/constants/stores";
import { RANK_LABELS } from "../../lib/settings-types";
import { getMonthlyConfig } from "../../lib/storage/monthlyConfigs";
import {
  getLatestSavedDiagnosisByStore,
  getSavedDiagnosesByStoreAndMonth,
} from "../../lib/storage/savedDiagnoses";
import { calcMonthlyStoreMetrics } from "../../lib/logic/monthlyMetrics";
import { calcStoreRisk } from "../../lib/logic/risk";
import { getNextAction } from "../../lib/logic/nextAction";
import type {
  MonthlyConfig,
  MonthlyStoreMetrics,
  RiskLevel,
  SavedDiagnosis,
} from "../../lib/types/os";
import MetricTile from "../../components/ui/MetricTile";
import PageHeader from "../../components/ui/PageHeader";
import PanelCard from "../../components/ui/PanelCard";
import StatusBadge from "../../components/ui/StatusBadge";

type StoreDashboardCard = {
  storeId: string;
  storeLabel: string;
  latest: SavedDiagnosis | null;
  monthlyConfig: MonthlyConfig | null;
  monthlyMetrics: MonthlyStoreMetrics | null;
  risk: RiskLevel;
  monthSavedCount: number;
  nextAction: string;
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

function getMetricToneByRate(rate: number): "green" | "yellow" | "red" {
  if (rate >= 0.95) return "green";
  if (rate >= 0.88) return "yellow";
  return "red";
}

function getYoyTone(rate: number): "green" | "yellow" | "red" {
  if (rate >= 0.97) return "green";
  if (rate >= 0.9) return "yellow";
  return "red";
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

      const nextAction = getNextAction({
        risk,
        metrics: monthlyMetrics,
        hasConfig,
        hasData,
      });

      return {
        storeId: store.id,
        storeLabel: store.label,
        latest,
        monthlyConfig,
        monthlyMetrics,
        risk,
        monthSavedCount: monthDiagnoses.length,
        nextAction,
      };
    });
  }, [yearMonth, refreshKey]);

  const sortedCards = useMemo(() => {
    const weight: Record<RiskLevel, number> = {
      red: 0,
      yellow: 1,
      green: 2,
      empty: 3,
      config_missing: 4,
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
        background:
          "radial-gradient(circle at top, rgba(44,62,110,0.20), transparent 28%), #0d1117",
        color: "#f1f5f9",
        fontFamily:
          "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif",
      }}
    >
      <PageHeader
        title="サロンOS"
        subTitle="全店ダッシュボード"
        navItems={[
          { href: "/", label: "ホーム" },
          { href: "/monthly-config", label: "月次設定" },
          { href: "/settings", label: "設定" },
        ]}
      />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: "-0.03em",
            }}
          >
            全店ダッシュボード
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#8b94a7",
              lineHeight: 1.7,
            }}
          >
            {yearMonth} の月次基準と保存データをもとに、
            全店の状態と明日の最優先アクションを確認する画面です。
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 18,
          }}
        >
          {sortedCards.map((card) => (
            <PanelCard key={card.storeId}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#f8fafc",
                      marginBottom: 6,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {card.storeLabel}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    当月保存件数 {card.monthSavedCount}件
                  </div>
                </div>

                <StatusBadge level={card.risk} />
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft:
                    card.risk === "green"
                      ? "4px solid #10b981"
                      : card.risk === "yellow"
                      ? "4px solid #d4a44b"
                      : card.risk === "red"
                      ? "4px solid #c97a7a"
                      : "4px solid #7c8db5",
                  borderRadius: 16,
                  padding: "14px 15px",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    fontWeight: 600,
                  }}
                >
                  明日の最優先アクション
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#f1f5f9",
                    lineHeight: 1.6,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.nextAction}
                </div>
              </div>

              {!card.monthlyConfig ? (
                <div
                  style={{
                    minHeight: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "left",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 16,
                    padding: 18,
                    color: "#7f889b",
                    fontSize: 14,
                    lineHeight: 1.8,
                  }}
                >
                  月次設定がまだありません。
                  <br />
                  先に月次設定画面で基準値を保存してください。
                </div>
              ) : card.monthSavedCount === 0 || !card.monthlyMetrics ? (
                <div
                  style={{
                    minHeight: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "left",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 16,
                    padding: 18,
                    color: "#7f889b",
                    fontSize: 14,
                    lineHeight: 1.8,
                  }}
                >
                  この月の保存データがまだありません。
                  <br />
                  ホーム画面から入力・保存してください。
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <MetricTile
                      label="達成率"
                      value={formatPercent(card.monthlyMetrics.achievementRate)}
                      tone={getMetricToneByRate(card.monthlyMetrics.achievementRate)}
                    />
                    <MetricTile
                      label="予測達成率"
                      value={formatPercent(card.monthlyMetrics.forecastAchievementRate)}
                      tone={getMetricToneByRate(card.monthlyMetrics.forecastAchievementRate)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <MetricTile
                      label="前年比"
                      value={formatPercent(card.monthlyMetrics.yoyRate)}
                      tone={getYoyTone(card.monthlyMetrics.yoyRate)}
                    />
                    <MetricTile
                      label="月平均生産性"
                      value={formatCurrency(card.monthlyMetrics.monthlyProductivity)}
                      tone="indigo"
                    />
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 16,
                      padding: "14px 15px",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 6,
                        letterSpacing: "0.04em",
                        fontWeight: 600,
                      }}
                    >
                      最新スタッフ
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                      {card.latest?.staffName ?? "-"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {card.latest ? RANK_LABELS[card.latest.staffRank] : "-"}
                    </div>
                  </div>

                  <div
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderLeft:
                        card.risk === "green"
                          ? "4px solid #10b981"
                          : card.risk === "yellow"
                          ? "4px solid #d4a44b"
                          : card.risk === "red"
                          ? "4px solid #c97a7a"
                          : "4px solid #7c8db5",
                      borderRadius: 16,
                      padding: "14px 15px",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 6,
                        letterSpacing: "0.04em",
                        fontWeight: 600,
                      }}
                    >
                      最優先課題
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#f1f5f9",
                        lineHeight: 1.5,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {card.latest?.result.primaryIssueLabel ?? "-"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 14,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                        最新保存日
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {card.latest?.date ?? "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: 14,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                        経過目標
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        {formatCurrency(card.monthlyMetrics.targetElapsedSales)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </PanelCard>
          ))}
        </div>
      </main>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STORES } from "../../lib/constants/stores";
import {
  getMonthlyConfig,
  saveMonthlyConfig,
} from "../../lib/storage/monthlyConfigs";

function currentYearMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString()}`;
}

export default function MonthlyConfigPage() {
  const [selectedStoreId, setSelectedStoreId] = useState(STORES[0].id);
  const [yearMonth, setYearMonth] = useState(currentYearMonth());

  const [targetSales, setTargetSales] = useState("");
  const [prevYearSales, setPrevYearSales] = useState("");
  const [forecastSales, setForecastSales] = useState("");
  const [elapsedBusinessDays, setElapsedBusinessDays] = useState("");
  const [totalBusinessDays, setTotalBusinessDays] = useState("");
  const [staffCount, setStaffCount] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const item = getMonthlyConfig(selectedStoreId, yearMonth);

    if (!item) {
      setTargetSales("");
      setPrevYearSales("");
      setForecastSales("");
      setElapsedBusinessDays("");
      setTotalBusinessDays("");
      setStaffCount("");
      setError("");
      setMessage("");
      return;
    }

    setTargetSales(String(item.targetSales));
    setPrevYearSales(String(item.prevYearSales));
    setForecastSales(String(item.forecastSales));
    setElapsedBusinessDays(String(item.elapsedBusinessDays));
    setTotalBusinessDays(String(item.totalBusinessDays));
    setStaffCount(String(item.staffCount));
    setError("");
    setMessage("");
  }, [selectedStoreId, yearMonth]);

  const summary = useMemo(() => {
    const target = Number(targetSales) || 0;
    const prev = Number(prevYearSales) || 0;
    const forecast = Number(forecastSales) || 0;
    const elapsed = Number(elapsedBusinessDays) || 0;
    const total = Number(totalBusinessDays) || 0;
    const staff = Number(staffCount) || 0;

    return {
      dailyTarget: total > 0 ? Math.round(target / total) : 0,
      targetPerStaff: staff > 0 ? Math.round(target / staff) : 0,
      forecastRate: target > 0 ? Math.round((forecast / target) * 100) : 0,
      prevYearGap: target - prev,
      currentPaceTarget: total > 0 && elapsed > 0 ? Math.round((target / total) * elapsed) : 0,
    };
  }, [
    targetSales,
    prevYearSales,
    forecastSales,
    elapsedBusinessDays,
    totalBusinessDays,
    staffCount,
  ]);

  function handleSave() {
    const target = Number(targetSales);
    const prev = Number(prevYearSales);
    const forecast = Number(forecastSales);
    const elapsed = Number(elapsedBusinessDays);
    const total = Number(totalBusinessDays);
    const staff = Number(staffCount);

    if (!target || !prev || !forecast || !elapsed || !total || !staff) {
      setError("すべての項目を入力してください");
      setMessage("");
      return;
    }

    if (elapsed > total) {
      setError("経過営業日数は月間営業日数以下にしてください");
      setMessage("");
      return;
    }

    saveMonthlyConfig({
      storeId: selectedStoreId,
      yearMonth,
      targetSales: target,
      prevYearSales: prev,
      forecastSales: forecast,
      elapsedBusinessDays: elapsed,
      totalBusinessDays: total,
      staffCount: staff,
    });

    setError("");
    setMessage("保存しました");
    setTimeout(() => setMessage(""), 2000);
  }

  const selectedStore = STORES.find((s) => s.id === selectedStoreId);

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
            月次設定
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
            href="/dashboard"
            style={{
              fontSize: 12,
              color: "#9ca3af",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ダッシュボード
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

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 60px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          月次設定
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
          店舗ごとの月次基準を保存します
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {STORES.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStoreId(store.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                background:
                  selectedStoreId === store.id
                    ? "#3b82f6"
                    : "rgba(255,255,255,0.04)",
                color: selectedStoreId === store.id ? "#fff" : "#9ca3af",
                border:
                  selectedStoreId === store.id
                    ? "1px solid #3b82f6"
                    : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {store.label}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "#161b27",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#9ca3af",
              marginBottom: 18,
              letterSpacing: "0.04em",
            }}
          >
            {selectedStore?.label} / {yearMonth}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                対象月
              </label>
              <input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
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

            <div>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                目標売上
              </label>
              <input
                type="number"
                value={targetSales}
                onChange={(e) => setTargetSales(e.target.value)}
                placeholder="例：3500000"
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

            <div>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                昨年同月売上
              </label>
              <input
                type="number"
                value={prevYearSales}
                onChange={(e) => setPrevYearSales(e.target.value)}
                placeholder="例：3200000"
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

            <div>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                予測売上
              </label>
              <input
                type="number"
                value={forecastSales}
                onChange={(e) => setForecastSales(e.target.value)}
                placeholder="例：3400000"
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

            <div>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                経過営業日数
              </label>
              <input
                type="number"
                value={elapsedBusinessDays}
                onChange={(e) => setElapsedBusinessDays(e.target.value)}
                placeholder="例：10"
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

            <div>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                月間営業日数
              </label>
              <input
                type="number"
                value={totalBusinessDays}
                onChange={(e) => setTotalBusinessDays(e.target.value)}
                placeholder="例：25"
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

            <div>
              <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 6 }}>
                スタッフ人数
              </label>
              <input
                type="number"
                value={staffCount}
                onChange={(e) => setStaffCount(e.target.value)}
                placeholder="例：4"
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
          </div>

          {error && (
            <div
              style={{
                marginTop: 14,
                fontSize: 12,
                color: "#ef4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                marginTop: 14,
                fontSize: 12,
                color: "#10b981",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              ✓ {message}
            </div>
          )}

          <button
            onClick={handleSave}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "15px 0",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            保存する
          </button>
        </div>

        <div
          style={{
            background: "#161b27",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#9ca3af",
              marginBottom: 14,
              letterSpacing: "0.04em",
            }}
          >
            参考指標
          </div>

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
                1日あたり目標売上
              </div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {formatCurrency(summary.dailyTarget)}
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
                1人あたり月目標
              </div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {formatCurrency(summary.targetPerStaff)}
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
                予測達成率
              </div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {summary.forecastRate}%
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
                昨年同月との差
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: summary.prevYearGap >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {summary.prevYearGap >= 0 ? "+" : ""}
                {formatCurrency(summary.prevYearGap)}
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
                現在ペース時点の目標ライン
              </div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {formatCurrency(summary.currentPaceTarget)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
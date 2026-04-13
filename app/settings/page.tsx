"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { STORES } from "../../lib/constants/stores";
import {
  RANK_LABELS,
  StaffProfile,
  StaffRank,
} from "../../lib/settings-types";
import {
  getStaffByStore,
  addStaff,
  updateStaff,
  removeStaff,
} from "../../lib/storage/staffProfiles";

const RANKS = Object.entries(RANK_LABELS) as [StaffRank, string][];

type EditingState = {
  id: string;
  name: string;
  rank: StaffRank;
} | null;

export default function SettingsPage() {
  const [selectedStoreId, setSelectedStoreId] = useState(STORES[0].id);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [newName, setNewName] = useState("");
  const [newRank, setNewRank] = useState<StaffRank>("stylist");
  const [editing, setEditing] = useState<EditingState>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const reload = useCallback(() => {
    setStaffList(getStaffByStore(selectedStoreId));
  }, [selectedStoreId]);

  useEffect(() => {
    reload();
    setError("");
    setSuccessMsg("");
    setEditing(null);
  }, [selectedStoreId, reload]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  }

  function handleAdd() {
    if (!newName.trim()) {
      setError("名前を入力してください");
      return;
    }

    const result = addStaff({
      storeId: selectedStoreId,
      name: newName,
      rank: newRank,
    });

    if (!result.ok) {
      setError(result.error ?? "エラーが発生しました");
      return;
    }

    setNewName("");
    setNewRank("stylist");
    setError("");
    reload();
    showSuccess("追加しました");
  }

  function handleEditSave() {
    if (!editing) return;

    if (!editing.name.trim()) {
      setError("名前を入力してください");
      return;
    }

    const result = updateStaff(editing.id, {
      name: editing.name,
      rank: editing.rank,
    });

    if (!result.ok) {
      setError(result.error ?? "エラーが発生しました");
      return;
    }

    setEditing(null);
    setError("");
    reload();
    showSuccess("更新しました");
  }

  function handleRemove(id: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    removeStaff(id);
    reload();
    showSuccess("削除しました");
  }

  const selectedStore = STORES.find((s) => s.id === selectedStoreId)!;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#f1f5f9",
        fontFamily:
          "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
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
            設定
          </span>
        </div>

        <Link
          href="/"
          style={{
            fontSize: 12,
            color: "#6b7280",
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          ← ホームへ
        </Link>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 60px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
          スタッフ設定
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
          店舗を選択してスタッフを登録・管理してください
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
                color:
                  selectedStoreId === store.id ? "#fff" : "#9ca3af",
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
              marginBottom: 14,
              letterSpacing: "0.04em",
            }}
          >
            {selectedStore.label}にスタッフを追加
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                color: staffList.length >= 10 ? "#ef4444" : "#6b7280",
              }}
            >
              {staffList.length}/10名
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError("");
              }}
              placeholder="スタッフ名（例：池田）"
              disabled={staffList.length >= 10}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                flex: "1 1 160px",
                padding: "11px 14px",
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: 14,
                opacity: staffList.length >= 10 ? 0.5 : 1,
              }}
            />

            <select
              value={newRank}
              onChange={(e) => setNewRank(e.target.value as StaffRank)}
              disabled={staffList.length >= 10}
              style={{
                flex: "1 1 140px",
                padding: "11px 14px",
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f1f5f9",
                fontSize: 14,
                opacity: staffList.length >= 10 ? 0.5 : 1,
              }}
            >
              {RANKS.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div
              style={{
                fontSize: 12,
                color: "#ef4444",
                marginBottom: 10,
                padding: "8px 12px",
                background: "rgba(239,68,68,0.08)",
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                fontSize: 12,
                color: "#10b981",
                marginBottom: 10,
                padding: "8px 12px",
                background: "rgba(16,185,129,0.08)",
                borderRadius: 8,
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              ✓ {successMsg}
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={staffList.length >= 10}
            style={{
              width: "100%",
              padding: "11px 0",
              background:
                staffList.length >= 10
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
              border: "none",
              borderRadius: 10,
              color: staffList.length >= 10 ? "#4b5563" : "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: staffList.length >= 10 ? "not-allowed" : "pointer",
            }}
          >
            追加する
          </button>
        </div>

        {staffList.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#4b5563",
              fontSize: 14,
              border: "1px dashed rgba(255,255,255,0.06)",
              borderRadius: 16,
            }}
          >
            まだスタッフが登録されていません
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {staffList.map((staff) => (
              <div
                key={staff.id}
                style={{
                  background: "#161b27",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                {editing?.id === staff.id ? (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) => {
                          setEditing({ ...editing, name: e.target.value });
                          setError("");
                        }}
                        style={{
                          flex: "1 1 160px",
                          padding: "9px 12px",
                          background: "#0d1117",
                          border: "1px solid #3b82f6",
                          borderRadius: 8,
                          color: "#f1f5f9",
                          fontSize: 14,
                        }}
                      />
                      <select
                        value={editing.rank}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            rank: e.target.value as StaffRank,
                          })
                        }
                        style={{
                          flex: "1 1 140px",
                          padding: "9px 12px",
                          background: "#0d1117",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          color: "#f1f5f9",
                          fontSize: 14,
                        }}
                      >
                        {RANKS.map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleEditSave}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          background: "#10b981",
                          border: "none",
                          borderRadius: 8,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        保存
                      </button>

                      <button
                        onClick={() => {
                          setEditing(null);
                          setError("");
                        }}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          color: "#9ca3af",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#f1f5f9",
                        }}
                      >
                        {staff.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          marginTop: 3,
                        }}
                      >
                        {RANK_LABELS[staff.rank]}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          setEditing({
                            id: staff.id,
                            name: staff.name,
                            rank: staff.rank,
                          });
                          setError("");
                        }}
                        style={{
                          padding: "7px 14px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          color: "#9ca3af",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        編集
                      </button>

                      <button
                        onClick={() => handleRemove(staff.id, staff.name)}
                        style={{
                          padding: "7px 14px",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: 8,
                          color: "#ef4444",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
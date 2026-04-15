"use client";

import { useCallback, useEffect, useState } from "react";
import { STORES } from "../../lib/constants/stores";
import { RANK_LABELS, StaffProfile, StaffRank } from "../../lib/settings-types";
import {
  addStaff,
  getStaffByStore,
  removeStaff,
  updateStaff,
} from "../../lib/repositories/staff";

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
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await getStaffByStore(selectedStoreId);
      setStaffList(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込み失敗");
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    reload();
    setSuccessMsg("");
    setEditing(null);
  }, [reload]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  }

  async function handleAdd() {
    const result = await addStaff({
      storeId: selectedStoreId,
      name: newName,
      rank: newRank,
    });

    if (!result.ok) {
      setError(result.error ?? "追加失敗");
      return;
    }

    setNewName("");
    setError("");
    await reload();
    showSuccess("追加しました");
  }

  async function handleEditSave() {
    if (!editing) return;

    const result = await updateStaff(editing.id, editing);

    if (!result.ok) {
      setError(result.error ?? "更新失敗");
      return;
    }

    setEditing(null);
    await reload();
    showSuccess("更新しました");
  }

  async function handleRemove(id: string) {
    const result = await removeStaff(id);

    if (!result.ok) {
      setError(result.error ?? "削除失敗");
      return;
    }

    await reload();
    showSuccess("削除しました");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>スタッフ設定</h1>

      <div style={{ marginBottom: 20 }}>
        {STORES.map((s) => (
          <button key={s.id} onClick={() => setSelectedStoreId(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="名前"
      />

      <select
        value={newRank}
        onChange={(e) => setNewRank(e.target.value as StaffRank)}
      >
        {RANKS.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>

      <button onClick={handleAdd}>追加</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        staffList.map((s) => (
          <div key={s.id}>
            {editing?.id === s.id ? (
              <>
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
                <button onClick={handleEditSave}>保存</button>
              </>
            ) : (
              <>
                <span>{s.name}</span>
                <button
                  onClick={() =>
                    setEditing({ id: s.id, name: s.name, rank: s.rank })
                  }
                >
                  編集
                </button>
                <button onClick={() => handleRemove(s.id)}>削除</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
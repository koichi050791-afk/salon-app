"use client";

import { useEffect, useState } from "react";
import { STORES } from "@/lib/constants/stores";
import { RANK_LABELS, StaffProfile, StaffRank } from "@/lib/settings-types";
import {
  getStaffByStore,
  addStaff,
  removeStaff,
} from "@/lib/repositories/staff";

export default function SettingsPage() {
  const [selectedStore, setSelectedStore] = useState(STORES[0].id);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [newName, setNewName] = useState("");
  const [newRank, setNewRank] = useState<StaffRank>("stylist");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getStaffByStore(selectedStore);
        setStaffList(data);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedStore]);

  const handleAdd = async () => {
    const result = await addStaff({
      storeId: selectedStore,
      name: newName,
      rank: newRank,
    });

    if (!result.ok) {
      alert(result.error ?? "追加に失敗しました");
      return;
    }

    const data = await getStaffByStore(selectedStore);
    setStaffList(data);
    setNewName("");
    setNewRank("stylist");
  };

  const handleRemove = async (id: string) => {
    const result = await removeStaff(id);

    if (!result.ok) {
      alert(result.error ?? "削除に失敗しました");
      return;
    }

    const data = await getStaffByStore(selectedStore);
    setStaffList(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>スタッフ設定（Supabase版）</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>店舗</label>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
        >
          {STORES.map((store) => (
            <option key={store.id} value={store.id}>
              {store.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>名前</label>
        <input
          placeholder="名前"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>ランク</label>
        <select
          value={newRank}
          onChange={(e) => setNewRank(e.target.value as StaffRank)}
        >
          <option value="top">トップスタイリスト</option>
          <option value="stylist">スタイリスト</option>
          <option value="junior">ジュニアスタイリスト</option>
          <option value="colorist">カラーリスト</option>
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <button onClick={handleAdd}>追加</button>
      </div>

      <h2>スタッフ一覧</h2>

      {loading ? (
        <p>読み込み中...</p>
      ) : staffList.length === 0 ? (
        <p>まだ登録されていません</p>
      ) : (
        <ul style={{ paddingLeft: 20 }}>
          {staffList.map((staff) => (
            <li key={staff.id} style={{ marginBottom: 8 }}>
              {staff.name}（{RANK_LABELS[staff.rank]}）
              <button
                style={{ marginLeft: 12 }}
                onClick={() => handleRemove(staff.id)}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
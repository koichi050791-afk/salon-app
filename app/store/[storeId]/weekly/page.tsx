"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getStaffInput, saveStaffInput, getThisMonday } from "@/lib/staffInput";
import { diagnoseStaff, StaffDiagnosis } from "@/lib/diagnosisStaff";
import type { User } from "@supabase/supabase-js";

export default function WeeklyPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const weekStartDate = getThisMonday();

  const [user,         setUser]         = useState<User | null>(null);
  const [sales,        setSales]        = useState("");
  const [clients,      setClients]      = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [diagnosis,    setDiagnosis]    = useState<StaffDiagnosis | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const existing = await getStaffInput(user.id, storeId, weekStartDate);
      if (existing) {
        setSales(existing.sales.toString());
        setClients(existing.clients.toString());
        setWorkingHours(existing.hours.toString());
        setDiagnosis(diagnoseStaff(existing.sales, existing.clients, existing.hours));
      }
    }
    init();
  }, [storeId, weekStartDate]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const s = Number(sales)        || 0;
    const c = Number(clients)      || 0;
    const h = Number(workingHours) || 0;

    const { error } = await saveStaffInput({
      userId: user.id,
      storeId,
      weekStartDate,
      sales:   s,
      clients: c,
      hours:   h,
    });

    setSaving(false);
    if (error) {
      setError(error);
    } else {
      setSaved(true);
      setDiagnosis(diagnoseStaff(s, c, h));
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">

      {/* ヘッダー */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">週次入力</h2>
        <p className="text-xs text-gray-400 mt-1">週開始日: {weekStartDate}</p>
      </div>

      {/* 入力フォーム カード */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">今週の実績</p>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between px-5 py-4">
            <label className="text-sm font-medium text-gray-600">売上</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">¥</span>
              <input
                type="number"
                value={sales}
                onChange={(e) => { setSales(e.target.value); setSaved(false); }}
                placeholder="250000"
                className="text-base font-semibold text-gray-800 text-right w-32 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <label className="text-sm font-medium text-gray-600">客数</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={clients}
                onChange={(e) => { setClients(e.target.value); setSaved(false); }}
                placeholder="25"
                className="text-base font-semibold text-gray-800 text-right w-32 outline-none"
              />
              <span className="text-sm text-gray-400">人</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <label className="text-sm font-medium text-gray-600">労働時間</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.5"
                value={workingHours}
                onChange={(e) => { setWorkingHours(e.target.value); setSaved(false); }}
                placeholder="40"
                className="text-base font-semibold text-gray-800 text-right w-32 outline-none"
              />
              <span className="text-sm text-gray-400">h</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl text-base font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 mb-8 shadow-sm"
      >
        {saving ? "保存中…" : saved ? "✓ 保存しました" : "保存する"}
      </button>

      {/* 課題判定カード */}
      {diagnosis && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          {/* カードヘッダー */}
          <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">今週の分析結果</p>
          </div>

          <div className="px-5 py-5 space-y-5">

            {/* 最優先課題 */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">最優先課題</p>
              <p className="text-lg font-bold text-gray-800">{diagnosis.label}</p>
            </div>

            {/* 理由 */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">理由</p>
              <p className="text-sm text-gray-700 leading-relaxed">{diagnosis.message}</p>
            </div>

            {/* 数値根拠 */}
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-gray-400 mb-1">数値根拠</p>
              <p className="text-xs text-gray-600 leading-relaxed">{diagnosis.detail}</p>
            </div>

            {/* 次のアクション */}
            {diagnosis.actions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-3">次のアクション</p>
                <div className="space-y-2">
                  {diagnosis.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

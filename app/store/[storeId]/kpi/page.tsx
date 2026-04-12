"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WeeklyKPI, computeMetrics, currentWeek } from "@/lib/types";
import { getKPI, saveKPI } from "@/lib/kpi";

export default function KpiPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const router = useRouter();
  const week = currentWeek();

  const [revenue, setRevenue] = useState("");
  const [visitors, setVisitors] = useState("");
  const [staffCount, setStaffCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing KPI for this week from Supabase
  useEffect(() => {
    async function load() {
      const existing = await getKPI(storeId, week);
      if (existing) {
        setRevenue(existing.revenue.toString());
        setVisitors(existing.visitors.toString());
        setStaffCount(existing.staffCount.toString());
      }
    }
    load();
  }, [storeId, week]);

  const kpiPreview: WeeklyKPI | null =
    revenue && visitors && staffCount
      ? {
          storeId,
          week,
          revenue: Number(revenue),
          visitors: Number(visitors),
          staffCount: Number(staffCount),
        }
      : null;

  const metrics = kpiPreview ? computeMetrics(kpiPreview) : null;
  const fmt = (n: number) => `¥${Math.round(n).toLocaleString()}`;

  async function handleSave() {
    if (!kpiPreview) return;
    setSaving(true);
    setError(null);

    const { error } = await saveKPI(kpiPreview);

    if (error) {
      setError(error);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => router.push(`/store/${storeId}`), 800);
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">KPI Input</h2>
      <p className="text-sm text-gray-400 mb-8">Week: {week}</p>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Revenue (¥)</span>
          <input
            type="number"
            min="0"
            value={revenue}
            onChange={(e) => { setRevenue(e.target.value); setSaved(false); }}
            placeholder="e.g. 500000"
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Visitors</span>
          <input
            type="number"
            min="0"
            value={visitors}
            onChange={(e) => { setVisitors(e.target.value); setSaved(false); }}
            placeholder="e.g. 80"
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Staff Count</span>
          <input
            type="number"
            min="1"
            value={staffCount}
            onChange={(e) => { setStaffCount(e.target.value); setSaved(false); }}
            placeholder="e.g. 5"
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>
      </div>

      {metrics && (
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-indigo-700 mb-3">Calculated Metrics</p>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Avg Ticket</span>
            <span className="font-bold">
              {metrics.averageTicket != null ? fmt(metrics.averageTicket) : "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-700 mt-2">
            <span>Revenue / Staff</span>
            <span className="font-bold">
              {metrics.revenuePerStaff != null ? fmt(metrics.revenuePerStaff) : "—"}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!kpiPreview || saving || saved}
        className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-40"
      >
        {saved ? "Saved! Redirecting…" : saving ? "Saving…" : "Save KPIs"}
      </button>
    </div>
  );
}

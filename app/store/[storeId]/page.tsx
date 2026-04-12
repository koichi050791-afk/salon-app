"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WeeklyKPI, Task, computeMetrics, currentWeek } from "@/lib/types";
import { getKPI } from "@/lib/kpi";
import { getTasks } from "@/lib/storage";
import { diagnose, IssueKey, Diagnosis } from "@/lib/diagnosis";

// ---- 色マッピング（課題種別ごと） ----
const ISSUE_STYLE: Record<IssueKey, { border: string; badge: string }> = {
  low_ticket:   { border: "border-yellow-300", badge: "bg-yellow-100 text-yellow-700" },
  low_visitors: { border: "border-blue-300",   badge: "bg-blue-100 text-blue-700"     },
  complex:      { border: "border-orange-300", badge: "bg-orange-100 text-orange-700" },
  none:         { border: "border-green-300",  badge: "bg-green-100 text-green-700"   },
};

// ---- 汎用セクション ----
function Section({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        {action}
      </div>
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ---- 1行ラベル＋値 ----
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

// ---- 課題＋アクションセクション ----
function DiagnosisSection({ diagnosis }: { diagnosis: Diagnosis }) {
  const style = ISSUE_STYLE[diagnosis.issue];
  return (
    <>
      {/* 今週の課題 */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">今週の課題</p>
        <div className={`border rounded-lg bg-white overflow-hidden ${style.border}`}>
          <div className="px-4 py-3">
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${style.badge}`}>
              {diagnosis.cause}
            </span>
            <p className="text-sm font-medium text-gray-800 mb-1">{diagnosis.message}</p>
            <p className="text-xs text-gray-500">{diagnosis.detail}</p>
          </div>
        </div>
      </div>

      {/* 来週のアクション */}
      {diagnosis.actions.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">来週のアクション</p>
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {diagnosis.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
                <span className={`mt-0.5 text-xs font-bold w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full ${style.badge}`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ---- ページ本体 ----
export default function DashboardPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const week = currentWeek();

  const [kpi, setKpi]     = useState<WeeklyKPI | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function load() {
      setKpi(await getKPI(storeId, week));
      setTasks(getTasks(storeId, week));
    }
    load();
  }, [storeId, week]);

  const metrics   = kpi ? computeMetrics(kpi) : null;
  const diagnosis = kpi ? diagnose(kpi) : null;
  const fmt = (n: number) => `¥${n.toLocaleString()}`;

  return (
    <div className="max-w-lg mx-auto">

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">ダッシュボード</h2>
          <p className="text-xs text-gray-400 mt-0.5">週: {week}</p>
        </div>
        <Link
          href={`/store/${storeId}/kpi`}
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + KPI入力
        </Link>
      </div>

      {kpi ? (
        <>
          {/* 今週のKPI */}
          <Section title="今週のKPI">
            <Row label="売上"       value={fmt(kpi.revenue)} />
            <Row label="客数"       value={`${kpi.visitors} 人`} />
            <Row label="スタッフ数" value={`${kpi.staffCount} 人`} />
          </Section>

          {/* 算出指標 */}
          <Section title="算出指標">
            <Row
              label="客単価"
              value={metrics?.averageTicket != null ? fmt(Math.round(metrics.averageTicket)) : "—"}
            />
            <Row
              label="生産性（売上 ÷ スタッフ）"
              value={metrics?.revenuePerStaff != null ? fmt(Math.round(metrics.revenuePerStaff)) : "—"}
            />
          </Section>

          {/* 課題 + アクション */}
          {diagnosis && <DiagnosisSection diagnosis={diagnosis} />}
        </>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 mb-6">
          今週のKPIデータがまだありません。{" "}
          <Link href={`/store/${storeId}/kpi`} className="text-indigo-500 hover:underline">
            KPIを入力する
          </Link>
        </div>
      )}

      {/* 週間タスク */}
      <Section
        title="週間タスク"
        action={
          <Link href={`/store/${storeId}/tasks`} className="text-xs text-indigo-500 hover:underline">
            編集 →
          </Link>
        }
      >
        {tasks.map((task, i) => (
          <div key={task.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
            <span
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs
                ${task.done ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300"}`}
            >
              {task.done ? "✓" : ""}
            </span>
            <span className={`text-sm ${task.done ? "line-through text-gray-400" : "text-gray-700"}`}>
              {task.text || <span className="text-gray-300">タスク {i + 1} 未設定</span>}
            </span>
          </div>
        ))}
      </Section>

    </div>
  );
}

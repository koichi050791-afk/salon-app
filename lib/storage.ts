"use client";

import { Task } from "./types";

// --- Tasks (localStorage) ---
// KPI functions have been moved to lib/kpi.ts (Supabase).

const DEFAULT_TASKS = ["", "", ""];

export function getTasks(storeId: string, week: string): Task[] {
  const raw = localStorage.getItem(`tasks:${storeId}:${week}`);
  if (raw) return JSON.parse(raw);

  return DEFAULT_TASKS.map((_, i) => ({
    id: `${storeId}-${week}-task-${i + 1}`,
    storeId,
    week,
    text: "",
    done: false,
  }));
}

export function saveTasks(storeId: string, week: string, tasks: Task[]): void {
  localStorage.setItem(`tasks:${storeId}:${week}`, JSON.stringify(tasks));
}

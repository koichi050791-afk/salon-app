"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Task, currentWeek } from "@/lib/types";
import { getTasks, saveTasks } from "@/lib/storage";

export default function TasksPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const router = useRouter();
  const week = currentWeek();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTasks(getTasks(storeId, week));
  }, [storeId, week]);

  function updateText(index: number, text: string) {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, text } : t)));
    setSaved(false);
  }

  function toggleDone(index: number) {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, done: !t.done } : t)));
    setSaved(false);
  }

  function handleSave() {
    saveTasks(storeId, week, tasks);
    setSaved(true);
    setTimeout(() => router.push(`/store/${storeId}`), 800);
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Weekly Tasks</h2>
      <p className="text-sm text-gray-400 mb-8">Week: {week}</p>

      <div className="flex flex-col gap-4">
        {tasks.map((task, i) => (
          <div key={task.id} className="flex items-center gap-3">
            <button
              onClick={() => toggleDone(i)}
              className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition
                ${task.done ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300 hover:border-indigo-400"}`}
              aria-label={task.done ? "Mark undone" : "Mark done"}
            >
              {task.done ? "✓" : ""}
            </button>
            <input
              type="text"
              value={task.text}
              onChange={(e) => updateText(i, e.target.value)}
              placeholder={`Task ${i + 1}`}
              className={`flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400
                ${task.done ? "line-through text-gray-400" : ""}`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saved}
        className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-40"
      >
        {saved ? "Saved! Redirecting…" : "Save Tasks"}
      </button>
    </div>
  );
}

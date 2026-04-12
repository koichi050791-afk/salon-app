"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [sales, setSales] = useState("");
  const [clients, setClients] = useState("");
  const [hours, setHours] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("salon-kpi");
    if (saved) {
      const data = JSON.parse(saved);
      setSales(data.sales || "");
      setClients(data.clients || "");
      setHours(data.hours || "");
    }
  }, []);

  const handleSave = () => {
    const data = {
      sales,
      clients,
      hours,
    };

    localStorage.setItem("salon-kpi", JSON.stringify(data));
    setMessage("保存しました");
  };

  return (
    <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
        サロンKPIアプリ
      </h1>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
          週次入力
        </h2>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            type="number"
            placeholder="売上"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            style={{ padding: 12, fontSize: 16 }}
          />

          <input
            type="number"
            placeholder="客数"
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            style={{ padding: 12, fontSize: 16 }}
          />

          <input
            type="number"
            placeholder="労働時間"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            style={{ padding: 12, fontSize: 16 }}
          />

          <button
            onClick={handleSave}
            style={{
              padding: 12,
              fontSize: 16,
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: 8,
            }}
          >
            保存
          </button>

          {message && (
            <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
          )}
        </div>
      </section>
    </main>
  );
}
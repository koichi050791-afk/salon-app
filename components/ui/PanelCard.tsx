import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PanelCard({ children }: Props) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 18,
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  );
}
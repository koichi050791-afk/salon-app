import { getRiskLabel } from "../../lib/logic/risk";
import type { RiskLevel } from "../../lib/types/os";

type Props = {
  level: RiskLevel;
};

const STYLE_MAP: Record<
  RiskLevel,
  { text: string; bg: string; border: string }
> = {
  green: {
    text: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
  },
  yellow: {
    text: "#d4a44b",
    bg: "rgba(212,164,75,0.10)",
    border: "rgba(212,164,75,0.24)",
  },
  red: {
    text: "#c97a7a",
    bg: "rgba(201,122,122,0.10)",
    border: "rgba(201,122,122,0.22)",
  },
  empty: {
    text: "#8b94a7",
    bg: "rgba(139,148,167,0.08)",
    border: "rgba(139,148,167,0.18)",
  },
  config_missing: {
    text: "#7c8db5",
    bg: "rgba(124,141,181,0.10)",
    border: "rgba(124,141,181,0.22)",
  },
};

export default function StatusBadge({ level }: Props) {
  const style = STYLE_MAP[level];
  const label = getRiskLabel(level);

  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: style.text,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 999,
        padding: "7px 11px",
        whiteSpace: "nowrap",
        lineHeight: 1,
        letterSpacing: "0.02em",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
    >
      {label}
    </div>
  );
}
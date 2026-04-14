type Tone = "default" | "green" | "yellow" | "red" | "indigo";

type Props = {
  label: string;
  value: string;
  subValue?: string;
  tone?: Tone;
};

const TONE_MAP: Record<
  Tone,
  { text: string; bg: string; border: string }
> = {
  default: {
    text: "#f1f5f9",
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.06)",
  },
  green: {
    text: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.18)",
  },
  yellow: {
    text: "#d4a44b",
    bg: "rgba(212,164,75,0.10)",
    border: "rgba(212,164,75,0.18)",
  },
  red: {
    text: "#c97a7a",
    bg: "rgba(201,122,122,0.10)",
    border: "rgba(201,122,122,0.18)",
  },
  indigo: {
    text: "#dbe7ff",
    bg: "rgba(55, 84, 160, 0.14)",
    border: "rgba(124,141,181,0.18)",
  },
};

export default function MetricTile({
  label,
  value,
  subValue,
  tone = "default",
}: Props) {
  const toneStyle = TONE_MAP[tone];

  return (
    <div
      style={{
        flex: 1,
        background: toneStyle.bg,
        border: `1px solid ${toneStyle.border}`,
        borderRadius: 14,
        padding: "14px 15px",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#9ca3af",
          marginBottom: 6,
          letterSpacing: "0.04em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: toneStyle.text,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>

      {subValue && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: "#6b7280",
            lineHeight: 1.4,
          }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
}
import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  title: string;
  subTitle: string;
  navItems: NavItem[];
};

export default function PageHeader({ title, subTitle, navItems }: Props) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background:
          "linear-gradient(180deg, rgba(13,17,23,0.96), rgba(13,17,23,0.92))",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        backdropFilter: "blur(14px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "linear-gradient(135deg,#f59e0b,#ef4444)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
          }}
        >
          ✂
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-0.02em",
              color: "#f3f4f6",
            }}
          >
            {title}
          </span>
          <span style={{ color: "#6b7280", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>
            {subTitle}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              fontSize: 12,
              color: "#cbd5e1",
              textDecoration: "none",
              padding: "7px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
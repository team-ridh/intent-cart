"use client";

export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg,#FF6B35,#FF9A6B)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
          flexShrink: 0,
        }}
      >
        ⚡
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "-0.02em",
          }}
        >
          amazon <span className="gradient-text">now</span> os
        </div>
        <div
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Shop by Situation
        </div>
      </div>
    </div>
  );
}

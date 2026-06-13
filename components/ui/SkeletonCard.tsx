"use client";

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div className="skeleton" style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 17, width: "60%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 13, width: "85%", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 24, width: 56, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}

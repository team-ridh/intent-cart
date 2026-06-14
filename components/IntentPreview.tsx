"use client";

import { Sparkle } from "@phosphor-icons/react";

interface IntentPreviewProps {
  preview: string;
  confidence: number;
  urgencyMode: string;
}

export function IntentPreview({ preview, confidence, urgencyMode }: IntentPreviewProps) {
  return (
    <div
      className="animate-float-in"
      style={{
        marginTop: 16,
        padding: "10px 16px",
        borderRadius: 12,
        background: "linear-gradient(135deg,rgba(255,107,53,0.1),rgba(0,212,255,0.06))",
        border: "1px solid var(--border-accent)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Sparkle size={18} weight="fill" color="var(--accent)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{preview}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          Delivery preference: {urgencyMode} · Cart ready to generate
        </div>
      </div>
      <div className="badge badge-orange">{confidence}%</div>
    </div>
  );
}

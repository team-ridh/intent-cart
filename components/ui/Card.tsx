"use client";

import { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  accent?: boolean;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export function Card({
  children,
  elevated = false,
  accent = false,
  style,
  className = "",
  onClick,
  id,
}: CardProps) {
  const base = elevated ? "glass-elevated" : accent ? "card card-accent" : "card";

  return (
    <div
      id={id}
      className={`${base} ${className}`}
      style={onClick ? { cursor: "pointer", ...style } : style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

"use client";

import { ReactNode } from "react";

type BadgeColor = "orange" | "teal" | "green" | "purple" | "amber" | "red";

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  className?: string;
}

export function Badge({ color = "orange", children, className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${color} ${className}`}>
      {children}
    </span>
  );
}

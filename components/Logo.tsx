"use client";

import Image from "next/image";

interface LogoProps {
  /** "nav" = compact for navbar (default), "full" = larger for splash */
  variant?: "nav" | "full";
}

export function Logo({ variant = "nav" }: LogoProps) {
  const size = variant === "full" ? 240 : 120;

  return (
    <Image
      src="/intent-cart-logo-latest.png"
      alt="Intent Cart"
      width={size}
      height={size}
      priority
      style={{ objectFit: "contain" }}
    />
  );
}
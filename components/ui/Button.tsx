"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading = false, disabled, children, className = "", style, ...props }, ref) => {
    const variantClass =
      variant === "primary"
        ? "btn-primary"
        : variant === "secondary"
        ? "btn-secondary"
        : "btn-ghost";

    return (
      <button
        ref={ref}
        className={`${variantClass} ${className}`}
        disabled={disabled || loading}
        style={{ opacity: disabled || loading ? 0.55 : 1, cursor: disabled || loading ? "not-allowed" : "pointer", ...style }}
        {...props}
      >
        {loading ? (
          <>
            <span style={{ display: "inline-block", animation: "rotate-slow 0.8s linear infinite" }}>
              ⚙️
            </span>{" "}
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

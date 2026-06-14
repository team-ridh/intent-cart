"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <WarningCircleIcon size={56} weight="fill" color="#EF4444" />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 10,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              maxWidth: 400,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary" onClick={this.handleRetry}>
              Try Again
            </button>
            <button className="btn-secondary" onClick={() => (window.location.href = "/")}>
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

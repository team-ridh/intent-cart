"use client";

import {
  MapPinIcon,
  CloudRainIcon,
  SunIcon,
  SnowflakeIcon,
  CloudIcon,
  ThermometerHotIcon,
  WindIcon,
  SpinnerIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import type { WeatherResult } from "@/app/api/weather/route";
import type { LocationSignal, SignalStatus } from "@/hooks/useContextSignals";

// ─── Minimal weather icon matching the condition ───────────────────
function WeatherIcon({ condition }: { condition: WeatherResult["condition"] }) {
  const props = { size: 22, weight: "fill" as const };
  switch (condition) {
    case "clear":      return <SunIcon         {...props} color="#F59E0B" />;
    case "hot":        return <ThermometerHotIcon {...props} color="#EF4444" />;
    case "cold":       return <SnowflakeIcon    {...props} color="#60A5FA" />;
    case "cloudy":     return <CloudIcon        {...props} color="#9CA3AF" />;
    case "drizzle":
    case "rain":       return <CloudRainIcon    {...props} color="#3B82F6" />;
    case "heavy_rain": return <CloudRainIcon    {...props} color="#1D4ED8" />;
    case "storm":      return <CloudRainIcon    {...props} color="#7C3AED" />;
    case "snow":       return <SnowflakeIcon    {...props} color="#93C5FD" />;
    case "fog":        return <WindIcon         {...props} color="#D1D5DB" />;
    default:           return <CloudIcon        {...props} color="#9CA3AF" />;
  }
}

// ─── Props ────────────────────────────────────────────────────────
interface ContextSignalsProps {
  location: LocationSignal | null;
  weather: WeatherResult | null;
  status: SignalStatus;
  error: string | null;
  onRequest: () => void;
  onClear: () => void;
}

export function ContextSignals({
  location,
  weather,
  status,
  error,
  onRequest,
  onClear,
}: ContextSignalsProps) {
  const isActive = status === "done";
  const isLoading = status === "loading";
  const isError = status === "error";

  // What to show inside the chip
  let icon: React.ReactNode;
  let line1: string;
  let line2: string | null = null;

  if (isLoading) {
    icon = <SpinnerIcon size={22} weight="bold" style={{ animation: "rotate-slow 1s linear infinite", color: "var(--accent-teal)" }} />;
    line1 = "Locating…";
  } else if (isError) {
    icon = <WarningCircleIcon size={22} weight="fill" color="#EF4444" />;
    line1 = error ?? "Error";
  } else if (isActive && weather) {
    icon = <WeatherIcon condition={weather.condition} />;
    line1 = `${weather.tempC}°C`;
    line2 = location?.city ?? weather.city ?? null;
  } else if (isActive && location) {
    icon = <MapPinIcon size={22} weight="fill" color="var(--accent-teal)" />;
    line1 = location.city;
    line2 = location.region || null;
  } else {
    // Idle state
    icon = <MapPinIcon size={22} weight="regular" />;
    line1 = "My";
    line2 = "Context";
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    textAlign: "center",
    lineHeight: 1.3,
    maxWidth: "100%",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
    wordBreak: "break-word",
    fontFamily: "var(--font-body)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Section label — same style as "Quick Situations" */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 12,
          fontFamily: "var(--font-display)",
          whiteSpace: "nowrap",
        }}
      >
        Location & Weather
      </div>

      {/* Single chip */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          id="context-signals-chip"
          onClick={isActive || isLoading ? undefined : onRequest}
          disabled={isLoading}
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: 90,
            height: 90,
            borderRadius: 14,
            border: `1.5px ${isActive ? "solid" : isError ? "solid" : "dashed"} ${
              isError
                ? "rgba(239,68,68,0.5)"
                : isActive
                ? "var(--accent-teal)"
                : "var(--border)"
            }`,
            background: isActive
              ? "var(--accent-teal-dim)"
              : isError
              ? "rgba(239,68,68,0.07)"
              : "var(--bg-raised)",
            color: isActive
              ? "var(--accent-teal)"
              : isError
              ? "#EF4444"
              : "var(--text-secondary)",
            cursor: isActive || isLoading ? "default" : "pointer",
            transition: "all 0.15s ease",
            padding: "12px 8px 10px",
            boxShadow: isActive
              ? "0 0 0 3px rgba(0,153,187,0.18)"
              : "0 1px 3px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            if (!isActive && !isLoading && !isError) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-teal)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent-teal)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-teal-dim)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive && !isLoading && !isError) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-raised)";
            }
          }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </span>
          <span style={labelStyle}>
            {line1}
            {line2 ? (
              <>
                <br />
                <span style={{ fontSize: 10, opacity: 0.75 }}>{line2}</span>
              </>
            ) : null}
          </span>
        </button>

        {/* Clear × — only visible when active */}
        {isActive && (
          <button
            id="context-signals-clear"
            onClick={onClear}
            aria-label="Clear location and weather"
            style={{
              position: "absolute",
              top: -7,
              right: -7,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              zIndex: 2,
              color: "var(--text-muted)",
            }}
          >
            <XCircleIcon size={14} weight="fill" />
          </button>
        )}
      </div>
    </div>
  );
}

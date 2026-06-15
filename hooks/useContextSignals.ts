"use client";

import { useState, useCallback, useEffect } from "react";
import type { WeatherResult } from "@/app/api/weather/route";

// ─── Types ────────────────────────────────────────────────────────
export interface LocationSignal {
  lat: number;
  lon: number;
  city: string;
  region: string;
}

export interface ContextSignals {
  location: LocationSignal | null;
  weather: WeatherResult | null;
}

export type SignalStatus = "idle" | "loading" | "done" | "error";

interface UseContextSignalsReturn {
  location: LocationSignal | null;
  weather: WeatherResult | null;
  /** Combined status — loading if either is in flight, done when both resolve */
  status: SignalStatus;
  error: string | null;
  /** One tap: gets location + weather together */
  request: () => void;
  /** Clears everything back to idle */
  clear: () => void;
  /** Serialised context for the Bedrock API request */
  getSignals: () => ContextSignals;
}

// ─── sessionStorage keys ──────────────────────────────────────────
const SS_LOCATION = "ic_location";
const SS_WEATHER = "ic_weather";

function readSS<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSS(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage unavailable (private mode quota, etc.) — silently ignore
  }
}

function clearSS(...keys: string[]): void {
  try {
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch { /* ignore */ }
}

export function useContextSignals(): UseContextSignalsReturn {
  // Initialise from sessionStorage so a page reload restores the last values
  const [location, setLocation] = useState<LocationSignal | null>(
    () => readSS<LocationSignal>(SS_LOCATION)
  );
  const [weather, setWeather] = useState<WeatherResult | null>(
    () => readSS<WeatherResult>(SS_WEATHER)
  );
  // If we already have persisted data, start in "done" so the chip renders correctly
  const [status, setStatus] = useState<SignalStatus>(
    () => (readSS<LocationSignal>(SS_LOCATION) ? "done" : "idle")
  );
  const [error, setError] = useState<string | null>(null);

  // Keep sessionStorage in sync whenever state changes
  useEffect(() => {
    if (location) writeSS(SS_LOCATION, location);
  }, [location]);

  useEffect(() => {
    if (weather) writeSS(SS_WEATHER, weather);
  }, [weather]);

  // ─── One tap: get location + weather in a single flow ─────────
  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data: WeatherResult = await res.json();
            setLocation({ lat, lon, city: data.city, region: data.region });
            setWeather(data);
          } else {
            // Weather failed but we have coords — partial success
            setLocation({ lat, lon, city: `${lat.toFixed(1)}, ${lon.toFixed(1)}`, region: "" });
          }
        } catch {
          setLocation({ lat, lon, city: `${lat.toFixed(1)}, ${lon.toFixed(1)}`, region: "" });
        }
        setStatus("done");
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Location permission denied",
          2: "Location unavailable",
          3: "Location timed out",
        };
        setError(msgs[err.code] ?? "Could not get location");
        setStatus("error");
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
  }, []);

  const clear = useCallback(() => {
    setLocation(null);
    setWeather(null);
    setStatus("idle");
    setError(null);
    clearSS(SS_LOCATION, SS_WEATHER);
  }, []);

  const getSignals = useCallback(
    (): ContextSignals => ({ location, weather }),
    [location, weather]
  );

  return { location, weather, status, error, request, clear, getSignals };
}

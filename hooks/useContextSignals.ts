"use client";

import { useState, useCallback } from "react";
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

export function useContextSignals(): UseContextSignalsReturn {
  const [location, setLocation] = useState<LocationSignal | null>(null);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [status, setStatus] = useState<SignalStatus>("idle");
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  const getSignals = useCallback(
    (): ContextSignals => ({ location, weather }),
    [location, weather]
  );

  return { location, weather, status, error, request, clear, getSignals };
}

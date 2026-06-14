import { NextRequest, NextResponse, connection } from "next/server";

// ─── Types ────────────────────────────────────────────────────────
export interface WeatherResult {
  tempC: number;
  condition: WeatherCondition;
  conditionLabel: string;
  precipMmPerHr: number; // mm/hr — 0 if none
  city: string;
  region: string;
  isExtreme: boolean; // true for storms, heavy rain, extreme heat/cold
}

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "drizzle"
  | "rain"
  | "heavy_rain"
  | "storm"
  | "snow"
  | "fog"
  | "hot"    // >38°C clear
  | "cold";  // <10°C

// ─── Open-Meteo WMO weather code → condition ──────────────────────
// https://open-meteo.com/en/docs (WMO Weather interpretation codes)
function wmoToCondition(code: number, tempC: number): WeatherCondition {
  if (code === 0 || code === 1) {
    if (tempC >= 38) return "hot";
    if (tempC <= 10) return "cold";
    return "clear";
  }
  if (code === 2 || code === 3) return "cloudy";
  if (code >= 45 && code <= 49) return "fog";
  if (code >= 51 && code <= 55) return "drizzle";
  if (code >= 56 && code <= 57) return "drizzle"; // freezing drizzle
  if (code >= 61 && code <= 63) return "rain";
  if (code === 65) return "heavy_rain";
  if (code >= 66 && code <= 67) return "rain"; // freezing rain
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "storm";
  return "cloudy";
}

function conditionLabel(c: WeatherCondition): string {
  const map: Record<WeatherCondition, string> = {
    clear: "Clear sky",
    cloudy: "Cloudy",
    drizzle: "Light drizzle",
    rain: "Raining",
    heavy_rain: "Heavy rain",
    storm: "Thunderstorm",
    snow: "Snowing",
    fog: "Foggy",
    hot: "Hot & sunny",
    cold: "Cold",
  };
  return map[c];
}

function isExtreme(c: WeatherCondition): boolean {
  return ["heavy_rain", "storm", "snow", "hot", "cold"].includes(c);
}

// ─── Reverse geocode via Open-Meteo geocoding (no key needed) ─────
// Falls back to coordinates string if it fails.
async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; region: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "intent-cart/1.0" },
      }
    );
    clearTimeout(timeout);
    if (!res.ok) throw new Error("nominatim error");
    const data = await res.json();
    const addr = data.address ?? {};
    const city =
      addr.city ?? addr.town ?? addr.village ?? addr.county ?? `${lat.toFixed(1)},${lon.toFixed(1)}`;
    const region = addr.state ?? addr.country ?? "";
    return { city, region };
  } catch {
    return { city: `${lat.toFixed(1)},${lon.toFixed(1)}`, region: "" };
  }
}

// ─── GET /api/weather?lat=...&lon=... ─────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connection();

    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    if (!latStr || !lonStr) {
      return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Fetch current weather from Open-Meteo (free, no API key)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,precipitation,weather_code` +
        `&timezone=auto`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!weatherRes.ok) {
      throw new Error(`Open-Meteo error: ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current ?? {};

    const tempC: number = Math.round(current.temperature_2m ?? 25);
    const precipMmPerHr: number = parseFloat((current.precipitation ?? 0).toFixed(1));
    const wmoCode: number = current.weather_code ?? 0;

    const condition = wmoToCondition(wmoCode, tempC);
    const [geoResult] = await Promise.all([reverseGeocode(lat, lon)]);

    const result: WeatherResult = {
      tempC,
      condition,
      conditionLabel: conditionLabel(condition),
      precipMmPerHr,
      city: geoResult.city,
      region: geoResult.region,
      isExtreme: isExtreme(condition),
    };

    return NextResponse.json(result, {
      headers: {
        // Cache for 10 minutes — weather doesn't change by the second
        "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/weather] Error:", message);
    return NextResponse.json({ error: "Weather fetch failed", details: message }, { status: 502 });
  }
}

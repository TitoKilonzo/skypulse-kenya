import { WeatherAIResponse, GeoLocation } from "./types";

const BASE_URL = "https://api.weather-ai.co";

// ─── Kenya Cities ─────────────────────────────────────────────────────────────
export const KENYA_CITIES = [
  { name: "Nairobi",  region: "Nairobi County",  lat: -1.2921, lon: 36.8219 },
  { name: "Mombasa",  region: "Coast",            lat: -4.0435, lon: 39.6682 },
  { name: "Kisumu",   region: "Nyanza",           lat: -0.1022, lon: 34.7617 },
  { name: "Nakuru",   region: "Rift Valley",      lat: -0.3031, lon: 36.0800 },
  { name: "Eldoret",  region: "Uasin Gishu",      lat:  0.5143, lon: 35.2698 },
  { name: "Nyeri",    region: "Central",          lat: -0.4167, lon: 36.9500 },
  { name: "Malindi",  region: "Kilifi",           lat: -3.2138, lon: 40.1169 },
  { name: "Kakamega", region: "Western",          lat:  0.2827, lon: 34.7519 },
] as const;

// ─── Fetch weather by coordinates ────────────────────────────────────────────
export async function fetchWeather(
  lat: number,
  lon: number,
  days = 7
): Promise<WeatherAIResponse> {
  const apiKey = process.env.WEATHERAI_API_KEY;
  if (!apiKey) throw new Error("WEATHERAI_API_KEY is not set");

  const url = `${BASE_URL}/v1/weather?lat=${lat}&lon=${lon}&days=${days}&ai=true&units=metric&lang=en`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WeatherAI ${res.status}: ${body}`);
  }
  return res.json();
}

// ─── Fetch weather by IP geo-detection ───────────────────────────────────────
export async function fetchWeatherByIP(
  clientIP?: string
): Promise<{ weather: WeatherAIResponse; geo: GeoLocation }> {
  const apiKey = process.env.WEATHERAI_API_KEY;
  if (!apiKey) throw new Error("WEATHERAI_API_KEY is not set");

  const ip  = clientIP && clientIP !== "::1" && clientIP !== "127.0.0.1" ? clientIP : "auto";
  const url = `${BASE_URL}/v1/weather-geo?ip=${ip}&days=7&ai=true&units=metric`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 600 },
  });

  if (!res.ok) throw new Error(`WeatherAI ${res.status}`);

  const weather: WeatherAIResponse = await res.json();
  const geo: GeoLocation = {
    lat:      weather.lat,
    lon:      weather.lon,
    city:     res.headers.get("X-City")    ?? "Your Location",
    region:   res.headers.get("X-Region")  ?? "",
    country:  res.headers.get("X-Country") ?? "KE",
    timezone: weather.timezone,
  };
  return { weather, geo };
}

// ─── Format helpers ───────────────────────────────────────────────────────────
export function fmtDate(dt: number): string {
  return new Date(dt * 1000).toLocaleDateString("en-KE", {
    weekday: "short", day: "numeric", month: "short",
    timeZone: "Africa/Nairobi",
  });
}

export function fmtTime(dt: number, tz = "Africa/Nairobi"): string {
  return new Date(dt * 1000).toLocaleTimeString("en-KE", {
    hour: "2-digit", minute: "2-digit",
    timeZone: tz, hour12: false,
  });
}

export function windDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function uvInfo(uvi: number): { label: string; color: string; bg: string } {
  if (uvi <= 2)  return { label: "Low",       color: "text-emerald-400", bg: "bg-emerald-400/10" };
  if (uvi <= 5)  return { label: "Moderate",  color: "text-yellow-400",  bg: "bg-yellow-400/10"  };
  if (uvi <= 7)  return { label: "High",      color: "text-orange-400",  bg: "bg-orange-400/10"  };
  if (uvi <= 10) return { label: "Very High", color: "text-red-400",     bg: "bg-red-400/10"     };
  return               { label: "Extreme",   color: "text-purple-400",  bg: "bg-purple-400/10"  };
}

export function formatPop(pop: number): string {
  return `${Math.round(pop * 100)}%`;
}

// ─── Background image mapping ─────────────────────────────────────────────────
// Real Unsplash photos by weather condition
export type BgVariant = "default" | "rain" | "storm" | "clear-night";

export function getBackgroundImage(icon: string): { url: string; variant: BgVariant } {
  const code = icon.replace(/[dn]$/, ""); // strip day/night suffix for matching
  const isNight = icon.endsWith("n");

  if (["11"].includes(code))
    return {
      url: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=80&auto=format&fit=crop",
      variant: "storm",
    };
  if (["09", "10"].includes(code))
    return {
      url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=80&auto=format&fit=crop",
      variant: "rain",
    };
  if (["50"].includes(code))
    return {
      url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80&auto=format&fit=crop",
      variant: "default",
    };
  if (isNight)
    return {
      url: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1920&q=80&auto=format&fit=crop",
      variant: "clear-night",
    };
  if (["02", "03", "04"].includes(code))
    return {
      url: "https://images.unsplash.com/photo-1504608524841-42584120d693?w=1920&q=80&auto=format&fit=crop",
      variant: "default",
    };
  // Clear day — sunny sky
  return {
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80&auto=format&fit=crop",
    variant: "default",
  };
}

// ─── Moon phase ───────────────────────────────────────────────────────────────
export function moonPhaseLabel(phase: number): string {
  if (phase === 0 || phase === 1) return "New Moon";
  if (phase < 0.25)  return "Waxing Crescent";
  if (phase === 0.25) return "First Quarter";
  if (phase < 0.5)   return "Waxing Gibbous";
  if (phase === 0.5)  return "Full Moon";
  if (phase < 0.75)  return "Waning Gibbous";
  if (phase === 0.75) return "Last Quarter";
  return "Waning Crescent";
}

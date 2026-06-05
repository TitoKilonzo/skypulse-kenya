import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.weather-ai.co";

export async function GET(req: NextRequest) {
  const apiKey = process.env.WEATHERAI_API_KEY;

  if (!apiKey || apiKey === "wai_your_key_here") {
    return NextResponse.json(
      { error: "WEATHERAI_API_KEY is not configured. Add it to .env.local (or Vercel env vars)." },
      { status: 500 }
    );
  }

  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("mode") ?? "city"; // "city" | "geo"

  try {
    let url: string;

    if (mode === "geo") {
      // Auto-detect location from the caller's IP
      const forwardedFor = req.headers.get("x-forwarded-for");
      const clientIP = forwardedFor?.split(",")[0].trim() ?? "auto";
      const ip = clientIP === "::1" || clientIP === "127.0.0.1" ? "auto" : clientIP;
      url = `${BASE_URL}/v1/weather-geo?ip=${ip}&days=7&ai=true&units=metric`;
    } else {
      // Explicit lat/lon
      const lat  = searchParams.get("lat");
      const lon  = searchParams.get("lon");
      const days = searchParams.get("days") ?? "7";
      const lang = searchParams.get("lang") ?? "en";

      if (!lat || !lon) {
        return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
      }

      url = `${BASE_URL}/v1/weather?lat=${lat}&lon=${lon}&days=${days}&ai=true&units=metric&lang=${lang}`;
    }

    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 600 },
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.message ?? `Upstream error ${upstream.status}` },
        { status: upstream.status }
      );
    }

    // For geo mode, pull location from response headers and attach it
    if (mode === "geo") {
      const geo = {
        lat:     data.lat,
        lon:     data.lon,
        city:    upstream.headers.get("x-city")    ?? "Your Location",
        region:  upstream.headers.get("x-region")  ?? "",
        country: upstream.headers.get("x-country") ?? "KE",
        timezone: data.timezone ?? "Africa/Nairobi",
      };
      return NextResponse.json({ weather: data, geo });
    }

    return NextResponse.json(data);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

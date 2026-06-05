import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.weather-ai.co";

export async function GET(req: NextRequest) {
  const apiKey = process.env.WEATHERAI_API_KEY;

  // Clear, actionable error when key is missing
  if (!apiKey || apiKey === "wai_your_key_here" || apiKey.trim() === "") {
    return NextResponse.json(
      {
        error:
          "Weather API key not configured. " +
          "If running locally: add WEATHERAI_API_KEY to .env.local. " +
          "If on Vercel: go to Project Settings → Environment Variables and add WEATHERAI_API_KEY, then redeploy.",
      },
      { status: 500 }
    );
  }

  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("mode") ?? "city";

  try {
    let url: string;

    if (mode === "geo") {
      const forwardedFor = req.headers.get("x-forwarded-for");
      const clientIP = forwardedFor?.split(",")[0].trim() ?? "auto";
      const ip =
        clientIP === "::1" || clientIP === "127.0.0.1" ? "auto" : clientIP;
      url = `${BASE_URL}/v1/weather-geo?ip=${ip}&days=7&ai=true&units=metric`;
    } else {
      const lat  = searchParams.get("lat");
      const lon  = searchParams.get("lon");
      const days = searchParams.get("days") ?? "7";
      const lang = searchParams.get("lang") ?? "en";

      if (!lat || !lon) {
        return NextResponse.json(
          { error: "lat and lon are required" },
          { status: 400 }
        );
      }

      url = `${BASE_URL}/v1/weather?lat=${lat}&lon=${lon}&days=${days}&ai=true&units=metric&lang=${lang}`;
    }

    const upstream = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 600 },
    });

    // Read body once
    const text = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!upstream.ok) {
      // Translate upstream error codes into readable messages
      let message = "Weather data unavailable";
      if (upstream.status === 401) {
        message =
          "Invalid API key (401). Check that WEATHERAI_API_KEY is set correctly in Vercel " +
          "Environment Variables and that you have redeployed after adding it.";
      } else if (upstream.status === 403) {
        message =
          "API key not authorized for this host (403). " +
          "Check your WeatherAI dashboard to ensure this domain is in your allowlist.";
      } else if (upstream.status === 429) {
        message = "Rate limit reached (429). Please wait a moment and try again.";
      } else {
        message =
          (data as Record<string, string>)?.message ??
          (data as Record<string, string>)?.error ??
          `Upstream error ${upstream.status}`;
      }

      return NextResponse.json({ error: message }, { status: upstream.status });
    }

    // For geo mode, attach location info from response headers
    if (mode === "geo") {
      const weatherData = data as Record<string, unknown>;
      const geo = {
        lat:      weatherData.lat,
        lon:      weatherData.lon,
        city:     upstream.headers.get("x-city")    ?? "Your Location",
        region:   upstream.headers.get("x-region")  ?? "",
        country:  upstream.headers.get("x-country") ?? "KE",
        timezone: weatherData.timezone ?? "Africa/Nairobi",
      };
      return NextResponse.json({ weather: data, geo });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

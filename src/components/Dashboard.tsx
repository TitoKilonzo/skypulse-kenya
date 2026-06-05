"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Wind, Droplets, Eye, Gauge, Thermometer,
  Sunrise, Sunset, MapPin, RefreshCw, CloudRain,
  X, Navigation, Sun, Cloud, CloudSnow, CloudLightning,
  CloudDrizzle, Moon, Cloudy, CloudFog, Waves, Flame,
  AlertTriangle, ChevronRight, Activity
} from "lucide-react";
import { WeatherAIResponse, GeoLocation } from "@/lib/types";
import {
  KENYA_CITIES,
  fmtDate,
  fmtTime,
  windDirection,
  uvInfo,
  formatPop,
  getBackgroundImage,
  moonPhaseLabel,
} from "@/lib/weather";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardProps {
  initialData: WeatherAIResponse | null;
  initialCity: string;
  initialRegion: string;
  initialError: string | null;
}

// ─── Weather Icon component (Lucide, no emojis) ───────────────────────────────
function WeatherIcon({
  icon,
  size = 32,
  className = "",
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const code = icon.replace(/[dn]$/, "");
  const isNight = icon.endsWith("n");
  const props = { size, className, strokeWidth: 1.5 };

  if (code === "01") return isNight ? <Moon {...props} /> : <Sun {...props} />;
  if (code === "02") return isNight ? <Cloud {...props} /> : <Cloudy {...props} />;
  if (code === "03" || code === "04") return <Cloud {...props} />;
  if (code === "09") return <CloudDrizzle {...props} />;
  if (code === "10") return <CloudRain {...props} />;
  if (code === "11") return <CloudLightning {...props} />;
  if (code === "13") return <CloudSnow {...props} />;
  if (code === "50") return <CloudFog {...props} />;
  return <Sun {...props} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  delay = "",
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  sub?: string | React.ReactNode;
  delay?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass-card p-5 flex flex-col gap-3 animate-fade-up ${delay}
        ${accent ? "border-sky-400/30" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sky-400/60 text-xs font-body uppercase tracking-widest">{label}</span>
        <span className="text-sky-400/40">{icon}</span>
      </div>
      <p className="font-display text-3xl text-sky-50 leading-none">{value}</p>
      {sub && (
        <p className="text-sky-300/50 text-xs font-body leading-snug">{sub}</p>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({
  initialData,
  initialCity,
  initialRegion,
  initialError,
}: DashboardProps) {
  const [data, setData]       = useState<WeatherAIResponse | null>(initialData);
  const [city, setCity]       = useState(initialCity);
  const [region, setRegion]   = useState(initialRegion);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(initialError);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showCities, setShowCities] = useState(false);

  const icon    = data?.current?.weather?.[0]?.icon ?? "02d";
  const { url: bgUrl, variant: bgVariant } = getBackgroundImage(icon);

  // ── Load by city preset ───────────────────────────────────────────────────
  const loadCity = useCallback(
    async (lat: number, lon: number, name: string, reg: string) => {
      setLoading(true);
      setError(null);
      setShowCities(false);
      try {
        const res  = await fetch(`/api/weather?lat=${lat}&lon=${lon}&days=7`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Request failed");
        setData(json);
        setCity(name);
        setRegion(reg);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Detect location via IP ────────────────────────────────────────────────
  const detectLocation = useCallback(async () => {
    setGeoLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/weather?mode=geo");
      const json: { weather: WeatherAIResponse; geo: GeoLocation } = await res.json();
      if (!res.ok) throw new Error((json as unknown as { error: string }).error ?? "Geo failed");
      setData(json.weather);
      setCity(json.geo.city);
      setRegion(json.geo.region);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to detect location");
    } finally {
      setGeoLoading(false);
    }
  }, []);

  // Auto-detect on mount
  useEffect(() => {
    if (!initialError) detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = data?.current;
  const daily   = data?.daily   ?? [];
  const hourly  = data?.hourly  ?? [];
  const isNight = icon.endsWith("n");

  return (
    <div className="relative min-h-dvh">
      {/* ── Real background image ──────────────────────────────────────── */}
      <div
        className={`bg-hero ${bgVariant}`}
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />

      {/* ── Ambient sky-blue orbs ─────────────────────────────────────── */}
      <div
        className="fixed top-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 65%)",
        }}
      />
      <div
        className="fixed bottom-[-20%] left-[-8%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)",
        }}
      />

      {/* ── Page content ──────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-5">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center glow-sky">
              <Activity size={16} className="text-sky-400" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-display text-2xl text-sky-50 leading-none text-glow">
                SkyPulse
              </h1>
              <p className="text-[10px] text-sky-400/50 tracking-[0.25em] uppercase font-body mt-0.5">
                Kenya Weather
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCities((v) => !v)}
              className={`glass px-3.5 py-2 text-xs font-body font-medium flex items-center gap-2
                ${showCities ? "text-sky-300 border-sky-400/40" : "text-sky-300/60 hover:text-sky-300"}`}
            >
              <MapPin size={13} strokeWidth={2} />
              <span className="hidden sm:inline">Cities</span>
            </button>
            <button
              onClick={detectLocation}
              disabled={geoLoading}
              className="glass px-3.5 py-2 text-xs font-body font-medium text-sky-400 hover:text-sky-300
                flex items-center gap-2 disabled:opacity-50 hover:border-sky-400/40"
            >
              {geoLoading ? (
                <RefreshCw size={13} strokeWidth={2} className="animate-spin" />
              ) : (
                <Navigation size={13} strokeWidth={2} />
              )}
              <span className="hidden sm:inline">Auto-detect</span>
            </button>
          </div>
        </header>

        {/* ── City Picker ────────────────────────────────────────────────── */}
        {showCities && (
          <div className="glass-card p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sky-200 text-sm font-body font-semibold">
                  Select a City
                </p>
                <p className="text-sky-400/40 text-xs font-body mt-0.5">
                  Major Kenyan locations
                </p>
              </div>
              <button
                onClick={() => setShowCities(false)}
                className="text-sky-400/30 hover:text-sky-300 p-1"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {KENYA_CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => loadCity(c.lat, c.lon, c.name, c.region)}
                  disabled={loading}
                  className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all
                    ${
                      city === c.name
                        ? "border-sky-400/50 bg-sky-400/10 text-sky-200"
                        : "border-sky-400/10 bg-sky-900/20 text-sky-300/50 hover:border-sky-400/30 hover:bg-sky-400/5 hover:text-sky-200"
                    }`}
                >
                  <span className="text-[11px] font-body font-semibold tracking-wide">
                    {c.name}
                  </span>
                  <span className="text-[9px] font-body opacity-50">{c.region}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Error Banner ───────────────────────────────────────────────── */}
        {error && (
          <div className="glass-card border-red-400/30 bg-red-400/5 p-4 flex items-start gap-3 animate-fade-in">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" strokeWidth={2} />
            <div>
              <p className="text-red-300 text-sm font-body font-medium">Something went wrong</p>
              <p className="text-red-300/60 text-xs font-body mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Hero — Current Conditions ─────────────────────────────────── */}
        <section className="glass-card p-6 md:p-8 animate-fade-up delay-100">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-28 w-52" />
              <Skeleton className="h-4 w-72" />
            </div>
          ) : current ? (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Left — icon, temp, description */}
              <div>
                {/* Location */}
                <div className="flex items-center gap-1.5 mb-5">
                  <MapPin size={12} className="text-sky-400" strokeWidth={2} />
                  <span className="text-sky-300 text-sm font-body font-medium">{city}</span>
                  {region && (
                    <span className="text-sky-400/35 text-sm font-body">· {region}</span>
                  )}
                </div>

                {/* Main temperature display */}
                <div className="flex items-start gap-5">
                  <div className="animate-float">
                    <WeatherIcon
                      icon={icon}
                      size={56}
                      className={isNight ? "text-sky-200" : "text-sky-300"}
                    />
                  </div>
                  <div>
                    <div className="flex items-start">
                      <span className="font-display text-8xl md:text-9xl text-sky-50 leading-none text-glow">
                        {Math.round(current.temp)}
                      </span>
                      <span className="font-display text-3xl text-sky-300/70 mt-3">°C</span>
                    </div>
                    <p className="text-sky-300/60 text-sm font-body capitalize mt-1">
                      {current.weather[0].description}
                    </p>
                  </div>
                </div>

                {/* Hi / Lo / Feels */}
                <div className="flex items-center gap-4 mt-4 text-sm font-body">
                  <span className="text-sky-400/50">
                    Feels <span className="text-sky-300/80">{Math.round(current.feels_like)}°</span>
                  </span>
                  <span className="w-px h-3.5 bg-sky-400/20" />
                  <span className="text-sky-400/50">
                    H <span className="text-sky-300/80">{Math.round(daily[0]?.temp?.max ?? current.temp)}°</span>
                  </span>
                  <span className="text-sky-400/50">
                    L <span className="text-sky-300/80">{Math.round(daily[0]?.temp?.min ?? current.temp)}°</span>
                  </span>
                </div>
              </div>

              {/* Right — sunrise/sunset + time */}
              <div className="flex flex-col gap-4 shrink-0">
                <div className="glass-pill px-4 py-3 flex items-center gap-2.5">
                  <Sunrise size={14} className="text-amber-400" strokeWidth={2} />
                  <div>
                    <p className="text-[9px] text-sky-400/40 font-body uppercase tracking-widest">Sunrise</p>
                    <p className="text-sky-200 text-sm font-mono">{fmtTime(current.sunrise)}</p>
                  </div>
                </div>
                <div className="glass-pill px-4 py-3 flex items-center gap-2.5">
                  <Sunset size={14} className="text-orange-400" strokeWidth={2} />
                  <div>
                    <p className="text-[9px] text-sky-400/40 font-body uppercase tracking-widest">Sunset</p>
                    <p className="text-sky-200 text-sm font-mono">{fmtTime(current.sunset)}</p>
                  </div>
                </div>
                <p className="text-sky-400/30 text-[10px] font-mono text-right">
                  EAT · {fmtTime(current.dt)}
                </p>
              </div>
            </div>
          ) : !error ? (
            <p className="text-sky-400/30 text-sm font-body">No data available.</p>
          ) : null}
        </section>

        {/* ── AI Summary ────────────────────────────────────────────────── */}
        {data?.ai_summary && !loading && (
          <section className="glass-card p-5 border-sky-500/20 animate-fade-up delay-150">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <Activity size={12} className="text-sky-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sky-400/60 font-body mb-2">
                  AI Weather Insight
                </p>
                <p className="text-sky-100/75 text-sm font-body leading-relaxed">
                  {data.ai_summary}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Stat Cards — Row 1 ────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : current ? (
            <>
              <StatCard
                icon={<Droplets size={15} strokeWidth={1.5} />}
                label="Humidity"
                value={`${current.humidity}%`}
                sub={`Dew point ${Math.round(current.dew_point ?? 0)}°C`}
                delay="delay-200"
              />
              <StatCard
                icon={<Wind size={15} strokeWidth={1.5} />}
                label="Wind"
                value={`${Math.round(current.wind_speed)} m/s`}
                sub={`${windDirection(current.wind_deg)}${current.wind_gust ? ` · Gusts ${Math.round(current.wind_gust)} m/s` : ""}`}
                delay="delay-300"
              />
              <StatCard
                icon={<Eye size={15} strokeWidth={1.5} />}
                label="Visibility"
                value={`${((current.visibility ?? 10000) / 1000).toFixed(0)} km`}
                sub="Horizontal range"
                delay="delay-400"
              />
              <StatCard
                icon={<Thermometer size={15} strokeWidth={1.5} />}
                label="UV Index"
                value={String(Math.round(current.uvi))}
                sub={
                  <span className={uvInfo(current.uvi).color}>
                    {uvInfo(current.uvi).label}
                  </span>
                }
                accent
                delay="delay-500"
              />
            </>
          ) : null}
        </section>

        {/* ── Stat Cards — Row 2 ────────────────────────────────────────── */}
        {current && !loading && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<Gauge size={15} strokeWidth={1.5} />}
              label="Pressure"
              value={`${current.pressure}`}
              sub="hPa"
              delay="delay-200"
            />
            <StatCard
              icon={<CloudRain size={15} strokeWidth={1.5} />}
              label="Rain Chance"
              value={formatPop(hourly[0]?.pop ?? 0)}
              sub="Next hour"
              delay="delay-300"
            />
            <StatCard
              icon={<Cloudy size={15} strokeWidth={1.5} />}
              label="Cloud Cover"
              value={`${current.clouds}%`}
              sub="Sky coverage"
              delay="delay-400"
            />
            <StatCard
              icon={<Moon size={15} strokeWidth={1.5} />}
              label="Moon Phase"
              value={moonPhaseLabel(daily[0]?.moon_phase ?? 0).split(" ")[0]}
              sub={moonPhaseLabel(daily[0]?.moon_phase ?? 0)}
              delay="delay-500"
            />
          </section>
        )}

        {/* ── 24-Hour Hourly Strip ──────────────────────────────────────── */}
        <section className="animate-fade-up delay-300">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[10px] uppercase tracking-widest text-sky-400/40 font-body">
              24-Hour Forecast
            </p>
            <div className="flex-1 divider" />
          </div>

          {loading ? (
            <Skeleton className="h-28 w-full" />
          ) : hourly.length > 0 ? (
            <div className="scroll-x flex gap-2.5 pb-1">
              {hourly.slice(0, 24).map((h, i) => (
                <div
                  key={h.dt}
                  className={`glass-card shrink-0 flex flex-col items-center gap-2 px-3.5 py-3.5 min-w-[76px]
                    ${i === 0 ? "border-sky-400/35 bg-sky-400/8" : ""}`}
                >
                  <span className="text-[10px] text-sky-400/50 font-mono">
                    {i === 0 ? "Now" : fmtTime(h.dt)}
                  </span>
                  <WeatherIcon
                    icon={h.weather[0].icon}
                    size={20}
                    className="text-sky-300"
                  />
                  <span className="text-sm font-body font-semibold text-sky-100">
                    {Math.round(h.temp)}°
                  </span>
                  {h.pop > 0.05 && (
                    <div className="flex items-center gap-0.5">
                      <CloudRain size={9} className="text-sky-400" strokeWidth={2} />
                      <span className="text-[9px] text-sky-400 font-mono">
                        {formatPop(h.pop)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* ── 7-Day Forecast ────────────────────────────────────────────── */}
        <section className="animate-fade-up delay-400">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[10px] uppercase tracking-widest text-sky-400/40 font-body">
              7-Day Forecast
            </p>
            <div className="flex-1 divider" />
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : daily.length > 0 ? (
            <div className="glass-card overflow-hidden divide-y divide-sky-400/8">
              {daily.slice(0, 7).map((day, i) => (
                <div
                  key={day.dt}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-sky-400/5 transition-colors group"
                >
                  {/* Day label */}
                  <span className="text-xs text-sky-400/50 font-body w-20 shrink-0">
                    {i === 0 ? "Today" : fmtDate(day.dt)}
                  </span>

                  {/* Weather icon */}
                  <WeatherIcon
                    icon={day.weather[0].icon}
                    size={18}
                    className="text-sky-300 shrink-0"
                  />

                  {/* Summary */}
                  <span className="text-sky-300/45 text-xs font-body flex-1 hidden sm:block truncate capitalize">
                    {day.summary ?? day.weather[0].description}
                  </span>

                  {/* Rain chance */}
                  {day.pop > 0.05 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <CloudRain size={11} className="text-sky-400/60" strokeWidth={2} />
                      <span className="text-[11px] text-sky-400/70 font-mono">
                        {formatPop(day.pop)}
                      </span>
                    </div>
                  )}

                  {/* Temp range */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <span className="text-sky-400/40 text-xs font-mono w-8 text-right">
                      {Math.round(day.temp.min)}°
                    </span>
                    <div className="w-16 h-1 rounded-full bg-sky-900/60 hidden sm:block overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300"
                        style={{
                          width: `${Math.min(100, Math.max(20, ((day.temp.max - day.temp.min) / 15) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-sky-200 text-xs font-mono font-medium w-8">
                      {Math.round(day.temp.max)}°
                    </span>
                  </div>

                  <ChevronRight
                    size={13}
                    className="text-sky-400/20 shrink-0 group-hover:text-sky-400/50 transition-colors"
                    strokeWidth={2}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* ── Quick Info Strip ──────────────────────────────────────────── */}
        {current && !loading && (
          <section className="animate-fade-up delay-500">
            <div className="glass-card p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <Waves size={18} className="text-sky-400/50 mx-auto mb-1.5" strokeWidth={1.5} />
                  <p className="text-sky-200 text-sm font-body font-semibold">
                    {windDirection(current.wind_deg)}
                  </p>
                  <p className="text-sky-400/40 text-[10px] font-body uppercase tracking-widest mt-0.5">
                    Wind Dir.
                  </p>
                </div>
                <div>
                  <Flame
                    size={18}
                    className={`mx-auto mb-1.5 ${uvInfo(current.uvi).color}`}
                    strokeWidth={1.5}
                  />
                  <p className={`text-sm font-body font-semibold ${uvInfo(current.uvi).color}`}>
                    {uvInfo(current.uvi).label}
                  </p>
                  <p className="text-sky-400/40 text-[10px] font-body uppercase tracking-widest mt-0.5">
                    UV Risk
                  </p>
                </div>
                <div>
                  <Activity size={18} className="text-sky-400/50 mx-auto mb-1.5" strokeWidth={1.5} />
                  <p className="text-sky-200 text-sm font-body font-semibold">
                    {current.pressure} hPa
                  </p>
                  <p className="text-sky-400/40 text-[10px] font-body uppercase tracking-widest mt-0.5">
                    Pressure
                  </p>
                </div>
                <div>
                  <Sun size={18} className="text-amber-400/60 mx-auto mb-1.5" strokeWidth={1.5} />
                  <p className="text-sky-200 text-sm font-body font-semibold">
                    {current.clouds}%
                  </p>
                  <p className="text-sky-400/40 text-[10px] font-body uppercase tracking-widest mt-0.5">
                    Cloud Cover
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="flex items-center justify-between text-[10px] text-sky-400/25 pb-4 pt-2 font-body animate-fade-up delay-600">
          <span>
            Powered by{" "}
            <a
              href="https://weather-ai.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400/50 hover:text-sky-400 transition-colors"
            >
              WeatherAI API
            </a>
          </span>
          <span>Data · 10 min cache · EAT UTC+3</span>
        </footer>
      </div>
    </div>
  );
}

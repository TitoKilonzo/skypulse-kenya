import { Suspense } from "react";
import { fetchWeather } from "@/lib/weather";
import Dashboard from "@/components/Dashboard";
import LoadingScreen from "@/components/LoadingScreen";

// Default city — Nairobi
const DEFAULT = { lat: -1.2921, lon: 36.8219, city: "Nairobi", region: "Nairobi County" };

export default async function Home() {
  let initialData = null;
  let initialError: string | null = null;

  try {
    initialData = await fetchWeather(DEFAULT.lat, DEFAULT.lon, 7);
  } catch (err) {
    initialError = err instanceof Error ? err.message : "Failed to load weather data";
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Dashboard
        initialData={initialData}
        initialCity={DEFAULT.city}
        initialRegion={DEFAULT.region}
        initialError={initialError}
      />
    </Suspense>
  );
}

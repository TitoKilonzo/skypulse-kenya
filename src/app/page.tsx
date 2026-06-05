import { Suspense } from "react";
import { fetchWeather } from "@/lib/weather";
import Dashboard from "@/components/Dashboard";
import LoadingScreen from "@/components/LoadingScreen";

// Default city — Nairobi
const DEFAULT = { lat: -1.2921, lon: 36.8219, city: "Nairobi", region: "Nairobi County" };

export default async function Home() {
  // Attempt SSR prefetch — if it fails, Dashboard will fetch client-side on mount
  let initialData = null;
  try {
    initialData = await fetchWeather(DEFAULT.lat, DEFAULT.lon, 7);
  } catch {
    // Silently fall through — client-side detectLocation() will load data on mount
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Dashboard
        initialData={initialData}
        initialCity={DEFAULT.city}
        initialRegion={DEFAULT.region}
        initialError={null}
      />
    </Suspense>
  );
}

import { Cloud } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#020d1a]">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504608524841-42584120d693?w=1920&q=80&auto=format&fit=crop')",
        }}
      />
      <div className="fixed inset-0 bg-[#020d1a]/75" />
      <div className="relative z-10 flex flex-col items-center gap-5 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border border-sky-400/20 animate-spin-slow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Cloud size={24} className="text-sky-400" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl text-sky-200 text-glow">SkyPulse</p>
          <p className="text-xs text-sky-400/50 tracking-[0.3em] uppercase mt-1 font-body">
            Loading Kenya Weather
          </p>
        </div>
      </div>
    </div>
  );
}

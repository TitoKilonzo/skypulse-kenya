import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyPulse Kenya — AI-Powered Weather Dashboard",
  description:
    "Real-time weather forecasts and AI-powered summaries for Kenya and East Africa. Built on the WeatherAI API.",
  keywords: ["weather Kenya", "Nairobi weather", "East Africa forecast", "WeatherAI"],
  icons: {
    icon: [
      { url: "/favicon.ico",         sizes: "any" },
      { url: "/favicon-16x16.png",   sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png",   sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg",         type: "image/svg+xml"              },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0ea5e9",
  openGraph: {
    title: "SkyPulse Kenya",
    description: "Real-time weather + AI insights for Kenya",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyPulse Kenya",
    description: "Real-time weather + AI insights for Kenya",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

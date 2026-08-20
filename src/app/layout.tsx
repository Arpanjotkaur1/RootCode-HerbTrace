import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HerbTrace",
  description: "Verifiable, tamper-evident chain of custody for Ayurvedic herbs.",
};

// [SAANVI] Swap the body font stack / add next/font imports here as part of
// the design system pass. Tailwind theme tokens (colors, font families) are
// already set up in tailwind.config.ts -- build against those.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

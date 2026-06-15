import type { Metadata } from "next";
import "./globals.css";
import { CartHydrator } from "@/components/CartHydrator";

export const metadata: Metadata = {
  title: "Intent Cart — Shop by Situation",
  description:
    "AI-powered quick commerce that transforms your real-world situation into a ready-to-purchase cart in seconds. No search. No browsing. Just describe your need.",
  keywords: ["quick commerce", "AI shopping", "intent-driven", "Amazon Now"],
  openGraph: {
    title: "Intent Cart",
    description: "From situation to cart in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-grid">
        {/* Rehydrates the Zustand cart store from DynamoDB on every page load.
            Handles hard-refreshes, direct URL navigation, and back-button recovery. */}
        <CartHydrator />
        {children}
      </body>
    </html>
  );
}

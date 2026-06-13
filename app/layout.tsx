import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon Now OS — Shop by Situation",
  description:
    "AI-powered quick commerce that transforms your real-world situation into a ready-to-purchase cart in seconds. No search. No browsing. Just describe your need.",
  keywords: ["quick commerce", "AI shopping", "intent-driven", "Amazon Now"],
  openGraph: {
    title: "Amazon Now OS",
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
      <body className="min-h-full flex flex-col bg-grid">{children}</body>
    </html>
  );
}

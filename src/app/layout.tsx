import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SupportChat } from "@/components/SupportChat";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Plane Finder | Live Flight Tracking & Booking",
  description:
    "Track live flights worldwide, book tickets, and manage your travel with Plane Finder. Real-time aircraft positions, airline schedules, and secure e-tickets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        {children}
        <SiteFooter />
        <SupportChat />
      </body>
    </html>
  );
}

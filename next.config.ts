import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit", "sharp", "bwip-js"],
  // For Docker/Vercel/Firebase - remove for Cloudflare Pages (use OpenNext adapter)
  output: process.env.CLOUDFLARE ? undefined : "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.tile.openstreetmap.org" },
      { protocol: "https", hostname: "**.basemaps.cartocdn.com" },
    ],
  },
};

export default nextConfig;

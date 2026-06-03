import type { NextConfig } from "next";

/**
 * Keep build output under node_modules/.cache (not .next in project root).
 * Avoids OneDrive on Windows breaking symlinks/readlink on Desktop\.next.
 */
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? "node_modules/.cache/next",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

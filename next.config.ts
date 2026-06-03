import type { NextConfig } from "next";

/**
 * OneDrive on Windows breaks symlinks in `.next` (EINVAL readlink).
 * Use alternate cache locally only; Vercel/Linux must use default `.next`.
 */
const isVercel = process.env.VERCEL === "1";
const useLocalCache =
  !isVercel &&
  process.platform === "win32" &&
  !process.env.NEXT_DIST_DIR;

const distDir = process.env.NEXT_DIST_DIR ?? (useLocalCache ? "node_modules/.cache/next" : ".next");

const nextConfig: NextConfig = {
  distDir,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

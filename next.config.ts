import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Turbopack bazen App Router `src/app` klasörünü proje kökü sanıyor
    root: projectRoot,
  },
  webpack: (config, { isServer }) => {
    // Fix for Konva trying to import canvas in browser (only used with --webpack flag)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;

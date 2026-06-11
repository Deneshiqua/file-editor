import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Empty config to silence warning - Turbopack handles canvas module correctly
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

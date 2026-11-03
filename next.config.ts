import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konva has an optional Node "canvas" dependency that is never used in the browser.
  turbopack: {
    resolveAlias: { canvas: { browser: "./src/lib/empty.ts" } },
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only packages that should not be bundled for the client
  serverExternalPackages: ["rss-parser"],
};

export default nextConfig;

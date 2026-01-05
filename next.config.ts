import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase) {
      return [
        {
          source: "/api/:path*",
          destination: `${apiBase}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

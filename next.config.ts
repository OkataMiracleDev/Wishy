import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const rules: { source: string; destination: string }[] = [];
    if (apiBase) {
      rules.push({
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      });
    }
    rules.push(
      { source: "/favicon.ico", destination: "/branding/icon.png" },
      { source: "/icon", destination: "/branding/icon.png" },
      { source: "/apple-icon", destination: "/branding/apple-icon.png" },
      { source: "/apple-touch-icon.png", destination: "/branding/apple-icon.png" },
      { source: "/opengraph-image", destination: "/branding/opengraph-image.png" },
      { source: "/twitter-image", destination: "/branding/twitter-image.png" },
    );
    return rules;
  },
};

export default nextConfig;

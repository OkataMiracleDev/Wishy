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
      { source: "/og-image-latest", destination: "/branding/opengraph-image.png" },
      { source: "/twitter-image-latest", destination: "/branding/twitter-image.png" },
      { source: "/icon-latest", destination: "/branding/icon.png" },
      { source: "/apple-icon-latest", destination: "/branding/apple-icon.png" },
    );
    return rules;
  },
  async headers() {
    return [
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/(icon|apple-icon|apple-touch-icon.png)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/(opengraph-image|twitter-image|og-image-latest|twitter-image-latest)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/branding/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;

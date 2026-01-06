import type { Metadata } from "next";
import "./globals.css";
import { manrope, cherryBombOne } from "@/lib/fonts";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL("https://wishy-app.vercel.app"),
  title: {
    default: "Wishy — Dream, Plan, Save",
    template: "Wishy | %s",
  },
  description:
    "Create wishlists, plan your savings, and track progress with a simple, fun dashboard.",
  keywords: [
    "wishlists",
    "budget",
    "saving",
    "goals",
    "finance",
    "Nigeria",
    "NGN",
    "USD",
    "planning",
  ],
  openGraph: {
    type: "website",
    url: "https://wishy-app.vercel.app/",
    title: "Wishy — Dream, Plan, Save",
    description: "Create wishlists, plan your savings, and track progress with a simple, fun dashboard.",
    siteName: "Wishy",
    images: [{ url: "https://wishy-app.vercel.app/branding/opengraph-image.png?v=20260106", width: 1200, height: 630, type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wishy — Dream, Plan, Save",
    description: "Create wishlists, plan your savings, and track progress with a simple, fun dashboard.",
    images: ["https://wishy-app.vercel.app/branding/twitter-image.png?v=20260106"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://wishy-app.vercel.app/",
  },
  icons: {
    icon: [{ url: "https://wishy-app.vercel.app/branding/icon.png?v=20260106" }],
    apple: [{ url: "https://wishy-app.vercel.app/branding/apple-icon.png?v=20260106" }],
  },
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${cherryBombOne.variable} antialiased`}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "12px",
            },
          }}
        />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { manrope, cherryBombOne } from "@/lib/fonts";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Wishy",
  description: "Make your wishes come true",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cherryBombOne.variable} antialiased`}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}

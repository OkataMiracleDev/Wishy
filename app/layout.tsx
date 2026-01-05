import type { Metadata } from "next";
import "./globals.css";
import { manrope, cherryBombOne } from "@/lib/fonts";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "react-hot-toast";

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
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
          }
        }} />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}

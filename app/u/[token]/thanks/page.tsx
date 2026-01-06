"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ThanksPage({ params }: { params: { token: string } }) {
  const [message, setMessage] = useState("Thank you for your generous contribution!");
  useEffect(() => {
    async function load() {
      if (!params.token || typeof params.token !== "string" || params.token.length === 0) {
        return;
      }
      try {
        let res = await fetch(`/api/public/profile/${params.token}`).catch(() => null as any);
        if (!res || !res.ok) {
          res = await fetch(`${API_URL}/api/public/profile/${params.token}`);
        }
        const data = await res.json().catch(() => ({}));
        if (data?.profile?.thankYouMessage) {
          setMessage(String(data.profile.thankYouMessage));
        }
      } catch {}
    }
    load();
  }, [params.token]);
  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="rounded-2xl bg-[#161618] p-8 border border-white/5 shadow-xl text-center max-w-md">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-xl font-bold mb-2">Thank you</h1>
        <p className="text-sm text-zinc-400">{message}</p>
      </div>
    </main>
  );
}

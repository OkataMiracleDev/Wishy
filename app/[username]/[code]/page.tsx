"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PublicProfilePage() {
  const params = useParams() as { username: string; code: string };
  const token = params.code;
  const username = params.username;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      if (!token || typeof token !== "string" || token.length === 0) {
        setError("Link is invalid or the profile is unavailable.");
        setLoading(false);
        return;
      }
      try {
        let res = await fetch(`${API_URL}/api/public/profile/${token}`);
        if (!res.ok) {
          res = await fetch(`/api/public/profile/${token}`).catch(() => res);
        }
        const data = await res.json().catch(() => ({}));
        if (data?.profile) setProfile(data.profile);
        else setError("Link is invalid or the profile is unavailable.");
      } catch (e) {
        setError("We couldn’t load this profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        {loading ? (
          <div className="w-full h-[200px] rounded-2xl bg-[#161618] border border-white/5 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-[2rem] bg-[#161618] p-6 border border-red-500/20 shadow-xl text-center">
            <div className="text-2xl mb-2">🪄</div>
            <div className="text-white font-bold mb-1">Link Issue</div>
            <div className="text-sm text-zinc-400">{error}</div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                  <div className="h-full w-full rounded-full bg-[#161618] flex items-center justify-center text-2xl font-bold">
                    {profile.fullname?.charAt(0) || "U"}
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold">{profile.fullname}</div>
                  <div className="text-sm text-purple-400">@{profile.nickname}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
              <div className="text-sm text-zinc-400 mb-2">Wishlists</div>
              <div className="grid grid-cols-1 gap-3">
                {(profile.wishlists || []).map((w: any) => (
                  <div key={w._id} className="rounded-xl border border-white/10 bg-[#101011] p-4">
                    <div className="text-sm text-zinc-400">
                      {w.currency} {Number(w.goal).toLocaleString()} • {w.plan}
                    </div>
                    <div className="font-semibold text-white">{w.name}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                Total budget: {Number(profile.totalBudget || 0).toLocaleString()}
              </div>
              <a
                href={`/${username}/${token}/contribute`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors"
              >
                Contribute
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

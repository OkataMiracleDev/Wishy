"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PublicProfilePage() {
  const params = useParams() as { token: string };
  const token = params.token;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deckOrder, setDeckOrder] = useState<string[]>([]);
  const dragStart = useRef<{x:number;y:number;t:number}>({x:0,y:0,t:0});
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragId, setDragId] = useState<string>("");

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
          // Try same-origin fallback (useful on deployments that proxy /api)
          res = await fetch(`/api/public/profile/${token}`).catch(() => res);
        }
        const data = await res.json().catch(() => ({}));
        if (data?.profile) {
          setProfile(data.profile);
          const all = (data.profile.wishlists || []).flatMap((w: any) =>
            (w.items || []).map((it: any) => ({
              ...it,
              _id: String(it._id),
              currency: w.currency,
            }))
          );
          setDeckOrder(all.map((x: any) => x._id));
        } else {
          setError("Link is invalid or the profile is unavailable.");
        }
      } catch (e) {
        setError("We couldn’t load this profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const nextCard = () => {
    setDeckOrder((prev) => {
      const list = [...prev];
      const first = list.shift();
      if (first) list.push(first);
      return list;
    });
  };
  const prevCard = () => {
    setDeckOrder((prev) => {
      const list = [...prev];
      const last = list.pop();
      if (last) list.unshift(last);
      return list;
    });
  };

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
                href={`/u/${token}/contribute`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors"
              >
                Contribute
              </a>
            </div>

            <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
              <div className="mb-3 text-sm text-zinc-400">Items</div>
              <div className="relative h-[360px] w-full">
                {deckOrder.map((idRef, idx) => {
                  const all = (profile.wishlists || []).flatMap((w: any) =>
                    (w.items || []).map((it: any) => ({
                      ...it,
                      _id: String(it._id),
                      currency: w.currency,
                    }))
                  );
                  const it = all.find((x: any) => x._id === idRef) || all[idx];
                  if (!it) return null;
                  const offset = deckOrder.length - idx - 1;
                  const rotate = idx === deckOrder.length - 1 ? 0 : (((Array.from(idRef).reduce((s,c)=>s+c.charCodeAt(0),0) % 5) - 2));
                  const isTop = idx === deckOrder.length - 1;
                  return (
                    <div
                      key={`${it._id}-${idx}`}
                      className="absolute inset-0 rounded-[1.5rem] border border-white/10 bg-[#121214] shadow-xl touch-none"
                      style={{
                        transform: isTop ? `translate(${dragX}px, ${dragY}px) rotate(${rotate}deg)` : `translateY(${offset * 10}px) rotate(${rotate}deg)`,
                        zIndex: 10 + idx,
                      }}
                      onPointerDown={(e) => {
                        if (!isTop) return;
                        dragStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
                        setDragId(it._id);
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startT = Date.now();
                        const move = (ev: PointerEvent) => {
                          setDragX(ev.clientX - startX);
                          setDragY(ev.clientY - startY);
                        };
                        const up = (ev: PointerEvent) => {
                          document.removeEventListener("pointermove", move);
                          document.removeEventListener("pointerup", up);
                          const dx = ev.clientX - startX;
                          const dt = Date.now() - startT;
                          const v = Math.abs(dx) / Math.max(dt, 1);
                          if (Math.abs(dx) > 80 || v > 0.5) {
                            const idList = [...deckOrder];
                            idList.splice(idx, 1);
                            idList.unshift(String(it._id));
                            setDeckOrder(idList);
                          }
                          setDragX(0);
                          setDragY(0);
                          setDragId("");
                        };
                        (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                        document.addEventListener("pointermove", move);
                        document.addEventListener("pointerup", up);
                      }}
                    >
                      <div className="p-5 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">{it.importance}</div>
                          <div className="text-xs text-zinc-400">{it.currency} {Number(it.price).toLocaleString()}</div>
                        </div>
                        <div className="text-xl font-bold text-white mb-3">{it.name}</div>
                        {it.description ? (
                          <div className="text-sm text-zinc-400 mb-3">{it.description}</div>
                        ) : null}
                        <div className="flex-1 rounded-xl bg-black/20 border border-white/10 overflow-hidden">
                          {it.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">No image</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {deckOrder.length === 0 && (
                  <div className="absolute inset-0 rounded-[1.5rem] border border-dashed border-white/10 bg-[#121214] flex items-center justify-center text-zinc-500">
                    No items available.
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={prevCard}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={nextCard}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

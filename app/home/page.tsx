"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cherryBombOne } from "@/lib/fonts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Item = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  importance: "low" | "medium" | "high";
  description?: string;
};

type Wishlist = {
  _id: string;
  name: string;
  currency: string;
  goal: number;
  currentSaved: number;
  plan: "daily" | "weekly" | "monthly";
  items?: Item[];
};

export default function AuthedHomePage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deckOrders, setDeckOrders] = useState<Record<string, string[]>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const dragStartMap = useRef<Record<string, {x:number;y:number;t:number}>>({});
  const [dragXMap, setDragXMap] = useState<Record<string, number>>({});
  const [dragYMap, setDragYMap] = useState<Record<string, number>>({});
  const [dragIdMap, setDragIdMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        let res = await fetch(`/api/wishlist/list`, { credentials: "include" }).catch(() => null as any);
        if (!res || !res.ok) {
          res = await fetch(`${API_URL}/api/wishlist/list`, { credentials: "include" });
        }
        if (!res.ok) return;
        const data = await res.json();
        if (data?.wishlists) {
          setWishlists(data.wishlists);
          const initial: Record<string, string[]> = {};
          for (const w of data.wishlists as Wishlist[]) {
            const sorted = [...(w.items || [])].sort((a, b) => {
              const order = { high: 3, medium: 2, low: 1 } as any;
              return order[b.importance] - order[a.importance] || b.price - a.price;
            });
            initial[w._id] = sorted.map((it) => it._id);
          }
          setDeckOrders(initial);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      let res = await fetch(`/api/wishlist/${confirmDeleteId}`, { method: "DELETE", credentials: "include" }).catch(() => null as any);
      if (!res || !res.ok) {
        res = await fetch(`${API_URL}/api/wishlist/${confirmDeleteId}`, { method: "DELETE", credentials: "include" });
      }
      if (res.ok) {
        setWishlists((prev) => prev.filter((w) => w._id !== confirmDeleteId));
      }
    } catch (e) {
      console.error("Failed to delete", e);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId("");
    }
  };

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white pb-32">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`${cherryBombOne.className} text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`}>
              Dashboard
            </h1>
            <p className="text-sm text-zinc-400">Welcome back, Dreamer!</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[2px]">
            <div className="h-full w-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
              <span className="text-lg">🦄</span>
            </div>
          </div>
        </header>

        {/* Total Balance Card */}
        <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] border border-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Saved</span>
            </div>
            
            <div className="text-5xl font-bold tracking-tighter text-white mb-2">
              <span className="text-purple-400 text-3xl align-top mr-1">₦</span>
              {wishlists.reduce((acc, w) => acc + w.currentSaved, 0).toLocaleString()}
            </div>
            
            <div className="flex items-center gap-2 mt-4">
               <div className="flex -space-x-2">
                 {[...Array(Math.min(3, wishlists.length))].map((_, i) => (
                   <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#1c1c1e]" />
                 ))}
               </div>
               <span className="text-xs text-zinc-500 font-medium">
                 {wishlists.length} active goals
               </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Wishes</h2>
          <Link 
            href="/wishlist" 
            className="group flex items-center justify-center h-10 w-10 rounded-full bg-white text-black hover:bg-purple-400 hover:text-white transition-all duration-300 shadow-lg shadow-white/10 hover:shadow-purple-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </Link>
        </div>

        {/* Wishlist Grid */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <p>Loading your dreams...</p>
            </div>
          ) : wishlists.length === 0 ? (
             <div className="rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
               <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✨</div>
               <h3 className="text-lg font-semibold text-white mb-2">Start Dreaming</h3>
               <p className="mb-6 text-sm text-zinc-500 max-w-[200px] mx-auto">Create your first wishlist to start your savings journey.</p>
               <Link 
                 href="/wishlist"
                 className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors"
               >
                 Create Wishlist
               </Link>
             </div>
          ) : (
            wishlists.map((w) => (
              <div key={w._id} className="group relative overflow-hidden rounded-[2rem] bg-[#161618] p-6 transition-all hover:bg-[#1c1c1e] border border-white/5 hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-900/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="mb-4 flex items-start justify-between relative z-10">
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1">{w.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                      <span className="flex items-center gap-1 bg-zinc-800/50 px-2 py-1 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <span className="capitalize">{w.plan}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleDelete(w._id)}
                        className="rounded-full bg-red-500/10 p-3 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete Wishlist"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                    <Link
                      href={`/wishlist/${w._id}/items`}
                      className="rounded-full bg-purple-500/10 p-3 text-purple-400 hover:bg-purple-500 hover:text-white transition-colors"
                      title="Add items"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    </Link>
                    <div className="rounded-full bg-purple-500/10 p-3 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-end justify-between mb-3">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {w.currency} {w.currentSaved.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 mb-1">
                      Goal: {w.currency} {w.goal.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      style={{ width: `${Math.min(100, (w.currentSaved / w.goal) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Item Swipe Deck */}
                {w.items && w.items.length > 0 ? (
                  <div className="relative z-0 mt-6 h-[260px]">
                    {(deckOrders[w._id] || []).map((idRef, idx) => {
                      const it = (w.items || []).find((x) => x._id === idRef) || (w.items || [])[idx];
                      const offset = (deckOrders[w._id] || []).length - idx - 1;
                      const rotate = idx === (deckOrders[w._id] || []).length - 1 ? 0 : (((Array.from(idRef).reduce((s,c)=>s+c.charCodeAt(0),0) % 5) - 2));
                      const isTop = idx === (deckOrders[w._id] || []).length - 1;
                      return (
                        <div
                          key={it?._id || `${w._id}-${idx}`}
                          className="absolute inset-0 rounded-2xl border border-white/10 bg-[#101011] shadow-xl touch-none"
                          style={{
                            transform: isTop ? `translate(${dragXMap[w._id] || 0}px, ${dragYMap[w._id] || 0}px) rotate(${rotate}deg)` : `translateY(${offset * 10}px) rotate(${rotate}deg)`,
                            zIndex: 5 + idx,
                          }}
                          onPointerDown={(e) => {
                            if (!isTop || !it?._id) return;
                            dragStartMap.current[w._id] = { x: e.clientX, y: e.clientY, t: Date.now() };
                            setDragIdMap((prev) => ({ ...prev, [w._id]: it._id }));
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const startT = Date.now();
                            const move = (ev: PointerEvent) => {
                              setDragXMap((prev) => ({ ...prev, [w._id]: ev.clientX - startX }));
                              setDragYMap((prev) => ({ ...prev, [w._id]: ev.clientY - startY }));
                            };
                            const up = (ev: PointerEvent) => {
                              document.removeEventListener("pointermove", move);
                              document.removeEventListener("pointerup", up);
                              const dx = ev.clientX - startX;
                              const dt = Date.now() - startT;
                              const v = Math.abs(dx) / Math.max(dt, 1);
                              if (Math.abs(dx) > 80 || v > 0.5) {
                                const idList = [...(deckOrders[w._id] || [])];
                                idList.splice(idx, 1);
                                idList.push(it._id);
                                setDeckOrders((prev) => ({ ...prev, [w._id]: idList }));
                              }
                              setDragXMap((prev) => ({ ...prev, [w._id]: 0 }));
                              setDragYMap((prev) => ({ ...prev, [w._id]: 0 }));
                              setDragIdMap((prev) => ({ ...prev, [w._id]: "" }));
                            };
                            (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                            document.addEventListener("pointermove", move);
                            document.addEventListener("pointerup", up);
                          }}
                        >
                          {it ? (
                            <div className="p-4 h-full flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">{it.importance}</div>
                                <div className="text-xs text-zinc-400">{w.currency} {Number(it.price).toLocaleString()}</div>
                              </div>
                              <div className="text-lg font-bold text-white mb-2">{it.name}</div>
                              {it.description ? (
                                <div className="text-xs text-zinc-400 mb-3 line-clamp-3">{it.description}</div>
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
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-sm rounded-[2rem] bg-[#161618] p-6 border border-white/10 shadow-2xl">
              <div className="text-lg font-bold text-white mb-2">Delete Wishlist?</div>
              <p className="text-sm text-zinc-400 mb-4">This action will remove the wishlist from your dashboard.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId("")}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

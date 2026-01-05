"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cherryBombOne } from "@/lib/fonts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Wishlist = {
  _id: string;
  name: string;
  currency: string;
  goal: number;
  currentSaved: number;
  plan: "daily" | "weekly" | "monthly";
};

export default function AuthedHomePage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/wishlist/list`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.wishlists) setWishlists(data.wishlists);
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wishlist?")) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setWishlists((prev) => prev.filter((w) => w._id !== id));
      }
    } catch (e) {
      console.error("Failed to delete", e);
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
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

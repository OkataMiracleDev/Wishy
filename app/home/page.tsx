"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/wishlist/list`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.wishlists) setWishlists(data.wishlists);
      } catch {}
    }
    load();
  }, []);

  const hasWishlists = wishlists.length > 0;
  const current = hasWishlists ? wishlists[currentIndex % wishlists.length] : null;
  const [pointerX, setPointerX] = useState<number | null>(null);

  return (
    <main className="relative min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 sm:max-w-lg">
        <div className="mb-6 w-full text-center">
          <h1 className="text-2xl font-semibold text-white">Let’s create your wishlist</h1>
        </div>
        <div className="relative w-full max-w-sm">
          {hasWishlists && current && (
            <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-3xl bg-primary/60 shadow-xl" />
          )}
          {hasWishlists && current && (
            <div className="relative z-10 rounded-3xl bg-primary p-6 text-white shadow-2xl">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-wide opacity-80">
                <span>{current.plan}</span>
                <span>
                  {current.currency} {current.goal.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{current.name}</h2>
                <p className="text-sm opacity-90">
                  Saved {current.currency} {current.currentSaved.toLocaleString()} of{" "}
                  {current.currency} {current.goal.toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() =>
              hasWishlists
                ? setCurrentIndex((i) => (i + 1) % wishlists.length)
                : (window.location.href = "/wishlist")
            }
            onContextMenu={(e) => {
              e.preventDefault();
              if (hasWishlists) setCurrentIndex((i) => (i + 1) % wishlists.length);
            }}
            onPointerDown={(e) => setPointerX(e.clientX)}
            onPointerUp={(e) => {
              if (pointerX !== null && e.clientX < pointerX - 30 && hasWishlists) {
                setCurrentIndex((i) => (i + 1) % wishlists.length);
              }
              setPointerX(null);
            }}
            className="mt-6 flex h-16 w-full items-center justify-center rounded-3xl border border-dashed border-white/40 bg-white/10 text-white"
          >
            <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold text-primary">
              +
            </span>
            <span className="text-sm font-medium">
              {hasWishlists ? "Add another wish" : "Create your first wishlist"}
            </span>
          </button>
        </div>

        <nav className="mt-10 flex w-full max-w-sm items-center justify-around rounded-full bg-black/40 px-6 py-3 text-xs text-white">
          <Link href="/home" className="flex flex-col items-center gap-1">
            <span className="h-7 w-7 rounded-full bg-white text-black flex items-center justify-center text-[11px]">
              H
            </span>
            <span>Home</span>
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center gap-1">
            <span className="h-7 w-7 rounded-full border border-white flex items-center justify-center text-[11px]">
              ₦
            </span>
            <span>Budget</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1">
            <span className="h-7 w-7 rounded-full border border-white flex items-center justify-center text-[11px]">
              ☺
            </span>
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}

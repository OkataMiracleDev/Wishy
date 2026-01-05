"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cherryBombOne } from "@/lib/fonts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Item = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  importance: "low" | "medium" | "high";
};

export default function WishlistItemsPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const [items, setItems] = useState<Item[]>([]);
  const [wishlistName, setWishlistName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string | number>("");
  const [importance, setImportance] = useState<"low" | "medium" | "high">("medium");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/wishlist/items/${id}`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (data?.items) setItems(data.items);
        if (data?.wishlist) {
          setWishlistName(data.wishlist.name);
          setCurrency(data.wishlist.currency);
        }
      } catch {}
      setIsLoading(false);
    }
    if (id) load();
  }, [id]);

  const stack = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 } as any;
      return order[b.importance] - order[a.importance] || b.price - a.price;
    });
    return sorted;
  }, [items]);

  const deckRef = useRef<HTMLDivElement>(null);

  const handleAddItem = async () => {
    if (!name || !price) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("wishlistId", id);
      formData.append("name", name);
      formData.append("price", String(price));
      formData.append("importance", importance);
      if (image) formData.append("image", image);
      const res = await fetch(`${API_URL}/api/wishlist/item/add`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.wishlist?.items) {
        setItems(data.wishlist.items);
        setName("");
        setPrice("");
        setImportance("medium");
        setImage(null);
      }
    } catch (e) {} finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-dvh w-full bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white pb-32">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className={`${cherryBombOne.className} text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`}>
            {wishlistName || "Wishlist"} Items
          </h1>
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Back
          </button>
        </div>

        <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 ml-1">Item Name</label>
              <input
                type="text"
                placeholder="e.g. Macbook Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 ml-1">Price ({currency})</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 ml-1">Importance</label>
              <div className="flex gap-2">
                {(["low","medium","high"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setImportance(lvl)}
                    className={`flex-1 rounded-xl border px-2 py-3 text-xs font-medium uppercase tracking-wider transition-all ${
                      importance === lvl ? "border-purple-500 bg-purple-500/20 text-purple-400" : "border-white/10 bg-black/20 text-zinc-500 hover:bg-white/5"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 ml-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setImage(f);
                }}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!name || !price || isSubmitting}
            onClick={handleAddItem}
            className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </button>
        </div>

        <div ref={deckRef} className="relative h-[420px] w-full">
          {stack.map((it, idx) => {
            const offset = stack.length - idx - 1;
            const rotate = idx === stack.length - 1 ? 0 : -3 + Math.random() * 6;
            return (
              <div
                key={it._id}
                className="absolute inset-0 rounded-[2rem] border border-white/10 bg-[#161618] shadow-xl touch-pan-y"
                style={{
                  transform: `translateY(${offset * 12}px) rotate(${rotate}deg)`,
                  zIndex: 10 + idx,
                }}
                onPointerDown={(e) => {
                  const target = e.currentTarget;
                  const startX = e.clientX;
                  const startY = e.clientY;
                  let moved = false;
                  function move(ev: PointerEvent) {
                    moved = true;
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    target.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
                    target.style.transition = "none";
                  }
                  function up(ev: PointerEvent) {
                    document.removeEventListener("pointermove", move);
                    document.removeEventListener("pointerup", up);
                    if (moved) {
                      const dx = ev.clientX - startX;
                      if (Math.abs(dx) > 80) {
                        const newOrder = [...stack.slice(0, idx), ...stack.slice(idx + 1), it];
                        setItems(newOrder);
                        return;
                      }
                    }
                    target.style.transform = `translateY(${offset * 12}px) rotate(${rotate}deg)`;
                    target.style.transition = "transform 200ms ease";
                  }
                  document.addEventListener("pointermove", move);
                  document.addEventListener("pointerup", up);
                }}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-purple-400 font-semibold uppercase tracking-wider">{it.importance}</div>
                    <div className="text-sm text-zinc-400">{currency} {Number(it.price).toLocaleString()}</div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-4">{it.name}</div>
                  <div className="flex-1 rounded-2xl bg-black/20 border border-white/10 overflow-hidden">
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
          {stack.length === 0 && (
            <div className="absolute inset-0 rounded-[2rem] border border-dashed border-white/10 bg-[#161618] flex items-center justify-center text-zinc-500">
              No items yet. Add your first item above.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

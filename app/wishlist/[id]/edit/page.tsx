"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

export default function EditWishlistPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const [items, setItems] = useState<Item[]>([]);
  const [wishlistName, setWishlistName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string>("");
  const [itemDraft, setItemDraft] = useState<{ name: string; price: string; importance: "low" | "medium" | "high"; description: string }>({ name: "", price: "", importance: "medium", description: "" });

  useEffect(() => {
    async function load() {
      try {
        let res = await fetch(`/api/wishlist/items/${id}`, { credentials: "include" }).catch(() => null as any);
        if (!res || !res.ok) {
          res = await fetch(`${API_URL}/api/wishlist/items/${id}`, { credentials: "include" });
        }
        const data = await res.json().catch(() => ({}));
        if (data?.items) setItems(data.items);
        if (data?.wishlist) {
          setWishlistName(data.wishlist.name);
          setCurrency(data.wishlist.currency);
        }
      } catch {}
    }
    if (id) load();
  }, [id]);

  const startEditItem = (it: Item) => {
    setEditingItemId(it._id);
    setItemDraft({ name: it.name, price: String(it.price), importance: it.importance, description: it.description || "" });
  };

  const saveWishlist = async () => {
    setSaving(true);
    try {
      if (image && image.size > 5 * 1024 * 1024) {
        toast.error("Image must be 5MB or less");
        return;
      }
      const fd = new FormData();
      fd.append("id", id);
      fd.append("name", wishlistName);
      fd.append("currency", currency);
      if (image) fd.append("image", image);
      let res = await fetch(`/api/wishlist/update`, { method: "POST", credentials: "include", body: fd }).catch(() => null as any);
      if (!res || !res.ok) {
        res = await fetch(`${API_URL}/api/wishlist/update`, { method: "POST", credentials: "include", body: fd });
      }
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        toast.success("Wishlist updated");
        setItems(data.wishlist.items || items);
      } else {
        toast.error("Failed to update");
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const saveItem = async () => {
    if (!editingItemId) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("wishlistId", id);
      fd.append("itemId", editingItemId);
      fd.append("name", itemDraft.name);
      fd.append("price", itemDraft.price);
      fd.append("importance", itemDraft.importance);
      fd.append("description", itemDraft.description);
      let res = await fetch(`/api/wishlist/item/update`, { method: "POST", credentials: "include", body: fd }).catch(() => null as any);
      if (!res || !res.ok) {
        res = await fetch(`${API_URL}/api/wishlist/item/update`, { method: "POST", credentials: "include", body: fd });
      }
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setItems(data.wishlist.items || []);
        setEditingItemId("");
        toast.success("Item updated");
      } else {
        toast.error("Failed to update item");
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    setSaving(true);
    try {
      let res = await fetch(`/api/wishlist/item/${id}/${itemId}`, { method: "DELETE", credentials: "include" }).catch(() => null as any);
      if (!res || !res.ok) {
        res = await fetch(`${API_URL}/api/wishlist/item/${id}/${itemId}`, { method: "DELETE", credentials: "include" });
      }
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setItems(data.wishlist.items || []);
        toast.success("Item deleted");
      } else {
        toast.error("Failed to delete item");
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white pb-32">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px]" />
      </div>
      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className={`${cherryBombOne.className} text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`}>
            Edit Wishlist
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
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">Name</label>
              <input
                type="text"
                value={wishlistName}
                onChange={(e) => setWishlistName(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 ml-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white"
              >
                {["NGN","USD","EUR","GBP"].map((c) => (
                  <option key={c} value={c} className="bg-[#161618]">{c}</option>
                ))}
              </select>
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
            disabled={saving}
            onClick={saveWishlist}
            className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
          <div className="mb-4 text-sm text-zinc-400">Items</div>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it._id} className="rounded-xl border border-white/10 bg-[#101011] p-4">
                {editingItemId === it._id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={itemDraft.name}
                      onChange={(e) => setItemDraft((d) => ({ ...d, name: e.target.value }))}
                      className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={itemDraft.price}
                      onChange={(e) => setItemDraft((d) => ({ ...d, price: e.target.value }))}
                      className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white"
                    />
                    <select
                      value={itemDraft.importance}
                      onChange={(e) => setItemDraft((d) => ({ ...d, importance: e.target.value as any }))}
                      className="w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white"
                    >
                      {["low","medium","high"].map((lvl) => (
                        <option key={lvl} value={lvl} className="bg-[#161618]">{lvl}</option>
                      ))}
                    </select>
                    <textarea
                      value={itemDraft.description}
                      onChange={(e) => setItemDraft((d) => ({ ...d, description: e.target.value }))}
                      className="sm:col-span-2 w-full rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm text-white min-h-[60px]"
                    />
                    <div className="sm:col-span-2 flex gap-2">
                      <button
                        type="button"
                        onClick={saveItem}
                        disabled={saving}
                        className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingItemId("")}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{it.name}</div>
                      <div className="text-xs text-zinc-400">{currency} {Number(it.price).toLocaleString()} • {it.importance}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditItem(it)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(it._id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#101011] p-4 text-center text-zinc-500">
                No items in this wishlist.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ContributePage({ params }: { params: { token: string } }) {
  const token = params.token;
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [wishlistId, setWishlistId] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState<string | number>("");
  const [imageData, setImageData] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/api/public/profile/${token}`);
      const data = await res.json().catch(() => ({}));
      if (data?.profile) setProfile(data.profile);
    }
    load();
  }, [token]);

  const items = useMemo(() => {
    const w = (profile?.wishlists || []).find((x: any) => String(x._id) === String(wishlistId));
    return w?.items || [];
  }, [profile, wishlistId]);

  const wishlistCurrency = useMemo(() => {
    const w = (profile?.wishlists || []).find((x: any) => String(x._id) === String(wishlistId));
    return w?.currency || "";
  }, [profile, wishlistId]);

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-md px-6 py-8 sm:max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Contribute</h1>
        {profile && (
          <div className="rounded-2xl bg-[#161618] p-6 border border-white/5 shadow-xl mb-6">
            <div className="text-sm">
              {profile.accountName} • {profile.bankName} • {profile.accountNumber}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[#161618] p-6 border border-white/5 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 ml-1">Select Wishlist</label>
            <select
              value={wishlistId}
              onChange={(e) => setWishlistId(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white"
            >
              <option value="">Choose...</option>
              {(profile?.wishlists || []).map((w: any) => (
                <option key={w._id} value={w._id} className="bg-[#161618]">
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 ml-1">Select Item</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white"
            >
              <option value="">Choose...</option>
              {items.map((it: any) => (
                <option key={it._id} value={it._id} className="bg-[#161618]">
                  {it.name} • {wishlistCurrency} {Number(it.price).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 ml-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 ml-1">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 ml-1">Amount</label>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 ml-1">Receipt Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => setImageData(String(reader.result || ""));
                reader.readAsDataURL(f);
              }}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
            />
          </div>

          <button
            type="button"
            disabled={!wishlistId || !name || !email || !amount || !imageData || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const res = await fetch(`${API_URL}/api/public/contribute`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    token,
                    wishlistId,
                    itemId,
                    amount: Number(amount),
                    name,
                    email,
                    imageData,
                  }),
                });
                const data = await res.json().catch(() => ({}));
                if (data?.ok) {
                  router.push(`/u/${token}/thanks`);
                }
              } catch (e) {} finally {
                setIsSubmitting(false);
              }
            }}
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Done"}
          </button>
        </div>
      </div>
    </main>
  );
}

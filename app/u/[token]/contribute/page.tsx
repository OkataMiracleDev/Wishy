"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ContributePage() {
  const params = useParams() as { token: string };
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
  const [method, setMethod] = useState<"external" | "wallet">("external");

  useEffect(() => {
    async function load() {
      if (!token || typeof token !== "string" || token.length === 0) {
        return;
      }
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

  useEffect(() => {
    setItemId("");
  }, [wishlistId]);

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
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setMethod("external")}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold ${method === "external" ? "bg-white text-black" : "border border-white/10 text-white"}`}
            >
              Pay to External Account
            </button>
            <button
              type="button"
              onClick={() => setMethod("wallet")}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold ${method === "wallet" ? "bg-white text-black" : "border border-white/10 text-white"}`}
            >
              Pay to Wallet (Flutterwave)
            </button>
          </div>
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

          {method === "external" && (
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
          )}

          {method === "external" ? (
            <button
              type="button"
              disabled={!wishlistId || !name || !email || !amount || !imageData || isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  let res = await fetch(`/api/public/contribute`, {
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
                  }).catch(() => null as any);
                  if (!res || !res.ok) {
                    res = await fetch(`${API_URL}/api/public/contribute`, {
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
                  }
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
          ) : (
            <button
              type="button"
              disabled={!wishlistId || !name || !email || !amount || isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  let res = await fetch(`/api/public/wallet/initiate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      token,
                      amount: Number(amount),
                      name,
                      email,
                      wishlistId,
                      itemId,
                    }),
                  }).catch(() => null as any);
                  if (!res || !res.ok) {
                    res = await fetch(`${API_URL}/api/public/wallet/initiate`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        token,
                        amount: Number(amount),
                        name,
                        email,
                        wishlistId,
                        itemId,
                      }),
                    });
                  }
                  const data = await res.json().catch(() => ({}));
                  if (data?.ok && data?.payUrl) {
                    window.location.href = String(data.payUrl);
                  } else {
                    setIsSubmitting(false);
                  }
                } catch (e) {
                  setIsSubmitting(false);
                }
              }}
              className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Redirecting..." : "Pay via Flutterwave"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

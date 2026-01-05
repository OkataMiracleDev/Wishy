"use client";
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
  items?: { _id: string; name: string; price: number; importance: "low" | "medium" | "high" }[];
};

export default function BudgetPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [amount, setAmount] = useState<number | string>("");
  const [selected, setSelected] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/wishlist/list`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (data?.wishlists) setWishlists(data.wishlists);
        const pr = await fetch(`${API_URL}/api/profile/payments`, { credentials: "include" });
        const pdata = await pr.json().catch(() => ({}));
        if (pdata?.payments) setPayments(pdata.payments);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalBudget = wishlists.reduce((sum, w) => sum + w.goal, 0);
  const totalSaved = wishlists.reduce((sum, w) => sum + w.currentSaved, 0);
  const suggestions = wishlists.map((w) => {
    const periods = w.plan === "daily" ? 30 : w.plan === "weekly" ? 12 : 3;
    const per = w.goal / periods;
    return { id: w._id, text: `${w.currency} ${per.toFixed(2)} / ${w.plan}`, name: w.name };
  });
  const preferenceTable = wishlists
    .flatMap((w) => (w.items || []).map((it) => ({ ...it, wishlistName: w.name, currency: w.currency })))
    .sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 } as any;
      return order[b.importance] - order[a.importance] || b.price - a.price;
    });

  if (isLoading) {
    return (
      <main className="min-h-dvh w-full bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white pb-32">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent" />
        <div className="absolute bottom-40 left-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        <h1 className={`${cherryBombOne.className} mb-8 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400`}>
          Budget & Payments
        </h1>

        {/* Overview Card */}
        <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] p-6 border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Goal</p>
              <p className="text-2xl font-bold text-white">₦ {totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Saved So Far</p>
              <p className="text-2xl font-bold text-green-400">₦ {totalSaved.toLocaleString()}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
             <div 
               className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
               style={{ width: `${totalBudget > 0 ? Math.min(100, (totalSaved / totalBudget) * 100) : 0}%` }}
             />
          </div>
        </div>

        {/* Suggested Payments */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Suggested Payments</h2>
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <p className="text-zinc-600 text-sm">No active wishlists to suggest payments for.</p>
            ) : (
              suggestions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#161618] border border-white/5">
                  <span className="text-sm font-medium text-white">{s.name}</span>
                  <span className="text-sm font-bold text-purple-400">{s.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table of Preference */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Table of Preference</h2>
          <div className="space-y-3">
            {preferenceTable.length === 0 ? (
              <p className="text-zinc-600 text-sm">No items added yet.</p>
            ) : (
              preferenceTable.map((it) => (
                <div key={it._id} className="flex items-center justify-between p-4 rounded-2xl bg-[#161618] border border-white/5">
                  <span className="text-sm font-medium text-white">{it.name} • {it.wishlistName}</span>
                  <span className="text-sm font-bold text-purple-400">{it.currency} {Number(it.price).toLocaleString()} • {it.importance}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Payment History</h2>
          <div className="space-y-3">
            {payments.length === 0 ? (
              <p className="text-zinc-600 text-sm">No payments yet.</p>
            ) : (
              payments.slice().reverse().map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#161618] border border-white/5">
                  <span className="text-sm font-medium text-white">{p.source === "external" ? "External" : "Self"} • {p.name || "You"}</span>
                  <span className="text-sm font-bold text-green-400">{Number(p.amount).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Payment Form */}
        <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
            Add Payment
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">Select Wishlist</label>
              <div className="relative">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="" className="bg-[#161618]">Select a goal...</option>
                  {wishlists.map((w) => (
                    <option key={w._id} value={w._id} className="bg-[#161618]">
                      {w.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">Amount</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="button"
              disabled={!selected || !amount || parseFloat(String(amount)) <= 0 || isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                    const res = await fetch(`${API_URL}/api/wishlist/payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ wishlistId: selected, amount: parseFloat(String(amount)) }),
                    });
                    if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setWishlists((prev) =>
                        prev.map((w) => (w._id === data?.wishlist?._id ? data.wishlist : w))
                    );
                    setAmount("");
                    }
                } catch(e) { console.error(e) } finally { setIsSubmitting(false); }
              }}
              className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-2"
            >
              {isSubmitting ? "Adding..." : "Add Payment"}
            </button>

            {selected && (
                <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-full rounded-xl border border-red-500/20 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                Delete Selected Wishlist
                </button>
            )}
          </div>
        </div>
      </div>
      {selected && showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-[2rem] bg-[#161618] p-6 border border-white/10 shadow-2xl">
            <div className="text-lg font-bold text-white mb-2">Delete Wishlist?</div>
            <p className="text-sm text-zinc-400 mb-4">This action will remove the wishlist permanently.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 bg白/5 px-4 py-3 text-sm text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const res = await fetch(`${API_URL}/api/wishlist/${selected}`, {
                      method: "DELETE",
                      credentials: "include",
                    });
                    if (res.ok) {
                      setWishlists((prev) => prev.filter((w) => w._id !== selected));
                      setSelected("");
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsSubmitting(false);
                    setShowConfirm(false);
                  }
                }}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

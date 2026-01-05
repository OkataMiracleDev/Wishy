"use client";
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

export default function BudgetPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/api/wishlist/list`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (data?.wishlists) setWishlists(data.wishlists);
    }
    load();
  }, []);

  const totalBudget = wishlists.reduce((sum, w) => sum + w.goal, 0);
  const suggestions = wishlists.map((w) => {
    const periods = w.plan === "daily" ? 30 : w.plan === "weekly" ? 12 : 3;
    const per = w.goal / periods;
    return { id: w._id, text: `${w.currency} ${per.toFixed(2)} per ${w.plan}` };
  });

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-8 sm:max-w-lg">
        <h1 className="mb-4 text-2xl font-semibold text-white">Budget</h1>
        <div className="rounded-2xl bg-white p-5 shadow-xl">
          <div className="text-sm">Total budget: {totalBudget.toLocaleString()}</div>
          <div className="mt-3 space-y-2">
            <div className="text-sm font-medium">Suggested payments</div>
            <ul className="text-sm">
              {suggestions.map((s) => (
                <li key={s.id}>{s.text}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Add payment</div>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            >
              <option value="">Select wishlist</option>
              {wishlists.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            />
            <button
              type="button"
              disabled={!selected || amount <= 0}
              onClick={async () => {
                const res = await fetch(`${API_URL}/api/wishlist/payment`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({ wishlistId: selected, amount }),
                });
                if (res.ok) {
                  const data = await res.json().catch(() => ({}));
                  setWishlists((prev) =>
                    prev.map((w) => (w._id === data?.wishlist?._id ? data.wishlist : w))
                  );
                  setAmount(0);
                }
              }}
              className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium ${
                !selected || amount <= 0 ? "bg-primary/60 text-white" : "bg-primary text-white"
              }`}
            >
              Save
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={async () => {
                const res = await fetch(`${API_URL}/api/wishlist/${selected}`, {
                  method: "DELETE",
                  credentials: "include",
                });
                if (res.ok) {
                  setWishlists((prev) => prev.filter((w) => w._id !== selected));
                  setSelected("");
                }
              }}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-red-500 px-4 py-3 text-sm font-medium text-red-600"
            >
              Delete wishlist
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

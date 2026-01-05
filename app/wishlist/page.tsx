"use client";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CURRENCIES = ["NGN", "USD", "EUR", "GBP"];

export default function WishlistPage() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [plan, setPlan] = useState<"daily" | "weekly" | "monthly" | null>(null);
  const [goal, setGoal] = useState<number>(0);
  const [importance, setImportance] = useState<"low" | "medium" | "high">("medium");

  const canSubmit = name.trim() && plan && goal > 0;

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-8 sm:max-w-lg">
        <h1 className="mb-4 text-2xl font-semibold text-white">Create wishlist</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            const res = await fetch(`${API_URL}/api/wishlist/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ name, currency, plan, goal, importance }),
            });
            if (res.ok) {
              window.location.href = "/home";
            }
          }}
          className="space-y-4 rounded-2xl bg-white p-5 shadow-xl"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-black">
              Wishlist name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Skateboard Rides Vista"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="goal" className="text-sm font-medium text-black">
              Goal amount
            </label>
            <input
              id="goal"
              type="number"
              inputMode="numeric"
              placeholder="0.00"
              value={goal}
              onChange={(e) => setGoal(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-black">Importance</span>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setImportance(lvl)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm ${
                    importance === lvl ? "border-primary" : "border-zinc-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-black">Savings plan</span>
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm ${
                    plan === p ? "border-primary" : "border-zinc-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium ${
              !canSubmit ? "bg-primary/60 text-white" : "bg-primary text-white"
            }`}
          >
            Done
          </button>
        </form>
      </div>
    </main>
  );
}

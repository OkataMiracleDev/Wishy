"use client";
import Link from "next/link";
import { useState } from "react";

export default function WishlistPage() {
  const [importance, setImportance] = useState<"low" | "medium" | "high" | null>(null);
  const [plan, setPlan] = useState<"daily" | "weekly" | "monthly" | null>(null);
  const [price, setPrice] = useState<number>(0);
  const periods = plan === "daily" ? 30 : plan === "weekly" ? 12 : plan === "monthly" ? 3 : 0;
  const suggested = periods > 0 && price > 0 ? price / periods : 0;
  const suggestedText = `₦${suggested.toFixed(2)} per ${plan ?? "period"}`;

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-8 sm:max-w-lg">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Let’s create your wishlist</h1>
          <div className="mt-3 flex gap-4 text-sm opacity-90">
            <span>Teams</span>
            <span className="font-medium">Collections</span>
            <span>My wish board</span>
          </div>
        </header>

        <section className="space-y-6">
          <form className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">
                Product image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 file:mr-4 file:rounded-md file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-background dark:border-zinc-800 dark:bg-black"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Product name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Nike Air Max"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-800 dark:bg-black"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price (₦)
              </label>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 items-center rounded-md bg-zinc-100 px-3 text-sm dark:bg-zinc-900">
                  ₦
                </span>
                <input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  placeholder="0.00"
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-800 dark:bg-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Importance</span>
              <div className="flex gap-2">
                <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${importance === "low" ? "border-green-500" : "border-zinc-200 dark:border-zinc-800"}`} onClick={() => setImportance("low")}>
                  <input type="radio" name="importance" className="sr-only" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  Low
                </label>
                <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${importance === "medium" ? "border-yellow-500" : "border-zinc-200 dark:border-zinc-800"}`} onClick={() => setImportance("medium")}>
                  <input type="radio" name="importance" className="sr-only" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  Medium
                </label>
                <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${importance === "high" ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"}`} onClick={() => setImportance("high")}>
                  <input type="radio" name="importance" className="sr-only" />
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  High
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Savings plan</span>
              <div className="flex gap-2">
                <label className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm ${plan === "daily" ? "border-primary" : "border-zinc-200 dark:border-zinc-800"}`} onClick={() => setPlan("daily")}>
                  <input type="radio" name="plan" className="sr-only" />
                  Daily
                </label>
                <label className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm ${plan === "weekly" ? "border-primary" : "border-zinc-200 dark:border-zinc-800"}`} onClick={() => setPlan("weekly")}>
                  <input type="radio" name="plan" className="sr-only" />
                  Weekly
                </label>
                <label className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm ${plan === "monthly" ? "border-primary" : "border-zinc-200 dark:border-zinc-800"}`} onClick={() => setPlan("monthly")}>
                  <input type="radio" name="plan" className="sr-only" />
                  Monthly
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Suggested amount</span>
              <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-black">
                {suggestedText}
              </div>
            </div>

            <button
              type="button"
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              Add to wishlist
            </button>
          </form>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Budget plan</h2>
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-black">
              Total items: 0 • Total budget: ₦0.00
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Collections</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-primary p-3 text-sm text-white shadow-md">
                <div className="aspect-square rounded-md bg-white/10" />
                <div className="mt-2 font-medium">Sample product</div>
                <div className="opacity-90">₦0.00</div>
                <button className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-xs font-medium text-foreground">
                  Add wish
                </button>
              </div>
              <div className="rounded-xl bg-primary p-3 text-sm text-white shadow-md">
                <div className="aspect-square rounded-md bg-white/10" />
                <div className="mt-2 font-medium">Sample product</div>
                <div className="opacity-90">₦0.00</div>
                <button className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-xs font-medium text-foreground">
                  Add wish
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Scale of preference</h2>
            <ol className="space-y-2 text-sm">
              <li className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black">
                1. Sample product (High)
              </li>
              <li className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black">
                2. Sample product (Medium)
              </li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}

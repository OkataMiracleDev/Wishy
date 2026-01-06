"use client";
import { useState } from "react";
import { cherryBombOne } from "@/lib/fonts";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CURRENCIES = ["NGN", "USD", "EUR", "GBP"];

export default function WishlistPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [plan, setPlan] = useState<"daily" | "weekly" | "monthly" | null>(null);
  const [importance, setImportance] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim() && plan && !isSubmitting;

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white pb-32">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-purple-900/10 to-transparent" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        <h1
          className={`${cherryBombOne.className} mb-8 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`}
        >
          Create Wishlist
        </h1>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setIsSubmitting(true);
            try {
              if (image && image.size > 5 * 1024 * 1024) {
                toast.error("Image must be 5MB or less");
                return;
              }
              const formData = new FormData();
              formData.append("name", name);
              formData.append("currency", currency);
              formData.append("plan", plan!);
              formData.append("importance", importance);
              if (image) {
                formData.append("image", image);
              }

              let res = await fetch(`/api/wishlist/create`, {
                method: "POST",
                credentials: "include",
                body: formData,
              }).catch(() => null as any);
              if (!res || !res.ok) {
                res = await fetch(`${API_URL}/api/wishlist/create`, {
                  method: "POST",
                  credentials: "include",
                  body: formData,
                });
              }
              if (res.ok) {
                router.push("/home");
                toast.success("Wishlist created!");
              } else {
                console.error("Failed to create wishlist");
                toast.error("Something went wrong. Please try again.");
              }
            } catch (e) {
              console.error(e);
              toast.error("Error creating wishlist.");
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="space-y-6 rounded-[2rem] bg-[#161618] p-8 border border-white/5 shadow-xl"
        >
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs font-medium text-zinc-400 ml-1"
            >
              Wishlist Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g Content Creation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 ml-1">
              Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f && f.size > 5 * 1024 * 1024) {
                  toast.error("Image must be 5MB or less");
                  return;
                }
                if (f) setImage(f);
              }}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 ml-1">
              Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full appearance-none rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-[#161618]">
                    {c}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-zinc-400 ml-1">
              Importance Level
            </span>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setImportance(lvl)}
                  className={`flex-1 rounded-xl border px-2 py-3 text-xs font-medium uppercase tracking-wider transition-all ${
                    importance === lvl
                      ? "border-purple-500 bg-purple-500/20 text-purple-400"
                      : "border-white/10 bg-black/20 text-zinc-500 hover:bg-white/5"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-zinc-400 ml-1">
              Savings Plan
            </span>
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`flex-1 rounded-xl border px-2 py-3 text-xs font-medium uppercase tracking-wider transition-all ${
                    plan === p
                      ? "border-purple-500 bg-purple-500/20 text-purple-400"
                      : "border-white/10 bg-black/20 text-zinc-500 hover:bg-white/5"
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
            className="w-full rounded-xl bg-white py-4 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-white/5"
          >
            {isSubmitting ? "Creating..." : "Create Wishlist"}
          </button>
        </form>
      </div>
    </main>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cherryBombOne } from "@/lib/fonts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignInPage() {
  const [step, setStep] = useState<"email" | "password" | "done">("email");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const imgSrc =
    step === "password"
      ? "/onboarding/password.png"
      : step === "done"
      ? "/onboarding/see-you-later.png"
      : "/onboarding/sign-in.png";

  return (
    <main className="relative min-h-dvh overflow-hidden w-full bg-background text-foreground">
      <div
        className={`${cherryBombOne.className} absolute left-4 top-4 text-xl`}
      >
        Wishy
      </div>
      <img
        src={imgSrc}
        alt=""
        className="pointer-events-none absolute -bottom-15 left-25 h-[380px] w-[380px] object-contain opacity-100 sm:h-[320px] sm:w-[320px]"
      />
      <div className="mx-auto flex flex-col min-h-dvh max-w-md items-center justify-center px-4 sm:max-w-lg">
        <header className="mb-4 flex flex-col justify-center items-center">
          <h1
            className={`${cherryBombOne.className} pb-10 text-center text-6xl`}
          >
            Welcome back
          </h1>
          <p className="mt-2 pb-2 text-center text-md opacity-90">
            Sign in to continue
          </p>
        </header>
        <div className="w-full rounded-2xl bg-white/95 mb-30 p-5 text-foreground shadow-xl backdrop-blur">
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm text-black font-medium"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white text-black px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)}
                  onClick={() => setStep("password")}
                  className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium ${
                    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
                      ? "bg-primary/60 text-white cursor-not-allowed"
                      : "bg-primary text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm text-black font-medium"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border text-black border-zinc-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-zinc-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="inline-flex flex-1 items-center text-black justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={password.length < 1}
                  onClick={async () => {
                    const res = await fetch(`${API_URL}/api/auth/signin`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        email,
                        password,
                      }),
                    });
                    if (res.ok) {
                      setStep("done");
                      setTimeout(() => (window.location.href = "/home"), 1200);
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium ${
                    password.length < 1
                      ? "bg-primary/60 text-white cursor-not-allowed"
                      : "bg-primary text-white"
                  }`}
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold">All set</h2>
              <p className="text-sm text-zinc-600">You will be redirected.</p>
              <Link
                href="/home"
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white"
              >
                Continue
              </Link>
            </div>
          )}
          <p className="mt-4 text-center text-sm text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

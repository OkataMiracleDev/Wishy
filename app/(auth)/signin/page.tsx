"use client";
import Link from "next/link";
import { useState } from "react";
import { cherryBombOne } from "@/lib/fonts";
import Image from "next/image";
import Loader from "@/components/Loader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignInPage() {
  const [step, setStep] = useState<"email" | "password" | "done">("email");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const imgSrc =
    step === "password"
      ? "/onboarding/password.png"
      : step === "done"
      ? "/onboarding/see-you-later.png"
      : "/onboarding/sign-in.png";

  const handleEmailNext = async () => {
    setEmailError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.exists) {
        setStep("password");
      } else {
        setEmailError("Account not found. Please sign up.");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        setStep("done");
        setTimeout(() => (window.location.href = "/home"), 1500);
      } else {
        alert("Invalid credentials");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full bg-white text-black overflow-hidden md:flex-row flex-col">
      <div className="hidden md:flex w-1/2 bg-[#8B5CF6] flex-col items-center justify-center relative p-12 text-white overflow-hidden">
        <div className="absolute top-8 left-8">
          <h1 className={`${cherryBombOne.className} text-3xl`}>Wishy</h1>
        </div>
        <div className="relative w-full max-w-lg aspect-square -mb-14 ">
          <Image
            src={imgSrc}
            alt="Onboarding"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-center z-10 max-w-md">
          <h2 className={`${cherryBombOne.className} text-4xl mb-4`}>
            {step === "email" && "Welcome Back!"}
            {step === "password" && "Secure Login"}
            {step === "done" && "You're In!"}
          </h2>
          <p className="text-lg text-white/90">
            {step === "email" && "We missed you. Let's get you back in."}
            {step === "password" && "Enter your secret key."}
            {step === "done" && "Redirecting you to your wishes..."}
          </p>
        </div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative bg-white min-h-dvh">
        <div className="md:hidden absolute top-6 left-6">
          <h1 className={`${cherryBombOne.className} text-2xl text-[#8B5CF6]`}>
            Wishy
          </h1>
        </div>
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader />
          </div>
        )}
        <div className="w-full max-w-md space-y-8 z-10">
          <div className="text-center md:text-left">
            <h2
              className={`${cherryBombOne.className} text-4xl mb-2 text-black`}
            >
              {step === "email"
                ? "Sign In"
                : step === "password"
                ? "Password"
                : "All Set!"}
            </h2>
            <p className="text-zinc-500">
              {step === "email"
                ? "Enter your email to continue"
                : step === "password"
                ? `Welcome back, ${email}`
                : "Redirecting to home..."}
            </p>
          </div>
          {step === "email" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                    handleEmailNext()
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-black placeholder:text-zinc-400 outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
                {emailError && (
                  <p className="text-red-500 text-xs ml-1">{emailError}</p>
                )}
              </div>
              <button
                type="button"
                disabled={
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isLoading
                }
                onClick={handleEmailNext}
                className="w-full rounded-2xl bg-[#8B5CF6] py-4 text-white font-semibold shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7c4dff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <p className="text-center text-sm text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#8B5CF6] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          )}
          {step === "password" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && password.length > 0 && handleSignIn()
                    }
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 pr-12 text-black outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 font-semibold text-black hover:bg-zinc-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={password.length < 1 || isLoading}
                  onClick={handleSignIn}
                  className="flex-1 rounded-2xl bg-[#8B5CF6] py-4 text-white font-semibold shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7c4dff] disabled:opacity-50"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
                ✓
              </div>
              <p className="text-zinc-600">Redirecting you to home...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

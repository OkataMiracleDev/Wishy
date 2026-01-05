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
    <main className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground md:flex">
      {/* Brand Logo */}
      <div
        className={`${cherryBombOne.className} absolute left-4 top-4 text-xl z-50 text-white md:text-black`}
      >
        Wishy
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader />
        </div>
      )}

      {/* Left Side: Illustration (Visible on md+) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-[#5c477d] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="relative z-10 p-10 text-center">
          <Image
            src={imgSrc}
            alt="Illustration"
            width={500}
            height={500}
            className="object-contain mx-auto drop-shadow-2xl transition-all duration-500"
            priority
          />
          <h2
            className={`${cherryBombOne.className} text-4xl text-white mt-8 drop-shadow-md`}
          >
            {step === "email"
              ? "Welcome Back!"
              : step === "password"
              ? "Secure Login"
              : "You're In!"}
          </h2>
          <p className="text-white/80 mt-2 text-lg">
            {step === "email"
              ? "We missed you. Let's get you back in."
              : step === "password"
              ? "Enter your secret key."
              : "Redirecting you to your wishes..."}
          </p>
        </div>
      </div>

      {/* Right Side: Form (Full width on mobile, split on md+) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile Background Image (Absolute) */}
        <div className="md:hidden absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
          <Image
            src={imgSrc}
            alt="Illustration"
            width={300}
            height={300}
            className="object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-md z-10">
          <header className="mb-8 text-center md:text-left">
            <h1
              className={`${cherryBombOne.className} text-5xl md:text-6xl text-primary md:text-black mb-2`}
            >
              {step === "email"
                ? "Sign In"
                : step === "password"
                ? "Password"
                : "Success"}
            </h1>
            <p className="text-muted-foreground md:text-lg">
              {step === "email"
                ? "Enter your email to continue"
                : step === "password"
                ? `Welcome back, ${email}`
                : "You are now logged in"}
            </p>
          </header>

          <div className="bg-white/80 md:bg-white backdrop-blur-md md:backdrop-blur-none rounded-3xl p-6 shadow-xl md:shadow-none border border-white/50 md:border-none">
            {step === "email" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-black ml-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                      handleEmailNext()
                    }
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-black placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                  className="w-full rounded-2xl bg-primary py-4 text-white font-bold text-lg shadow-lg hover:bg-primary/90 hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {step === "password" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-black ml-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        password.length > 0 &&
                        handleSignIn()
                      }
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 pr-12 text-black placeholder:text-zinc-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 text-black font-semibold hover:bg-zinc-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={password.length < 1 || isLoading}
                    onClick={handleSignIn}
                    className="flex-[2] rounded-2xl bg-primary py-4 text-white font-bold text-lg shadow-lg hover:bg-primary/90 hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {step === "done" && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-black">All Set!</h2>
                <p className="text-zinc-500">Redirecting you to home...</p>
              </div>
            )}

            <p className="mt-8 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cherryBombOne } from "@/lib/fonts";
import { DIAL_CODES } from "@/lib/dialCodes";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignUpPage() {
  const [step, setStep] = useState<"email" | "verify" | "password" | "done">(
    "email"
  );
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCca2, setSelectedCca2] = useState<string>("NG");
  const [dialCodes, setDialCodes] = useState<string[]>(
    Array.from(new Set(DIAL_CODES)).sort((a, b) => a.localeCompare(b))
  );
  const [selectedDial, setSelectedDial] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [fullname, setFullname] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>/\\]/.test(password)) score += 1;
    return score;
  }, [password]);

  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(
    null
  );
  const [nicknameChecking, setNicknameChecking] = useState<boolean>(false);
  const router = useRouter();

  const imgSrc = useMemo(() => {
    switch (step) {
      case "password":
        return "/onboarding/password.png";
      case "done":
        return "/onboarding/see-you-later.png";
      case "verify":
        return "/onboarding/sign-in.png";
      default:
        return "/onboarding/welcome.png";
    }
  }, [step]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,idd,currencies"
        );
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();

        let userCountryCode = null;
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            userCountryCode = ipData?.country_code;
          }
        } catch {}

        const countryEntries = data
          .map((c: any) => {
            const root = c.idd?.root ?? "";
            const suffixes = Array.isArray(c.idd?.suffixes)
              ? c.idd.suffixes
              : [];
            const dials = suffixes.length
              ? suffixes.map((s: string) => `${root}${s}`.replace(/\s/g, ""))
              : root
              ? [root]
              : [];
            return {
              name: c.name?.common ?? c.cca3,
              cca2: c.cca2,
              dial: dials[0] ?? "",
              dials,
            };
          })
          .filter((c: any) => c.cca2);

        const sorted = countryEntries.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );

        if (!cancelled) {
          setCountries(sorted);
          if (userCountryCode) {
            const found = sorted.find((c: any) => c.cca2 === userCountryCode);
            if (found && found.dial) setSelectedDial(found.dial);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      let res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          fullname,
          phoneNumber,
          nickname,
          password,
          countryCode: selectedCca2,
        }),
      }).catch(() => null as any);
      if (!res || !res.ok) {
        res = await fetch(`${API_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email,
            fullname,
            phoneNumber,
            nickname,
            password,
            countryCode: selectedCca2,
          }),
        });
      }
      const data = await res.json();
      if (res.ok) {
        setStep("done");
        setTimeout(() => router.push("/home"), 1500);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full bg-white text-black overflow-hidden md:flex-row flex-col">
      {/* Left Panel - Illustration */}
      <div className="hidden md:flex w-1/2 bg-[#8B5CF6] flex-col items-center justify-center relative p-12 text-white overflow-hidden">
        <div className="absolute top-8 left-8">
          <h1 className={`${cherryBombOne.className} text-3xl`}>Wishy</h1>
        </div>
        <div className="relative w-full max-w-lg aspect-square mb-8">
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
            {step === "email" && "Join the fun!"}
            {step === "verify" && "Almost there!"}
            {step === "password" && "Secure your account"}
            {step === "done" && "Welcome aboard!"}
          </h2>
          <p className="text-lg text-white/90">
            {step === "email" &&
              "Create an account to start wishing and sharing moments with friends."}
            {step === "verify" &&
              "We just need a few more details to get you set up properly."}
            {step === "password" &&
              "Choose a strong password to keep your wishes safe."}
            {step === "done" &&
              "Your account has been created successfully. Redirecting you..."}
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Panel - Form */}
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
                ? "Create Account"
                : step === "verify"
                ? "Verify & Profile"
                : step === "password"
                ? "Set Password"
                : "All Set!"}
            </h2>
            <p className="text-zinc-500">
              {step === "email"
                ? "Enter your email to get started"
                : step === "verify"
                ? `We sent a code to ${email}`
                : step === "password"
                ? "Choose a unique nickname and password"
                : "Redirecting to login..."}
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
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-black placeholder:text-zinc-400 outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                />
              </div>
              <button
                disabled={
                  !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || isSendingOtp
                }
                onClick={async () => {
                  setIsSendingOtp(true);
                  try {
                    let res = await fetch(`/api/otp/send`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ email }),
                    }).catch(() => null as any);
                    if (!res || !res.ok) {
                      res = await fetch(`${API_URL}/api/otp/send`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ email }),
                      });
                    }
                    const data = await res.json().catch(() => ({}));
                    if (res.ok || data.ok) {
                      setOtpSent(true);
                      setStep("verify");
                      toast.success("OTP sent!");
                    } else {
                      toast.error("Failed to send OTP.");
                    }
                  } catch {
                    toast.error("Error sending OTP");
                  } finally {
                    setIsSendingOtp(false);
                  }
                }}
                className="w-full rounded-2xl bg-[#8B5CF6] py-4 text-white font-semibold shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7c4dff] transition-all disabled:opacity-50"
              >
                {isSendingOtp ? "Sending..." : "Continue"}
              </button>
              <p className="text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-[#8B5CF6] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <button
                    onClick={async () => {
                      setIsSendingOtp(true);
                      try {
                        let res = await fetch(`/api/otp/send`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ email }),
                        }).catch(() => null as any);
                        if (!res || !res.ok) {
                          res = await fetch(`${API_URL}/api/otp/send`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ email }),
                          });
                        }
                        const data = await res.json().catch(() => ({}));
                        if (res.ok || data.ok) {
                          setOtpSent(true);
                          toast.success("OTP resent!");
                        } else {
                          toast.error("Failed to resend OTP.");
                        }
                      } catch {
                        toast.error("Error resending OTP");
                      } finally {
                        setIsSendingOtp(false);
                      }
                    }}
                    className="text-xs font-medium text-[#8B5CF6] hover:underline"
                  >
                    Resend Code
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-black text-center text-lg tracking-widest outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-black outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedDial}
                    onChange={(e) => setSelectedDial(e.target.value)}
                    className="w-28 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-4 text-black outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                  >
                    <option value="" disabled>
                      Code
                    </option>
                    {countries.length > 0 &&
                    countries.some((c) => c.dials?.length)
                      ? countries.flatMap((c) =>
                          (c.dials || []).map((d: any) => (
                            <option key={`${c.cca2}-${d}`} value={d}>
                              {d} {c.cca2}
                            </option>
                          ))
                        )
                      : dialCodes.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="000 000 0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-black outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 font-semibold text-black hover:bg-zinc-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={
                    otp.length !== 6 ||
                    !selectedDial ||
                    phoneNumber.length < 5 ||
                    !fullname
                  }
                  onClick={async () => {
                    let res = await fetch(`/api/otp/verify`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ email, otp }),
                    }).catch(() => null as any);
                    if (!res || !res.ok) {
                      res = await fetch(`${API_URL}/api/otp/verify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ email, otp }),
                      });
                    }
                    if (res.ok) setStep("password");
                    else toast.error("Invalid OTP");
                  }}
                  className="flex-1 rounded-2xl bg-[#8B5CF6] py-4 text-white font-semibold shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7c4dff] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nickname
                </label>
                <input
                  type="text"
                  placeholder="unique_user"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value.replace(/\s/g, ""));
                    setNicknameAvailable(null);
                  }}
                  onBlur={async () => {
                    if (!nickname) return;
                    setNicknameChecking(true);
                    try {
                      let res = await fetch(`/api/auth/check-nickname`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ nickname }),
                      }).catch(() => null as any);
                      if (!res || !res.ok) {
                        res = await fetch(`${API_URL}/api/auth/check-nickname`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ nickname }),
                        });
                      }
                      const data = await res.json();
                      setNicknameAvailable(data.available);
                    } catch {
                      setNicknameAvailable(null);
                    } finally {
                      setNicknameChecking(false);
                    }
                  }}
                  className={`w-full rounded-2xl border bg-zinc-50 px-5 py-4 text-black outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 ${
                    nicknameAvailable === true
                      ? "border-green-500"
                      : nicknameAvailable === false
                      ? "border-red-500"
                      : "border-zinc-200"
                  }`}
                />
                <div className="text-xs h-4">
                  {nicknameChecking ? (
                    <span className="text-zinc-500">Checking...</span>
                  ) : nicknameAvailable === false ? (
                    <span className="text-red-500">Unavailable</span>
                  ) : nicknameAvailable === true ? (
                    <span className="text-green-500">Available</span>
                  ) : null}
                </div>
              </div>
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
                <div className="flex gap-1 mt-2">
                  {[1, 2].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength >= level
                          ? "bg-green-500"
                          : "bg-zinc-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={!password || !nickname || nicknameAvailable === false}
                className="w-full rounded-2xl bg-[#8B5CF6] py-4 text-white font-semibold shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7c4dff] disabled:opacity-50"
              >
                Create Account
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
                ✓
              </div>
              <p className="text-zinc-600">
                You're all set! Redirecting you to sign in...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

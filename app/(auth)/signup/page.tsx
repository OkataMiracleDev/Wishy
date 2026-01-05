"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cherryBombOne } from "@/lib/fonts";
import { DIAL_CODES } from "@/lib/dialCodes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SignUpPage() {
  const [step, setStep] = useState<"email" | "verify" | "password" | "done">(
    "email"
  );
  const [countries, setCountries] = useState<
    Array<{
      name: string;
      cca2: string;
      cca3: string;
      dial: string;
      dials: string[];
      currency?: string;
    }>
  >([]);
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
  const [emailSentViaProvider, setEmailSentViaProvider] = useState<
    boolean | null
  >(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [fullname, setFullname] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    return score; // 0=weak, 1=medium, 2=strong
  }, [password]);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(
    null
  );
  const [nicknameChecking, setNicknameChecking] = useState<boolean>(false);
  const router = useRouter();
  const imgSrc =
    step === "password"
      ? "/onboarding/password.png"
      : step === "done"
      ? "/onboarding/see-you-later.png"
      : step === "email"
      ? "/onboarding/welcome.png"
      : "/onboarding/sign-in.png";
  const layoutByStep: Record<
    "email" | "phone" | "profile" | "password" | "done",
    string
  > = {
    email:
      "absolute z-100 -bottom-42 left-10 h-[500px] w-[500px] sm:h-[320px] sm:w-[320px]",
    phone:
      "absolute z-100 -bottom-42 left-10 h-[500px] w-[500px] sm:h-[320px] sm:w-[320px]",
    profile:
      "absolute z-100 -bottom-42 left-10 h-[500px] w-[500px] sm:h-[320px] sm:w-[320px]",
    password:
      "absolute z-100 -bottom-42 left-10 h-[500px] w-[500px] sm:h-[320px] sm:w-[320px]",
    done: "absolute z-100 -bottom-42 left-10 h-[500px] w-[500px] sm:h-[320px] sm:w-[320px]",
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch countries with specific fields to avoid 400/timeout on large payload
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,idd,currencies"
        );
        if (!res.ok) throw new Error("Failed to fetch countries");

        const data = await res.json();
        if (!Array.isArray(data))
          throw new Error("Invalid country data format");

        // Fetch user's IP info to guess location
        // Using ipapi.co (free tier has limits) - fallback to ip-api.com if needed
        let userCountryCode = null;
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            userCountryCode = ipData?.country_code;
          }
        } catch (e) {
          console.warn("IP geolocation failed:", e);
        }

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
            const currency = Array.isArray(Object.keys(c.currencies ?? {}))
              ? Object.keys(c.currencies ?? {})[0]
              : undefined;
            return {
              name: c.name?.common ?? c.cca3,
              cca2: c.cca2,
              cca3: c.cca3,
              dial: dials[0] ?? "",
              dials,
              currency,
            };
          })
          .filter((c: any) => c.cca2 && c.cca3);
        const sorted = countryEntries.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );

        if (!cancelled) {
          setCountries(sorted);
          if (userCountryCode) {
            const found = sorted.find((c: any) => c.cca2 === userCountryCode);
            if (found && found.dial) {
              setSelectedDial(found.dial);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load countries", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const flagEmoji = useMemo(() => {
    if (!selectedCca2) return "🏳️";
    const codePoints = selectedCca2
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }, [selectedCca2]);

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <div
        className={`${cherryBombOne.className} absolute left-4 top-4 text-xl`}
      >
        Wishy
      </div>
      {(step === "email" || step === "done") && (
        <div
          className={`pointer-events-none ${
            layoutByStep[step as "email" | "done"]
          }`}
        >
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 640px) 320px, 500px"
            priority
          />
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl bg-white/90 px-5 py-3 text-sm text-foreground">
            Setting up your account...
          </div>
        </div>
      )}
      <div className="mx-auto pb-12 flex min-h-dvh max-w-md flex-col items-center justify-center px-4 sm:max-w-lg">
        <h1
          className={`${cherryBombOne.className} mb-2 text-center text-6xl text-white sm:text-6xl`}
        >
          {step === "email" ? "What's your" : "Create"}
        </h1>
        <h1
          className={`${cherryBombOne.className} mb-6 text-center text-6xl text-white sm:text-6xl`}
        >
          {step === "email" ? "email?" : "account"}
        </h1>
        <p className="mb-6 text-center text-sm text-white/90">
          {step === "email"
            ? "Onboarding • Step 1 of 3"
            : step === "verify"
            ? "Onboarding • Step 2 of 3"
            : step === "password"
            ? "Onboarding • Step 3 of 3"
            : "Onboarding complete"}
        </p>
        <div className="w-full rounded-2xl bg-white/95 p-5 text-foreground shadow-xl backdrop-blur">
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
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-black/60 outline-none ring-0 focus:border-zinc-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || isSendingOtp
                  }
                  onClick={async () => {
                    console.log("[Signup] Sending OTP to:", email);
                    setIsSendingOtp(true);
                    try {
                      const res = await fetch(`${API_URL}/api/otp/send`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ email }),
                      });
                      const data = await res.json().catch(() => ({}));
                      console.log("[Signup] Send OTP response data:", data);
                      setIsSendingOtp(false);
                      if (res.ok) {
                        setEmailSentViaProvider(Boolean(data?.email_sent));
                        setOtpSent(true);
                        setStep("verify");
                      } else {
                        console.error("[Signup] Send OTP failed:", data);
                      }
                    } catch (error) {
                      console.error("[Signup] Error calling send-otp:", error);
                      setIsSendingOtp(false);
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium ${
                    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || isSendingOtp
                      ? "bg-primary/60 text-white cursor-not-allowed"
                      : "bg-primary text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="otp"
                    className="text-sm text-black font-medium"
                  >
                    Enter code
                  </label>
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={async () => {
                      setIsSendingOtp(true);
                      const res = await fetch(`${API_URL}/api/otp/send`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ email }),
                      });
                      setIsSendingOtp(false);
                      if (res.ok) {
                        const data = await res.json().catch(() => ({}));
                        setEmailSentViaProvider(Boolean(data?.email_sent));
                        setOtpSent(true);
                      }
                    }}
                    className={`text-sm text-black underline ${
                      isSendingOtp
                        ? "opacity-60 text-gray-700 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Resend code
                  </button>
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-black/60 outline-none ring-0 focus:border-zinc-400"
                />
                <div className="text-xs text-zinc-600">
                  {otpSent ? `Code sent to ${email}` : ""}
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="fullname"
                  className="text-sm text-black font-medium"
                >
                  Full name
                </label>
                <input
                  id="fullname"
                  type="text"
                  placeholder="Your full name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-black/60 outline-none ring-0 focus:border-zinc-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-black font-medium">
                  Phone number
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedDial}
                    onChange={(e) => setSelectedDial(e.target.value)}
                    className="relative z-20 w-32 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black"
                  >
                    <option value="" disabled>
                      Select code
                    </option>
                    {countries.length > 0 &&
                    countries.some((c) => c.dials?.length)
                      ? countries.flatMap((c) =>
                          (c.dials || []).map((d) => (
                            <option key={`${c.cca3}-${d}`} value={d}>
                              {d} {c.name}
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
                    inputMode="tel"
                    placeholder="000 000 0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-black/60 outline-none ring-0 focus:border-zinc-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-black"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={
                    otp.length !== 6 ||
                    !selectedDial ||
                    phoneNumber.trim().length < 5 ||
                    !fullname.trim()
                  }
                  onClick={async () => {
                    const res = await fetch(`${API_URL}/api/otp/verify`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ email, otp }),
                    });
                    if (res.ok) setStep("password");
                  }}
                  className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium ${
                    otp.length !== 6 ||
                    !selectedDial ||
                    phoneNumber.trim().length < 5 ||
                    !fullname.trim()
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
                  htmlFor="nickname"
                  className="text-sm text-black font-medium"
                >
                  Nickname
                </label>
                <input
                  id="nickname"
                  type="text"
                  placeholder="Unique nickname"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value.replace(/\s/g, ""));
                    setNicknameAvailable(null);
                  }}
                  onBlur={async () => {
                    const valid = /^[A-Za-z0-9_]+$/.test(nickname);
                    if (!valid || !nickname.trim()) {
                      setNicknameAvailable(false);
                      return;
                    }
                    setNicknameChecking(true);
                    try {
                      const res = await fetch(
                        `${API_URL}/api/auth/check-nickname`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({ nickname }),
                        }
                      );
                      const data = await res.json();
                      setNicknameAvailable(Boolean(data?.available));
                    } catch {
                      setNicknameAvailable(null);
                    } finally {
                      setNicknameChecking(false);
                    }
                  }}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-black/60 outline-none ring-0 focus:border-zinc-400"
                />
                <div className="text-xs text-black">
                  {nicknameChecking
                    ? "Checking availability..."
                    : nicknameAvailable === false
                    ? "Nickname not available or invalid"
                    : nicknameAvailable === true
                    ? "Nickname available"
                    : ""}
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm text-black font-medium"
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
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black placeholder:text-black/60 outline-none ring-0 focus:border-zinc-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black"
                  >
                    {showPassword ? (
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
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    ) : (
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
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="flex gap-1 pt-1">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length > 0
                        ? passwordStrength >= 1
                          ? "bg-yellow-400"
                          : "bg-red-400"
                        : "bg-zinc-200"
                    }`}
                  ></div>
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength >= 2 ? "bg-green-500" : "bg-zinc-200"
                    }`}
                  ></div>
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between">
                  <span>Min 8 chars</span>
                  <span>1 special char</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("verify")}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-black"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={
                    passwordStrength < 2 ||
                    !nickname.trim() ||
                    !/^[A-Za-z0-9_]+$/.test(nickname) ||
                    nicknameAvailable === false
                  }
                  onClick={async () => {
                    const res = await fetch(`${API_URL}/api/auth/signup`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        email,
                        password,
                        fullname,
                        nickname,
                        phoneNumber,
                        countryCode: selectedCca2,
                      }),
                    });
                    if (res.ok) {
                      setStep("done");
                      setIsLoading(true);
                      setTimeout(() => router.push("/home"), 1200);
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium ${
                    passwordStrength < 2 ||
                    !nickname.trim() ||
                    !/^[A-Za-z0-9_]+$/.test(nickname) ||
                    nicknameAvailable === false
                      ? "bg-primary/60 text-white cursor-not-allowed"
                      : "bg-primary text-white"
                  }`}
                >
                  Create account
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
          <p className="mt-4 text-center text-sm text-black">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

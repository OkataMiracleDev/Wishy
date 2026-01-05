"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cherryBombOne } from "@/lib/fonts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const isDirty =
    (user?.accountNumber || "") !== accountNumber ||
    (user?.accountName || "") !== accountName ||
    (user?.bankName || "") !== bankName ||
    (user?.thankYouMessage || "") !== thankYouMessage;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/profile/me`, { credentials: "include" });
        if (!res.ok) {
           if (res.status === 401) {
             router.push("/signin");
             return;
           }
           throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          setAccountNumber(data.user.accountNumber || "");
          setAccountName(data.user.accountName || "");
          setBankName(data.user.bankName || "");
          setThankYouMessage(data.user.thankYouMessage || "");
        } else {
           // No user data found, maybe redirect?
           router.push("/signin");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          accountNumber,
          accountName,
          bankName,
          thankYouMessage,
        }),
      });
      setUser((prev: any) => ({
        ...(prev || {}),
        accountNumber,
        accountName,
        bankName,
        thankYouMessage,
      }));
    } catch (e) {
      console.error("Failed to save", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/share`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (data?.shareUrl) {
        setShareUrl(data.shareUrl);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(data.shareUrl);
          } else {
            const el = document.createElement("textarea");
            el.value = data.shareUrl;
            el.style.position = "fixed";
            el.style.opacity = "0";
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
          }
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch {
          setCopySuccess(false);
        }
      }
    } catch (e) {
      console.error("Failed to share", e);
    }
  };

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
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        <h1 className={`${cherryBombOne.className} mb-8 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`}>
          Profile
        </h1>

        {/* User Info Card */}
        <div className="mb-6 rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
               <div className="h-full w-full rounded-full bg-[#161618] flex items-center justify-center text-2xl font-bold">
                 {user?.fullname?.charAt(0) || "U"}
               </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.fullname}</h2>
              <p className="text-sm text-purple-400">@{user?.nickname}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="p-2 rounded-full bg-zinc-800 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Email</p>
                <p className="text-sm text-white truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="p-2 rounded-full bg-zinc-800 text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Phone</p>
                <p className="text-sm text-white">
                  {user?.countryCode ? `(${user.countryCode}) ` : ""}{user?.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Form */}
        <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            Bank Details
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. Access Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">Account Number</label>
              <input
                type="text"
                placeholder="0000000000"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">Account Name</label>
              <input
                type="text"
                placeholder="Account Holder Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-zinc-400 ml-1">Thank You Message</label>
              <textarea
                placeholder="Message for your supporters..."
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors min-h-[80px]"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="flex-1 rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 border border-purple-500/20 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Share your Profile</h3>
          <p className="text-sm text-zinc-400 mb-4">Let people find your wishlists and support you.</p>
          
          <button
            type="button"
            onClick={handleShare}
            className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
          >
            {copySuccess ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Copied to Clipboard!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                Generate & Copy Link
              </>
            )}
          </button>
          {shareUrl && (
            <p className="mt-3 text-xs text-zinc-500 break-all bg-black/30 p-2 rounded-lg border border-white/5">
              {shareUrl}
            </p>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={async () => {
              await fetch(`${API_URL}/api/auth/signout`, { method: "POST", credentials: "include" });
              router.push("/signin");
            }}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}

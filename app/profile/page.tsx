"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/api/profile/me`, { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (data?.user) {
        setUser(data.user);
        setAccountNumber(data.user.accountNumber || "");
        setAccountName(data.user.accountName || "");
        setBankName(data.user.bankName || "");
        setThankYouMessage(data.user.thankYouMessage || "");
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-8 sm:max-w-lg">
        <h1 className="mb-4 text-2xl font-semibold text-white">Profile</h1>
        <div className="rounded-2xl bg-white p-5 shadow-xl">
          {user && (
            <div className="space-y-1 text-sm">
              <div>Name: {user.fullname}</div>
              <div>Nickname: {user.nickname}</div>
              <div>Email: {user.email}</div>
              <div>Phone: {user.phoneNumber}</div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div className="text-sm font-medium">Account details</div>
            <input
              type="text"
              placeholder="Account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            />
            <input
              type="text"
              placeholder="Account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            />
            <input
              type="text"
              placeholder="Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            />
            <div className="text-sm font-medium">Thank you message</div>
            <textarea
              placeholder="Write a thank you message"
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
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
                }}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch(`${API_URL}/api/profile/share`, {
                    method: "POST",
                    credentials: "include",
                  });
                  const data = await res.json().catch(() => ({}));
                  if (data?.shareUrl) {
                    setShareUrl(data.shareUrl);
                    try {
                      await navigator.clipboard.writeText(data.shareUrl);
                    } catch {}
                  }
                }}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-primary px-4 py-3 text-sm font-medium text-primary"
              >
                Share profile
              </button>
            </div>
            {shareUrl && <div className="text-xs text-zinc-600">Copied: {shareUrl}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}

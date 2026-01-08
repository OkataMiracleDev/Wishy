"use client";
import { useEffect, useState } from "react";
import { cherryBombOne } from "@/lib/fonts";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [account, setAccount] = useState<{ accountNumber?: string; accountName?: string; bankName?: string }>({});
  const [withdrawAmt, setWithdrawAmt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        let me = await fetch(`/api/profile/me`, { credentials: "include" }).catch(() => null as any);
        if (!me || !me.ok) {
          me = await fetch(`${API_URL}/api/profile/me`, { credentials: "include" });
        }
        const mdata = await me.json().catch(() => ({}));
        setAccount({ accountNumber: mdata?.user?.accountNumber, accountName: mdata?.user?.accountName, bankName: mdata?.user?.bankName });
        let res = await fetch(`/api/profile/wallet`, { credentials: "include" }).catch(() => null as any);
        if (!res || !res.ok) {
          res = await fetch(`${API_URL}/api/profile/wallet`, { credentials: "include" });
        }
        const data = await res.json().catch(() => ({}));
        setBalance(Number(data?.balance || 0));
        setTransactions(data?.transactions || []);
      } catch {}
      setIsLoading(false);
    }
    load();
  }, []);

  const withdraw = async () => {
    const amt = parseFloat(String(withdrawAmt || 0));
    if (!amt || amt <= 0) return;
    setIsSubmitting(true);
    try {
      if (!account.accountNumber || !account.bankName || !account.accountName) {
        toast.error("Add your bank details in Profile first");
        return;
      }
      const key = `wd-${Date.now()}`;
      let res = await fetch(`/api/profile/wallet/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: amt, idempotencyKey: key }),
      }).catch(() => null as any);
      if (!res || !res.ok) {
        res = await fetch(`${API_URL}/api/profile/wallet/withdraw`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ amount: amt, idempotencyKey: key }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setBalance(Number(data?.balance || balance - amt));
        setWithdrawAmt("");
        toast.success("Withdrawal requested");
      } else {
        toast.error(data?.error || "Withdrawal failed");
      }
    } catch {} finally {
      setIsSubmitting(false);
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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/10 to-transparent" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[80px]" />
      </div>
      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        <h1 className={`${cherryBombOne.className} mb-8 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`}>
          Wallet
        </h1>
        <div className="rounded-xl border border-white/10 bg-[#101011] p-4 mb-6">
          <div className="text-xs text-zinc-400">
            Deposits credit 98% after a 2% fee. Withdrawals pay out amount minus a 1% fee. Fees are shown per transaction.
          </div>
        </div>
        <div className="mb-8 rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
          <div className="text-sm text-zinc-400">Current Balance</div>
          <div className="text-3xl font-bold text-white mt-2">₦ {Number(balance).toLocaleString()}</div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 ml-1">Withdraw Amount</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0.00"
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(e.target.value)}
                className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                disabled={isSubmitting || !withdrawAmt}
                onClick={withdraw}
                className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Withdraw to Bank"}
              </button>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] bg-[#161618] p-6 border border-white/5 shadow-xl">
          <div className="mb-4 text-sm text-zinc-400">Wallet Transactions</div>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#101011] p-4 text-center text-zinc-500">
                No transactions yet.
              </div>
            ) : (
              transactions.slice().reverse().map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#101011] border border-white/10">
                  <span className="text-sm font-medium text-white">
                    {t.type} • {t.status}
                    {typeof t?.meta?.fee === "number" ? ` • fee ₦${Number(t.meta.fee).toLocaleString()}` : ""}
                  </span>
                  <span className={`text-sm font-bold ${t.type === "deposit" ? "text-green-400" : "text-red-400"}`}>{Number(t.amount).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

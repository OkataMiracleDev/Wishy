"use client";

export default function ThanksPage({ params }: { params: { token: string } }) {
  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="rounded-2xl bg-[#161618] p-8 border border-white/5 shadow-xl text-center max-w-md">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-xl font-bold mb-2">Thank you</h1>
        <p className="text-sm text-zinc-400">
          Your contribution was recorded. The account owner appreciates your support.
        </p>
      </div>
    </main>
  );
}

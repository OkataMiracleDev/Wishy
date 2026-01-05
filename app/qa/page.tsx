"use client";
import { useState } from "react";
import { cherryBombOne } from "@/lib/fonts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer(null);
    try {
      let res = await fetch(`/api/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      }).catch(() => null as any);
      if (!res || !res.ok) {
        res = await fetch(`${API_URL}/api/ai/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
      }
      const data = await res.json().catch(() => ({} as any));
      const offline = [
        "Here’s a practical approach:",
        "- Clarify the goal and timeline.",
        "- Estimate total cost and monthly capacity.",
        "- Allocate a fixed amount per pay cycle and track progress.",
        "- Cut one discretionary expense and redirect it toward the goal.",
        "Ask for a specific plan if you want schedules or budget splits."
      ].join("\n");
      setAnswer(data.answer || offline);
    } catch (e) {
      const offline = [
        "Here’s a practical approach:",
        "- Clarify the goal and timeline.",
        "- Estimate total cost and monthly capacity.",
        "- Allocate a fixed amount per pay cycle and track progress.",
        "- Cut one discretionary expense and redirect it toward the goal.",
        "Ask for a specific plan if you want schedules or budget splits."
      ].join("\n");
      setAnswer(offline);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh w-full bg-[#0a0a0a] text-white pb-32">
       {/* Background */}
       <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-8 sm:max-w-lg z-10">
        <h1 className={`${cherryBombOne.className} mb-2 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400`}>
          Ask Wiley
        </h1>
        <p className="text-zinc-400 mb-8 text-sm">
          Get advice on budgeting, saving, and financial goals.
        </p>

        <div className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How can I save for a new laptop?"
            className="w-full h-32 rounded-2xl bg-[#161618] border border-white/10 p-4 text-sm text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none transition-colors resize-none"
          />
          
          <button
            onClick={handleAsk}
            disabled={isLoading || !question.trim()}
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Thinking..." : "Ask Question"}
          </button>

          {answer && (
             <div className="mt-8 rounded-2xl bg-purple-500/10 border border-purple-500/20 p-6">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-xl">🦄</span>
                   <span className="font-bold text-purple-300">Wiley Says:</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </p>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}

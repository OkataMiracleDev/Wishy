"use client";
import { useState } from "react";

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 py-8 sm:max-w-lg">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Budget Q/A</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Ask questions about savings and budgeting.
          </p>
        </header>

        <section className="space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="min-h-28 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-800 dark:bg-black"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAnswer("This will be answered by Grok AI.")}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Ask
            </button>
          </div>
          {answer && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-black">
              {answer}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


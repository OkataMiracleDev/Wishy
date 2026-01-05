const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// POST /api/ai/ask
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "No question provided" });

    const xaiKey = process.env.XAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY || (xaiKey && xaiKey.startsWith("gsk_") ? xaiKey : "");
    const openaiKey = process.env.OPENAI_API_KEY;

    const baseMessages = [
      { role: "system", content: [
        "You are Wiley Wishy — a witty, upbeat money coach with a fun persona.",
        "Style:",
        "- Playful, friendly, supportive; 2–3 emojis, never overdone.",
        "- Direct and tailored to the user's specific question.",
        "- Keep it tight: use short paragraphs or 4–6 bullets, no fluff.",
        "Content rules:",
        "- Avoid generic budget templates or default splits unless the user explicitly asks for a plan.",
        "- If the user asks for a plan or schedule, first ask ONE concise clarifying question (income range, key expense, or timeline). Then give a provisional plan with stated assumptions and concrete next steps.",
        "- Prefer NGN examples when Nigeria context suggests it; otherwise use USD.",
        "- Always give an actionable 'Next Step' the user can do today.",
        "Output format:",
        "- Start with a punchy 'Quick Take' line.",
        "- Then 3–5 bullets of actions or numbers.",
        "- End with a 'Sparkle Tip' or 'Next Step'.",
        "Be practical, specific, and fun without being silly."
      ].join("\\n") },
      { role: "user", content: question }
    ];

    async function callProvider({ url, key, model }) {
      if (!key) return null;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 18000);
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
          body: JSON.stringify({ messages: baseMessages, model, stream: false, temperature: 0.7, max_tokens: 800, top_p: 0.95 }),
          signal: controller.signal
        });
        clearTimeout(t);
        let json;
        try {
          json = await resp.json();
        } catch {
          json = {};
        }
        const msg = json?.choices?.[0]?.message?.content;
        if (resp.ok && msg && typeof msg === "string" && msg.trim()) return msg;
        return null;
      } catch {
        clearTimeout(t);
        return null;
      }
    }

    let answer = null;

    if (openaiKey) {
      answer = await callProvider({ url: "https://api.openai.com/v1/chat/completions", key: openaiKey, model: "gpt-4o-mini" })
        || await callProvider({ url: "https://api.openai.com/v1/chat/completions", key: openaiKey, model: "gpt-3.5-turbo-0125" });
    }
    if (!answer && groqKey) {
      answer = await callProvider({ url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "mixtral-8x7b-32768" })
        || await callProvider({ url: "https://api.groq.com/openai/v1/chat/completions", key: groqKey, model: "llama3-70b-8192" });
    }
    if (!answer && xaiKey && !xaiKey.startsWith("gsk_")) {
      answer = await callProvider({ url: "https://api.x.ai/v1/chat/completions", key: xaiKey, model: "grok-beta" })
        || await callProvider({ url: "https://api.x.ai/v1/chat/completions", key: xaiKey, model: "grok-2-latest" });
    }

    if (!answer) {
      const offline = [
        "Quick Take: We can still map a smart path 💡",
        "- Define your goal and timeline (e.g., 6 months).",
        "- Estimate total cost and what you can save per pay cycle.",
        "- Auto‑save a fixed amount and track progress weekly.",
        "- Pick one expense to trim and redirect those funds.",
        "Next Step: Tell me your timeline and income range for a tailored plan ✨"
      ].join("\n");
      return res.json({ answer: offline });
    }
    return res.json({ answer });
  } catch (error) {
    const offline = [
      "Quick Take: I’ve got you covered, even offline ✨",
      "- Define the goal and timeline (e.g., 3–12 months).",
      "- Estimate cost vs. monthly saving capacity.",
      "- Commit a fixed auto‑save per pay cycle and watch your progress.",
      "- Trim one discretionary item and redirect those funds.",
      "Next Step: Share your timeline and income range for a fun, tailored plan 🦄"
    ].join("\n");
    return res.json({ answer: offline });
  }
});

module.exports = router;

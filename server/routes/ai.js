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
      { role: "system", content: "You are Wiley Wishy, a friendly personal finance assistant. Answer the user's specific question directly with concise, actionable guidance. Avoid generic templates. Only propose budget splits (e.g., 50/30/20) or weekly schedules if the user explicitly asks for a plan. Prefer NGN examples when the context suggests Nigeria; otherwise use USD. Keep it practical and tailored." },
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
        "Here’s a practical approach:",
        "- Clarify the goal and timeline.",
        "- Estimate total cost and monthly capacity.",
        "- Allocate a fixed amount per pay cycle and track progress.",
        "- Cut one discretionary expense and redirect it toward the goal.",
        "Ask for a specific plan if you want schedules or budget splits."
      ].join("\n");
      return res.json({ answer: offline });
    }
    return res.json({ answer });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get answer" });
  }
});

module.exports = router;

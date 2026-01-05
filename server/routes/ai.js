const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// POST /api/ai/ask
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "No question provided" });

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return res.json({ 
        answer: "I'm ready to help! Please set the XAI_API_KEY in your server .env file to enable AI." 
      });
    }

    let apiUrl = "https://api.x.ai/v1/chat/completions";
    let model = "grok-beta";

    // Auto-detect Groq key
    if (apiKey.startsWith("gsk_")) {
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      model = "mixtral-8x7b-32768";
    }

    const payload = {
      messages: [
        { role: "system", content: "You are Wiley Wishy, a friendly personal finance assistant. Answer the user's specific question directly with concise, actionable guidance. Avoid generic templates. Only propose budget splits (e.g., 50/30/20) or weekly schedules if the user explicitly asks for a plan. Prefer NGN examples when the context suggests Nigeria; otherwise use USD. Keep it practical and tailored." },
        { role: "user", content: question }
      ],
      model: model,
      stream: false,
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.95
    };

    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
    let answer = data?.choices?.[0]?.message?.content;
    if ((!response.ok || !answer) && apiUrl.includes("groq")) {
      model = "llama3-70b-8192";
      payload.model = model;
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }
      answer = data?.choices?.[0]?.message?.content;
    }
    if (!answer || typeof answer !== "string" || !answer.trim()) {
      answer = "I couldn't fetch an answer right now. Please try again in a moment.";
    }
    
    return res.json({ answer });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Failed to get answer" });
  }
});

module.exports = router;

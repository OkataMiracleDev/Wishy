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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are Wiley Wishy, an expert assistant on savings, budgeting, personal finance, and investing. Give clear, practical, step-by-step guidance tailored to the user's scenario. Keep answers concise, friendly, and actionable. Use NGN examples when the user is in Nigeria; otherwise default to USD. When asked for plans, provide a simple budget split (e.g., 50/30/20) and a weekly saving schedule. Avoid disclaimers; be decisive but prudent." },
          { role: "user", content: question }
        ],
        model: model,
        stream: false,
        temperature: 0.7
      })
    });

    const data = await response.json();
    let answer = data.choices?.[0]?.message?.content;
    if (!answer || typeof answer !== "string" || !answer.trim()) {
      answer = "Here’s a practical plan:\n- Use a simple 50/30/20 budget: 50% needs, 30% wants, 20% savings/debt.\n- Set a weekly auto-transfer to savings. Example: ₦5,000/week if aiming for ₦260,000/year.\n- Build a 3–6 month emergency fund first.\n- Invest gradually in broad, low-cost index funds (or money market funds if you need short-term safety).\n- Track all spending; adjust targets monthly based on actuals.";
    }
    
    return res.json({ answer });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Failed to get answer" });
  }
});

module.exports = router;

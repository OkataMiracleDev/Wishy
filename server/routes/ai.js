const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // Or use native fetch in Node 18+

// POST /api/ai/ask
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "No question provided" });

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return res.json({ 
        answer: "I'm ready to help! Please set the XAI_API_KEY in your server .env file to enable Grok AI." 
      });
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are Wiley Wishy, a fun and helpful budgeting assistant." },
          { role: "user", content: question }
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't think of an answer.";
    
    return res.json({ answer });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Failed to get answer" });
  }
});

module.exports = router;

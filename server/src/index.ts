// server/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// health check
app.get("/", (_req, res) => {
  res.send("FlowSpace API running ✨");
});

// -------------------------------
// Quick Quiz route (chat.completions version)
// -------------------------------
app.post("/api/quiz", async (req, res) => {
  try {
    const { text, difficulty } = req.body as {
      text?: string;
      difficulty?: "chill" | "normal" | "spicy";
    };

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const safeDifficulty = difficulty ?? "normal";

    const userPrompt = `
You are a gentle, no-shame study companion for burnt-out students.

Given the student's notes below, create 3–5 short practice questions.

Difficulty:
- "chill" = easier, basic understanding
- "normal" = moderate
- "spicy" = a bit more challenging, but still kind

Return ONLY valid JSON in this exact shape:
[
  { "q": "question text", "a": "short answer" },
  ...
]

Notes:
${text}

Difficulty: ${safeDifficulty}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You write kind, bite-sized quiz questions and always respond with valid JSON only.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "Empty response from OpenAI" });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e, "raw content:", content);
      return res
        .status(500)
        .json({ error: "Could not parse quiz JSON from OpenAI" });
    }

    if (!Array.isArray(parsed)) {
      return res
        .status(500)
        .json({ error: "Quiz result is not an array of questions" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error in /api/quiz:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

app.listen(port, () => {
  console.log(`FlowSpace API listening on http://localhost:${port}`);
});

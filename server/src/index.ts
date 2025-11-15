// server/src/index.ts
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import OpenAI from "openai";
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// health check
app.get("/", (_req: Request, res: Response) => {
  res.send("FlowSpace API running ✨");
});

// -------------------------------
// Quick Quiz route (chat.completions version)
// -------------------------------
app.post("/api/quiz", async (req: Request, res: Response) => {
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

// -------------------------------
// Safe Space check-in route
// -------------------------------
app.post("/api/checkin", async (req: Request, res: Response) => {
  try {
    const { mood, text } = req.body as {
      mood?: string;
      text?: string;
    };

    const userMood = mood || "not sure";
    const userText = text || "";

    const prompt = `
You are a gentle, validating study companion for burnt-out students.

The student has checked in with this mood and optional message.

Mood: ${userMood}
Message: ${userText || "(no details given)"}

Respond with a short, kind JSON object in this shape:

{
  "validation": "a warm validating message (2-3 sentences)",
  "tiny_step": "one very small, optional next step the student can take in under 5 minutes",
  "reminder": "a reminder that rest is allowed and productivity does not equal worth"
}

Keep it soft and non-judgmental. Don't mention JSON or formatting.
Return only valid JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are a kind, no-shame study companion. You only respond with valid JSON in the requested shape.",
        },
        {
          role: "user",
          content: prompt,
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
      console.error("Safe Space JSON parse error:", e, "content:", content);
      return res
        .status(500)
        .json({ error: "Could not parse check-in response from OpenAI" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error in /api/checkin:", err);
    res.status(500).json({ error: "Failed to handle check-in" });
  }
});
// -------------------------------
// Time & Priority Coach route
// -------------------------------
app.post("/api/plan", async (req: Request, res: Response) => {
  try {
    const { tasks, totalMinutes } = req.body as {
      tasks?: { title: string; minutes?: number }[];
      totalMinutes?: number;
    };

    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ error: "Please provide at least one task." });
    }

    const cleanedTasks = tasks
      .filter((t) => t.title && t.title.trim())
      .map((t) => ({
        title: t.title.trim(),
        minutes: t.minutes ?? null,
      }));

    if (cleanedTasks.length === 0) {
      return res.status(400).json({ error: "Please provide at least one task." });
    }

    const safeTotal = totalMinutes && totalMinutes > 0 ? totalMinutes : null;

    const prompt = `
You are a gentle, realistic time-management coach for a burnt-out student.

They have this list of tasks and this much time today.

Tasks:
${cleanedTasks
  .map(
    (t, i) =>
      `${i + 1}. ${t.title}${t.minutes ? ` (est: ${t.minutes} minutes)` : ""}`,
  )
  .join("\n")}

Total time available today: ${
      safeTotal ? `${safeTotal} minutes` : "not specified, assume 60–90 minutes"
    }.

Create a simple, no-shame plan, focusing on starting small.

Return ONLY valid JSON in this exact shape:

{
  "do_first": [
    { "task": "task name", "minutes": number, "reason": "short kind reason" }
  ],
  "do_next": [
    { "task": "task name", "minutes": number, "reason": "short kind reason" }
  ],
  "if_time": [
    { "task": "task name", "minutes": number, "reason": "short kind reason" }
  ],
  "summary": "one short, encouraging summary of the plan (2–3 sentences)"
}

Rules:
- Keep minutes realistic and gentle, not grindy.
- Some tasks can be broken into smaller chunks.
- Always sound kind and non-judgmental.
- Respond with JSON only, no extra text.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You create soft, realistic study plans for tired students. You always respond with valid JSON in the requested shape.",
        },
        { role: "user", content: prompt },
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
      console.error("Plan JSON parse error:", e, "content:", content);
      return res
        .status(500)
        .json({ error: "Could not parse plan JSON from OpenAI" });
    }

    if (
      !parsed ||
      !parsed.do_first ||
      !parsed.do_next ||
      !parsed.if_time ||
      !parsed.summary
    ) {
      return res
        .status(500)
        .json({ error: "Plan JSON missing expected fields" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error in /api/plan:", err);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});


app.listen(port, () => {
  console.log(`FlowSpace API listening on http://localhost:${port}`);
});

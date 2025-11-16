//import "dotenv/config";

// @ts-ignore
import express, { Request, Response } from "express";
// @ts-ignore
import cors from "cors";
// @ts-ignore
import OpenAI from "openai";
// @ts-ignore
import multer from "multer";

// ---- pdf-parse import (handles both CJS & ESM shapes) ----
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParseModule = require("pdf-parse");

type PdfParseFn = (data: Buffer) => Promise<{ text: string }>;

let pdfParse: PdfParseFn;

if (typeof pdfParseModule === "function") {
  pdfParse = pdfParseModule as PdfParseFn;
} else if (pdfParseModule && typeof pdfParseModule.default === "function") {
  pdfParse = pdfParseModule.default as PdfParseFn;
} else {
  console.error("❌ pdf-parse function export not found. Module shape:", pdfParseModule);
  throw new Error("pdf-parse could not be loaded");
}

declare const process: {
  env: {
    [key: string]: string | undefined;
  };
};

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// health check
app.get("/", (_req: Request, res: Response) => {
  res.send("FlowSpace API running ✨");
});

// health check for frontend
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// shared quiz types
type Difficulty = "chill" | "normal" | "spicy";
type QuizType = "short_answer" | "multiple_choice" | "mixed";

type QuizQuestion = {
  q: string;
  a: string;
};

// time coach types
type TaskDifficulty = "easy" | "medium" | "hard";
type TaskPreference = "like" | "neutral" | "least";

// ---------------------------------
// helper: generate quiz from text
//  (with JSON repair step)
// ---------------------------------
async function generateQuizFromText(params: {
  text: string;
  difficulty: Difficulty;
  quizType: QuizType;
}): Promise<QuizQuestion[]> {
  const { text, difficulty, quizType } = params;

  const safeDifficulty = difficulty ?? "normal";
  const safeQuizType = quizType ?? "short_answer";

  const userPrompt = `
You are a gentle, no-shame study companion for burnt-out students.

Given the student's notes below, create 3–5 short practice questions.

Difficulty:
- "chill" = easier, basic understanding
- "normal" = moderate
- "spicy" = a bit more challenging, but still kind

Quiz type:
- "short_answer" = open-ended questions where the student writes a short answer.
- "multiple_choice" = questions with clear options; include the options in the question text and make the answer the correct option.
- "mixed" = a mix of short-answer and multiple-choice styles.

Return ONLY valid JSON in this exact shape:
[
  { "q": "question text", "a": "short answer or correct option" }
]

Notes:
${text}

Difficulty: ${safeDifficulty}
Quiz type: ${safeQuizType}
`;

  // ---------- First attempt ----------
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You write kind, bite-sized quiz questions and always respond with valid JSON only.",
      },
      { role: "user", content: userPrompt },
    ],
  });

  let content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  // Try to parse directly
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("Quiz result is not an array of questions");
    }
    return parsed as QuizQuestion[];
  } catch (e) {
    console.warn("⚠️ First JSON parse failed, requesting repair…", e, "raw:", content);
  }

  // ---------- JSON repair attempt ----------
  const repair = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are a JSON repair assistant. You ONLY output valid JSON and nothing else.",
      },
      {
        role: "user",
        content: `Fix this into a valid JSON array of objects with keys "q" and "a":\n\n${content}`,
      },
    ],
  });

  const repairedContent = repair.choices[0]?.message?.content?.trim();
  if (!repairedContent) {
    throw new Error("JSON repair step returned empty output");
  }

  try {
    const repairedParsed = JSON.parse(repairedContent) as unknown;
    if (!Array.isArray(repairedParsed)) {
      throw new Error("Repaired quiz result is not an array of questions");
    }
    return repairedParsed as QuizQuestion[];
  } catch (e) {
    console.error("❌ JSON repair failed:", e, "content:", repairedContent);
    throw new Error("Could not parse quiz JSON from OpenAI (even after repair)");
  }
}

// -------------------------------
// Quick Quiz route (notes-based)
// -------------------------------
app.post("/api/quiz", async (req: Request, res: Response) => {
  try {
    const { text, difficulty, quizType } = req.body as {
      text?: string;
      difficulty?: Difficulty;
      quizType?: QuizType;
    };

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const safeDiff: Difficulty = difficulty ?? "normal";
    const safeType: QuizType = quizType ?? "short_answer";

    const questions = await generateQuizFromText({
      text,
      difficulty: safeDiff,
      quizType: safeType,
    });

    res.json(questions);
  } catch (err) {
    console.error("Error in /api/quiz:", err);
    const msg =
      err instanceof Error ? err.message : "Failed to generate quiz";
    res.status(500).json({ error: msg });
  }
});

// -------------------------------
// Quick Quiz route (PDF-based)
// -------------------------------
app.post(
  "/api/quiz-from-pdf",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = (req as any).file as { buffer: Buffer } | undefined;

      const { difficulty, quizType } = req.body as {
        difficulty?: Difficulty;
        quizType?: QuizType;
      };

      if (!file) {
        return res.status(400).json({ error: "No PDF file uploaded." });
      }

      const safeDiff: Difficulty = (difficulty as Difficulty) ?? "normal";
      const safeType: QuizType = (quizType as QuizType) ?? "short_answer";

      // 🔍 extract text from PDF with pdf-parse
      const pdfData = await pdfParse(file.buffer);
      const textFromPdf: string = pdfData.text;

      if (!textFromPdf || !textFromPdf.trim()) {
        return res
          .status(400)
          .json({ error: "Could not extract text from the PDF." });
      }

      const questions = await generateQuizFromText({
        text: textFromPdf,
        difficulty: safeDiff,
        quizType: safeType,
      });

      res.json(questions);
    } catch (err) {
      console.error("Error in /api/quiz-from-pdf:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to generate quiz from PDF";
      res.status(500).json({ error: msg });
    }
  },
);

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

    let parsed: unknown;
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
      tasks?: {
        title: string;
        minutes?: number;
        difficulty?: TaskDifficulty;
        preference?: TaskPreference;
      }[];
      totalMinutes?: number;
    };

    if (!tasks || tasks.length === 0) {
      return res
        .status(400)
        .json({ error: "Please provide at least one task." });
    }

    const cleanedTasks = tasks
      .filter((t) => t.title && t.title.trim())
      .map((t) => ({
        title: t.title.trim(),
        minutes: t.minutes ?? null,
        difficulty: t.difficulty ?? "medium",
        preference: t.preference ?? "neutral",
      }));

    if (cleanedTasks.length === 0) {
      return res
        .status(400)
        .json({ error: "Please provide at least one task." });
    }

    const safeTotal = totalMinutes && totalMinutes > 0 ? totalMinutes : null;

    const prompt = `
You are a gentle, realistic time-management coach for a burnt-out student.

They have this list of tasks and this much time today.

Each task also has:
- a difficulty (easy / medium / hard)
- how much they like it (like / neutral / least = their least favorite)

Tasks:
${cleanedTasks
  .map(
    (t, i) =>
      `${i + 1}. ${t.title}${
        t.minutes ? ` (est: ${t.minutes} minutes)` : ""
      }
   - Difficulty: ${t.difficulty}
   - Preference: ${t.preference}`,
  )
  .join("\n")}

Total time available today: ${
      safeTotal ? `${safeTotal} minutes` : "not specified, assume 60–90 minutes"
    }.

Create a simple, no-shame plan, focusing on starting small.

Use difficulty + preference intelligently:
- Try to put a *small, doable slice* of hard / least-favorite tasks in "do_first" so they stop looming.
- Mix in easier or liked tasks in "do_next" so the plan feels kind and balanced.
- Put extra or nice-to-have items in "if_time".

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
  "summary": "one short, encouraging summary of the plan (2–3 sentences) that mentions how we respected their energy and least-favorite tasks"
}

Rules:
- Keep minutes realistic and gentle, not grindy.
- You may break tasks into smaller chunks.
- Prioritize at most 2–3 items in "do_first".
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

    let parsed: unknown;
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
      !(parsed as any).do_first ||
      !(parsed as any).do_next ||
      !(parsed as any).if_time ||
      !(parsed as any).summary
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

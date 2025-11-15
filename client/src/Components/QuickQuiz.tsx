// client/src/Components/QuickQuiz.tsx
import { useState } from "react";
import { API_BASE_URL } from "../config";
import type { Theme, QuizQuestion } from "../App";

type Difficulty = "chill" | "normal" | "spicy";

type QuizApiError = {
  error?: string;
};

type QuizType = "short_answer" | "multiple_choice" | "mixed";

type QuickQuizProps = {
  theme: Theme;
  onSaveQuizSet?: (set: {
    title: string;
    difficulty: Difficulty;
    questions: QuizQuestion[];
  }) => void;
};

export function QuickQuiz({ theme, onSaveQuizSet }: QuickQuizProps) {
  const isDark = theme === "dark";

  const [inputMode, setInputMode] = useState<"notes" | "pdf">("notes");
  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("chill");
  const [quizType, setQuizType] = useState<QuizType>("short_answer");

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPdfFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setPdfFile(null);
      return;
    }

    setError(null);
    setPdfFile(file);
  };

  const handleGenerate = async () => {
    // basic validation
    if (inputMode === "notes" && !text.trim()) {
      setError("Paste a few notes first.");
      return;
    }

    if (inputMode === "pdf" && !pdfFile) {
      setError("Choose a PDF file first.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setQuestions([]);
    setOpenIndex(null);
    setSaveMessage(null);

    try {
      let json: QuizQuestion[] | QuizApiError;

      if (inputMode === "notes") {
        // existing JSON endpoint, now with quizType
        const res = await fetch(`${API_BASE_URL}/api/quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, difficulty, quizType }),
        });

        json = (await res.json()) as QuizQuestion[] | QuizApiError;

        if (!res.ok || !Array.isArray(json)) {
          const message =
            !Array.isArray(json) && "error" in json && json.error
              ? json.error
              : "Something went wrong.";
          throw new Error(message);
        }
      } else {
        // new PDF endpoint using FormData
        const formData = new FormData();
        formData.append("file", pdfFile as Blob);
        formData.append("difficulty", difficulty);
        formData.append("quizType", quizType);

        const res = await fetch(`${API_BASE_URL}/api/quiz-from-pdf`, {
          method: "POST",
          body: formData,
        });

        json = (await res.json()) as QuizQuestion[] | QuizApiError;

        if (!res.ok || !Array.isArray(json)) {
          const message =
            !Array.isArray(json) && "error" in json && json.error
              ? json.error
              : "Could not generate quiz from PDF.";
          throw new Error(message);
        }
      }

      setQuestions(json);

      // auto-suggest title if empty
      if (!title.trim()) {
        if (inputMode === "notes") {
          const snippet = text.trim().split(/\s+/).slice(0, 5).join(" ");
          setTitle(snippet || "Untitled quiz");
        } else {
          setTitle(pdfFile?.name.replace(/\.pdf$/i, "") || "PDF quiz");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Could not generate quiz.");
      } else {
        setError("Could not generate quiz.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (questions.length === 0 || !onSaveQuizSet) return;

    const finalTitle = title.trim() || "Untitled quiz";
    onSaveQuizSet({
      title: finalTitle,
      difficulty,
      questions,
    });
    setSaveMessage("Saved to your profile ✨");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const fieldBaseStyles = {
    width: "100%",
    marginTop: "0.5rem",
    padding: "0.7rem 0.8rem",
    borderRadius: "12px",
    border: isDark
      ? "1px solid rgba(255,255,255,0.16)"
      : "1px solid rgba(0,0,0,0.12)",
    backgroundColor: isDark ? "rgba(10,12,29,0.95)" : "#ffffff",
    color: "var(--text-main)",
    fontSize: "0.95rem",
    boxSizing: "border-box" as const,
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "0.4rem" }}>Quick Quiz Mode</h3>
      <p
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}
      >
        Paste a paragraph, drop in a PDF, or bring your messy notes — get gentle
        practice questions back. You can save sets to your profile as mini
        flashcards.
      </p>

      {/* input mode toggle */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
          fontSize: "0.85rem",
        }}
      >
        <button
          type="button"
          onClick={() => setInputMode("notes")}
          style={{
            padding: "0.25rem 0.9rem",
            borderRadius: "999px",
            border:
              inputMode === "notes"
                ? "1px solid transparent"
                : "1px solid rgba(255,255,255,0.24)",
            backgroundColor:
              inputMode === "notes" ? "var(--accent-soft)" : "transparent",
            fontSize: "0.8rem",
          }}
        >
          Use notes
        </button>
        <button
          type="button"
          onClick={() => setInputMode("pdf")}
          style={{
            padding: "0.25rem 0.9rem",
            borderRadius: "999px",
            border:
              inputMode === "pdf"
                ? "1px solid transparent"
                : "1px solid rgba(255,255,255,0.24)",
            backgroundColor:
              inputMode === "pdf" ? "var(--accent-soft)" : "transparent",
            fontSize: "0.8rem",
          }}
        >
          Upload PDF
        </button>
      </div>

      <label
        style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.75rem" }}
      >
        Quiz title (optional)
        <input
          style={fieldBaseStyles}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Geo lab streams, Calc derivatives review…"
        />
      </label>

      {inputMode === "notes" ? (
        <label style={{ display: "block", fontSize: "0.9rem" }}>
          Your notes or concept
          <textarea
            style={{
              ...fieldBaseStyles,
              marginTop: "0.5rem",
              minHeight: "120px",
              resize: "vertical" as const,
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste class notes, a textbook paragraph, or a concept you want to practice…"
          />
        </label>
      ) : (
        <label style={{ display: "block", fontSize: "0.9rem" }}>
          Your PDF
          <div style={{ marginTop: "0.5rem" }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
          <p
            style={{
              marginTop: "0.35rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            We’ll read the PDF content and generate questions from it.
          </p>
        </label>
      )}

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
          fontSize: "0.9rem",
        }}
      >
        {/* Difficulty */}
        <div style={{ flex: "0 0 160px" }}>
          <label>
            Difficulty
            <select
              style={fieldBaseStyles}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="chill">😌 Chill</option>
              <option value="normal">🙂 Normal</option>
              <option value="spicy">🌶️ Spicy</option>
            </select>
          </label>
        </div>

        {/* Quiz type */}
        <div style={{ flex: "0 0 190px" }}>
          <label>
            Quiz type
            <select
              style={fieldBaseStyles}
              value={quizType}
              onChange={(e) => setQuizType(e.target.value as QuizType)}
            >
              <option value="short_answer">✏️ Short answer</option>
              <option value="multiple_choice">🔘 Multiple choice-ish</option>
              <option value="mixed">🍱 Mixed</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          style={{
            padding: "0.65rem 1.6rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            fontWeight: 600,
            marginTop: "1.4rem",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Generating…" : "Generate quiz"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={questions.length === 0}
          style={{
            padding: "0.65rem 1.4rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.2)",
            backgroundColor: "transparent",
            color: questions.length === 0 ? "var(--text-muted)" : "var(--accent)",
            fontWeight: 500,
            marginTop: "1.4rem",
          }}
        >
          Save this quiz
        </button>
      </div>

      {error && (
        <p
          style={{
            marginTop: "0.8rem",
            color: "#ff9b9b",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </p>
      )}

      {saveMessage && (
        <p
          style={{
            marginTop: "0.4rem",
            color: "var(--accent)",
            fontSize: "0.85rem",
          }}
        >
          {saveMessage}
        </p>
      )}

      {questions.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.6rem" }}>
            Your practice questions ({questions.length})
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {questions.map((q, index) => {
              const isOpen = openIndex === index;
              return (
                <li
                  key={index}
                  style={{
                    borderRadius: "14px",
                    padding: "0.9rem 1rem",
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.02)",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.95rem",
                      }}
                    >
                      {q.q}
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      style={{
                        padding: "0.3rem 0.9rem",
                        borderRadius: "999px",
                        border: "none",
                        backgroundColor: "var(--accent-soft)",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isOpen ? "Hide answer" : "Show answer"}
                    </button>
                  </div>
                  {isOpen && (
                    <p
                      style={{
                        marginTop: "0.5rem",
                        marginBottom: 0,
                        fontSize: "0.9rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {q.a}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// client/src/Components/QuickQuiz.tsx
import { useState } from "react";
import { API_BASE_URL } from "../config";
import type { Theme, QuizQuestion } from "../App";

type Difficulty = "chill" | "normal" | "spicy";
type QuizType = "short_answer" | "multiple_choice" | "mixed";

type QuizApiError = {
  error?: string;
};

type QuickQuizProps = {
  theme: Theme;
  onSaveQuizSet?: (set: {
    title: string;
    difficulty: Difficulty;
    tags?: string[];
    questions: QuizQuestion[];
  }) => void;
};

type ViewMode = "practice" | "review";

export function QuickQuiz({ theme, onSaveQuizSet }: QuickQuizProps) {
  const isDark = theme === "dark";

  // input mode: notes or (future) PDF
  const [inputMode, setInputMode] = useState<"notes" | "pdf">("notes");

  const [text, setText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [tagsInput, setTagsInput] = useState(""); // comma-separated tags

  const [difficulty, setDifficulty] = useState<Difficulty>("chill");
  const [quizType, setQuizType] = useState<QuizType>("short_answer");

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // results & practice
  const [viewMode, setViewMode] = useState<ViewMode>("review");
  const [openIndex, setOpenIndex] = useState<number | null>(null); // for review mode
  const [questionStatuses, setQuestionStatuses] = useState<
    Record<number, "got_it" | "not_yet" | undefined>
  >({});
  const [notesByIndex, setNotesByIndex] = useState<Record<number, string>>({});

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
  };

  const handleGenerate = async () => {
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
    setQuestionStatuses({});
    setNotesByIndex({});

    try {
      let json: QuizQuestion[] | QuizApiError;

      if (inputMode === "notes") {
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
        // expects /api/quiz-from-pdf to exist (if you’ve added it)
        const formData = new FormData();
        if (pdfFile) formData.append("file", pdfFile);
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

      // auto-suggest title if blank
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

  // Shuffle current questions
  const handleShuffle = () => {
    if (questions.length === 0) return;
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuestions(shuffled);
    setOpenIndex(null);
    setQuestionStatuses({});
    setNotesByIndex({});
  };

  // Regenerate similar questions (just re-run generate with same inputs)
  const handleRegenerate = () => {
    if (inputMode === "notes" && !text.trim()) return;
    if (inputMode === "pdf" && !pdfFile) return;
    handleGenerate();
  };

  const handleSave = () => {
    if (questions.length === 0 || !onSaveQuizSet) return;

    const finalTitle = title.trim() || "Untitled quiz";
    const tags =
      tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0) || [];

    onSaveQuizSet({
      title: finalTitle,
      difficulty,
      tags,
      questions,
    });

    setSaveMessage("Saved to your profile ✨");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSetStatus = (
    index: number,
    status: "got_it" | "not_yet",
  ) => {
    setQuestionStatuses((prev) => ({ ...prev, [index]: status }));
  };

  const handleNoteChange = (index: number, value: string) => {
    setNotesByIndex((prev) => ({ ...prev, [index]: value }));
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

  const difficultyLabel =
    difficulty === "chill"
      ? "★ Chill"
      : difficulty === "normal"
      ? "★★ Normal"
      : "★★★ Spicy";

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "0.4rem" }}>Quick Quiz Lab</h3>
      <p
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}
      >
        Turn notes or PDFs into tiny practice sets. Choose your vibe, then use
        practice mode to mark “Got it” / “Not yet” before you peek at answers.
      </p>

      {/* Input mode toggle */}
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

      {/* Title + tags */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <label
          style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.15rem" }}
        >
          Quiz title (optional)
          <input
            style={fieldBaseStyles}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bio 101 – Cell structure review"
          />
        </label>

        <label
          style={{ display: "block", fontSize: "0.9rem", marginBottom: "0.15rem" }}
        >
          Tags (optional)
          <input
            style={fieldBaseStyles}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. Midterm 1, Chapter 3, Lecture 5"
          />
        </label>
      </div>

      {/* Input area */}
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

      {/* Controls: difficulty, type, generate/save */}
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

      {/* If we have questions, show practice/review controls and list */}
      {questions.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* top bar: mode, difficulty pill, shuffle/regenerate */}
          <div
            style={{
              marginBottom: "0.6rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  opacity: 0.8,
                }}
              >
                Mode:
              </span>
              <button
                type="button"
                onClick={() => setViewMode("practice")}
                style={{
                  padding: "0.25rem 0.8rem",
                  borderRadius: "999px",
                  border:
                    viewMode === "practice"
                      ? "1px solid transparent"
                      : "1px solid rgba(148,163,184,0.6)",
                  backgroundColor:
                    viewMode === "practice" ? "var(--accent-soft)" : "transparent",
                  fontSize: "0.8rem",
                }}
              >
                Practice first
              </button>
              <button
                type="button"
                onClick={() => setViewMode("review")}
                style={{
                  padding: "0.25rem 0.8rem",
                  borderRadius: "999px",
                  border:
                    viewMode === "review"
                      ? "1px solid transparent"
                      : "1px solid rgba(148,163,184,0.6)",
                  backgroundColor:
                    viewMode === "review" ? "var(--accent-soft)" : "transparent",
                  fontSize: "0.8rem",
                }}
              >
                Review answers
              </button>

              <span
                style={{
                  marginLeft: "0.4rem",
                  padding: "0.15rem 0.6rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  backgroundColor: "var(--accent-soft)",
                }}
              >
                {difficultyLabel}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleShuffle}
                style={{
                  padding: "0.25rem 0.7rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  backgroundColor: "transparent",
                  fontSize: "0.8rem",
                }}
              >
                Shuffle
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                style={{
                  padding: "0.25rem 0.7rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  backgroundColor: "transparent",
                  fontSize: "0.8rem",
                }}
              >
                Regenerate similar
              </button>
            </div>
          </div>

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
              const status = questionStatuses[index];
              const note = notesByIndex[index] ?? "";

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

                    {viewMode === "review" ? (
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
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.3rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSetStatus(index, "got_it")}
                          style={{
                            padding: "0.25rem 0.7rem",
                            borderRadius: "999px",
                            border: "none",
                            fontSize: "0.8rem",
                            backgroundColor:
                              status === "got_it"
                                ? "var(--accent-soft)"
                                : "rgba(34,197,94,0.08)",
                          }}
                        >
                          Got it
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(index, "not_yet")}
                          style={{
                            padding: "0.25rem 0.7rem",
                            borderRadius: "999px",
                            border: "none",
                            fontSize: "0.8rem",
                            backgroundColor:
                              status === "not_yet"
                                ? "var(--accent-soft)"
                                : "rgba(248,113,113,0.10)",
                          }}
                        >
                          Not yet
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Answer section (review mode only) */}
                  {viewMode === "review" && isOpen && (
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

                  {/* Per-question note */}
                  <div style={{ marginTop: "0.5rem" }}>
                    <label
                      style={{
                        fontSize: "0.8rem",
                        display: "block",
                        marginBottom: "0.2rem",
                        opacity: 0.9,
                      }}
                    >
                      Your note for this question
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) =>
                        handleNoteChange(index, e.target.value)
                      }
                      rows={2}
                      placeholder="Memory hook, pattern, or reminder for future you…"
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        border: isDark
                          ? "1px solid rgba(148,163,184,0.7)"
                          : "1px solid rgba(148,163,184,0.5)",
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.8rem",
                        resize: "vertical",
                        backgroundColor: isDark ? "#020617" : "#ffffff",
                        color: "inherit",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

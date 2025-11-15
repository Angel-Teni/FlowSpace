// client/src/Components/QuickQuiz.tsx
import { useState } from "react";
import { API_BASE_URL } from "../config";


type Theme = "light" | "dark";
type Difficulty = "chill" | "normal" | "spicy";

type QuizQuestion = {
  q: string;
  a: string;
};

type QuizApiError = {
  error?: string;
};

type QuickQuizProps = {
  theme: Theme;
};

export function QuickQuiz({ theme }: QuickQuizProps) {
  const isDark = theme === "dark";

  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("chill");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Paste a few notes first.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setQuestions([]);
    setOpenIndex(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, difficulty }),
      });
      const json = (await res.json()) as QuizQuestion[] | QuizApiError;

      if (!res.ok || !Array.isArray(json)) {
        const message =
          !Array.isArray(json) && "error" in json && json.error
            ? json.error
            : "Something went wrong.";
        throw new Error(message);
      }

      // json is now the array of questions
      setQuestions(json);
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
        Paste a paragraph or messy notes — get a few gentle practice questions
        back, no exam vibes.
      </p>

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

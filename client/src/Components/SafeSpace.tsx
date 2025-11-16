import { useState } from "react";
import { API_BASE_URL } from "../config";

type Theme = "light" | "dark";

type SafeSpaceResponse = {
  validation: string;
  tiny_step: string;
  reminder: string;
};

type SafeSpaceProps = {
  theme: Theme;
};

const MOODS = [
  { id: "tired", label: "😴 Tired" },
  { id: "stressed", label: "😵‍💫 Stressed" },
  { id: "guilty", label: "😔 Guilty" },
  { id: "numb", label: "😶 Numb" },
  { id: "okay", label: "🙂 Okay-ish" },
];

export function SafeSpace({ theme }: SafeSpaceProps) {
  const isDark = theme === "dark";

  const [mood, setMood] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [response, setResponse] = useState<SafeSpaceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setError(null);
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood ?? "not sure", text }),
      });

      const json = (await res.json()) as SafeSpaceResponse | { error?: string };

      if (!res.ok || !("validation" in json)) {
        const message =
          "error" in json && json.error
            ? json.error
            : "Something went wrong.";
        throw new Error(message);
      }

      setResponse(json as SafeSpaceResponse);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Could not complete check-in.");
      } else {
        setError("Could not complete check-in.");
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

  const selectedMood = MOODS.find((m) => m.id === mood);

  return (
    <div className="safe-page-shell">
      <div className="fs-card safe-card">
        {/* Header */}
        <div className="safe-card-header">
          <div>
            <div className="safe-pill">💗 Gentle check-in</div>
            <h3 style={{ marginTop: "0.6rem", marginBottom: "0.25rem" }}>
              Safe Space
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
              }}
            >
              A no-shame corner to say “this is a lot” and get one tiny, kind
              next step. No hustle talk, just validation.
            </p>
          </div>

          <div className="safe-meta-pill">
            {selectedMood ? selectedMood.label : "How are you landing today?"}
          </div>
        </div>

        {/* Mood chips */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.75rem",
            fontSize: "0.85rem",
          }}
        >
          {MOODS.map((m) => {
            const selected = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                style={{
                  padding: "0.35rem 0.9rem",
                  borderRadius: "999px",
                  border: selected
                    ? "1px solid var(--accent)"
                    : "1px solid transparent",
                  backgroundColor: selected
                    ? "var(--accent-soft)"
                    : isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Optional vent box */}
        <label style={{ display: "block", fontSize: "0.9rem" }}>
          Want to share what's going on?
          <textarea
            style={{
              ...fieldBaseStyles,
              marginTop: "0.5rem",
              minHeight: "90px",
              resize: "vertical" as const,
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Totally optional — you can vent, ramble, or just leave this blank."
          />
        </label>

        <button
          type="button"
          onClick={handleCheckIn}
          disabled={isLoading}
          className="fs-btn-primary safe-checkin-btn"
          style={{
            marginTop: "1rem",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Checking in…" : "Check in with FlowSpace"}
        </button>

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

        {response && (
          <div className="safe-response-card">
            <p style={{ marginTop: 0, marginBottom: "0.6rem" }}>
              {response.validation}
            </p>
            <p style={{ margin: 0, marginBottom: "0.4rem" }}>
              <strong>Tiny next step:</strong> {response.tiny_step}
            </p>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              {response.reminder}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

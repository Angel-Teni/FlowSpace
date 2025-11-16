import { useEffect, useState } from "react";

type LockInLevel = "soft" | "focus" | "deep";
type Theme = "light" | "dark";

type FlowTimerProps = {
  theme: Theme;
};

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

const LEVELS: Record<
  LockInLevel,
  { label: string; focusMinutes: number; breakMinutes: number }
> = {
  soft: { label: "💧 Soft Start", focusMinutes: 5, breakMinutes: 2 },
  focus: { label: "🔥 Lock In", focusMinutes: 15, breakMinutes: 3 },
  deep: { label: "💀 Deep Focus", focusMinutes: 25, breakMinutes: 5 },
};

export function FlowTimer({ theme }: FlowTimerProps) {
  const isDark = theme === "dark";

  const [task, setTask] = useState("");
  const [level, setLevel] = useState<LockInLevel>("soft");
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isRunning, setIsRunning] = useState(false);

  // timer seconds
  const [secondsLeft, setSecondsLeft] = useState(
    LEVELS.soft.focusMinutes * 60,
  );

  // tiny todo list
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const getDurationSeconds = (lvl: LockInLevel, m: "focus" | "break") => {
    const minutes =
      m === "focus" ? LEVELS[lvl].focusMinutes : LEVELS[lvl].breakMinutes;
    return minutes * 60;
  };

  // countdown effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          return getDurationSeconds(level, nextMode);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, level]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const handleLevelChange = (value: LockInLevel) => {
    setLevel(value);
    setIsRunning(false);
    setMode("focus");
    setSecondsLeft(getDurationSeconds(value, "focus"));
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode("focus");
    setSecondsLeft(getDurationSeconds(level, "focus"));
  };

  // shooting star progress
  const segmentTotalSeconds = getDurationSeconds(level, mode);
  const progress =
    segmentTotalSeconds > 0 ? 1 - secondsLeft / segmentTotalSeconds : 0;

  // todo helpers
  const addTodo = () => {
    const text = newTodo.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        text,
        done: false,
      },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const fieldBaseStyles = {
    width: "100%",
    marginTop: "0.5rem",
    padding: "0.6rem 0.75rem",
    borderRadius: "10px",
    border: isDark
      ? "1px solid rgba(255,255,255,0.16)"
      : "1px solid rgba(0,0,0,0.16)",
    backgroundColor: isDark ? "rgba(10,12,29,0.95)" : "#ffffff",
    color: "var(--text-main)",
    fontSize: "0.95rem",
    boxSizing: "border-box" as const,
  };

  const levelMetaLabel = `${LEVELS[level].label} – ${
    LEVELS[level].focusMinutes
  } min focus`;

  return (
    <div className="time-page-shell">
      <div
        className="fs-card time-card"
        style={{
          maxWidth: 880,
          margin: "0 auto",
        }}
      >
        {/* shared header like Time Coach */}
        <div className="time-card-header">
          <div>
            <div className="time-pill">⏰ Time Coach</div>
            <h3
              style={{
                marginTop: "0.6rem",
                marginBottom: "0.25rem",
              }}
            >
              Focus Timer
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: "1rem",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
              }}
            >
              Choose your lock-in level and a gentle focus task. Watch the
              shooting star glide across each lap.
            </p>
          </div>

          <div className="time-meta-pill">{levelMetaLabel}</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "2rem",
          }}
        >
          {/* left: timer + star */}
          <div>
            <label
              style={{
                display: "block",
                marginTop: "0.4rem",
                fontSize: "0.9rem",
              }}
            >
              What are you working on?
              <input
                style={fieldBaseStyles}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g. Calc homework, bio notes…"
              />
            </label>

            <label
              style={{ display: "block", marginTop: "1rem", fontSize: "0.9rem" }}
            >
              Lock-in level
              <select
                style={fieldBaseStyles}
                value={level}
                onChange={(e) =>
                  handleLevelChange(e.target.value as LockInLevel)
                }
                disabled={isRunning}
              >
                {Object.entries(LEVELS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label} – {value.focusMinutes} min focus
                  </option>
                ))}
              </select>
            </label>

            {/* shooting star progress */}
            <div style={{ marginTop: "1.4rem" }}>
              <div
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--text-muted)",
                }}
              >
                {mode === "focus" ? "Focus lap" : "Break lap"} progress
              </div>
              <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.1rem 0" }}>
                <div
                  style={{
                    position: "relative",
                    height: 7,
                    borderRadius: 999,
                    overflow: "hidden",
                    background: isDark
                      ? "linear-gradient(90deg, #020617, #0b1220)"
                      : "linear-gradient(90deg, #e5e7eb, #f3f4f6)",
                  }}
                >
                  {/* filled glow */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "left center",
                      transform: `scaleX(${progress})`,
                      transition: "transform 0.5s ease-out",
                      background: isDark
                        ? "linear-gradient(90deg, rgba(244,114,182,0.55), rgba(129,140,248,0.4))"
                        : "linear-gradient(90deg, rgba(244,114,182,0.65), rgba(129,140,248,0.45))",
                    }}
                  />
                  {/* shooting star */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      transform: `translate(${progress * 100}%, -50%)`,
                      transition:
                        "transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1.0)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 2,
                        borderRadius: 999,
                        background: isDark
                          ? "linear-gradient(90deg, rgba(15,23,42,0), rgba(244,114,182,0.95))"
                          : "linear-gradient(90deg, rgba(15,23,42,0), rgba(236,72,153,0.95))",
                      }}
                    />
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "999px",
                        background:
                          "radial-gradient(circle at 30% 30%, #ffffff, #e879f9 55%, transparent 72%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                          "0 0 14px rgba(244,114,182,0.9), 0 0 26px rgba(129,140,248,0.7)",
                        fontSize: "0.75rem",
                      }}
                    >
                      ✶
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    marginTop: "0.35rem",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  When the star reaches the edge, this{" "}
                  {mode === "focus" ? "focus" : "break"} lap flips.
                </p>
              </div>
            </div>

            {/* big time + controls */}
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <div
                style={{
                  fontSize: "3.2rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: isDark ? "#f9f9ff" : "#1f2335",
                }}
              >
                {minutes}:{seconds}
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.95rem",
                  color: "var(--text-muted)",
                }}
              >
                Mode:{" "}
                <strong style={{ color: "var(--text-main)" }}>
                  {mode === "focus" ? "Focus" : "Break"}
                </strong>
              </div>
              {task && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontStyle: "italic",
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Focusing on: {task}
                </div>
              )}

              <div
                style={{
                  marginTop: "1.1rem",
                  display: "flex",
                  gap: "0.6rem",
                  justifyContent: "center",
                }}
              >
                {!isRunning ? (
                  <button
                    onClick={() => setIsRunning(true)}
                    className="fs-btn-primary"
                    style={{
                      padding: "0.55rem 1.5rem",
                      backgroundColor: "var(--accent)",
                      color: "#ffffff",
                      fontWeight: 600,
                    }}
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRunning(false)}
                    className="fs-btn-primary"
                    style={{
                      padding: "0.55rem 1.5rem",
                      backgroundColor: "var(--accent)",
                      color: "#ffffff",
                      fontWeight: 600,
                    }}
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="fs-btn-ghost"
                  style={{
                    padding: "0.55rem 1.5rem",
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "var(--accent-soft)",
                    color: "var(--text-main)",
                    fontWeight: 500,
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* right: mini task list */}
          <div>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                fontSize: "1.05rem",
              }}
            >
              Lap task list
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
                color: "var(--text-muted)",
              }}
            >
              Break your session into tiny, kind-sized tasks. Check them off as
              the star crosses the sky.
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.9rem",
              }}
            >
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo();
                }}
                placeholder="e.g. skim notes, outline Q1–3…"
                style={{
                  flex: 1,
                  padding: "0.55rem 0.75rem",
                  borderRadius: "10px",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.16)"
                    : "1px solid rgba(0,0,0,0.16)",
                  backgroundColor: isDark ? "rgba(10,12,29,0.95)" : "#ffffff",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                }}
              />
              <button
                type="button"
                onClick={addTodo}
                className="fs-btn-primary"
                style={{
                  padding: "0.55rem 0.95rem",
                  border: "none",
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                }}
              >
                Add
              </button>
            </div>

            {todos.length === 0 ? (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                }}
              >
                No tasks yet. Add two or three tiny things you’d like to nudge
                forward this session.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                }}
              >
                {todos.map((t) => (
                  <li
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.45rem 0.55rem",
                      borderRadius: "10px",
                      backgroundColor: isDark
                        ? "rgba(15,23,42,0.7)"
                        : "rgba(248,250,252,0.9)",
                      border: isDark
                        ? "1px solid rgba(148,163,184,0.25)"
                        : "1px solid rgba(148,163,184,0.3)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTodo(t.id)}
                      aria-label={t.done ? "Mark as not done" : "Mark as done"}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "999px",
                        border: t.done
                          ? "none"
                          : "1px solid rgba(148,163,184,0.7)",
                        backgroundColor: t.done ? "var(--accent)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {t.done ? "✓" : ""}
                    </button>
                    <span
                      style={{
                        flex: 1,
                        fontSize: "0.9rem",
                        color: "var(--text-main)",
                        textDecoration: t.done ? "line-through" : "none",
                        opacity: t.done ? 0.65 : 1,
                      }}
                    >
                      {t.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteTodo(t.id)}
                      style={{
                        border: "none",
                        background: "none",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

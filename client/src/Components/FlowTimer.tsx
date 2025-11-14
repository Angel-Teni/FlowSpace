import { useEffect, useState } from "react";

type LockInLevel = "soft" | "focus" | "deep";
type Theme = "light" | "dark";

type FlowTimerProps = {
  theme: Theme;
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

  // secondsLeft is initialized from the "soft" focus duration
  const [secondsLeft, setSecondsLeft] = useState(
    LEVELS.soft.focusMinutes * 60,
  );

  // helper to get seconds for a level + mode
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
          // when timer hits 0, switch mode and reset duration
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
    // when level changes, stop and reset to focus mode
    setIsRunning(false);
    setMode("focus");
    setSecondsLeft(getDurationSeconds(value, "focus"));
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode("focus");
    setSecondsLeft(getDurationSeconds(level, "focus"));
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

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
      <h2
        style={{
          marginTop: 0,
          marginBottom: "0.25rem",
          fontSize: "1.25rem",
        }}
      >
        FlowTimer
      </h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: "1.25rem",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}
      >
        Choose your lock-in level and a gentle focus task.
      </p>

      <label style={{ display: "block", marginTop: "1rem", fontSize: "0.9rem" }}>
        What are you working on?
        <input
          style={fieldBaseStyles}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. Calc homework, bio notes…"
        />
      </label>

      <label style={{ display: "block", marginTop: "1rem", fontSize: "0.9rem" }}>
        Lock-in level
        <select
          style={fieldBaseStyles}
          value={level}
          onChange={(e) => handleLevelChange(e.target.value as LockInLevel)}
          disabled={isRunning}
        >
          {Object.entries(LEVELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label} – {value.focusMinutes} min focus
            </option>
          ))}
        </select>
      </label>

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
  );
}

import { useEffect, useState } from "react";

type LockInLevel = "soft" | "focus" | "deep";

const LEVELS: Record<
  LockInLevel,
  { label: string; focusMinutes: number; breakMinutes: number }
> = {
  soft: { label: "💧 Soft Start", focusMinutes: 5, breakMinutes: 2 },
  focus: { label: "🔥 Lock In", focusMinutes: 15, breakMinutes: 3 },
  deep: { label: "💀 Deep Focus", focusMinutes: 25, breakMinutes: 5 },
};

export function FlowTimer() {
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

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem" }}>
      <h2>FlowTimer</h2>
      <p>Choose your lock-in level and a gentle focus task.</p>

      <label style={{ display: "block", marginTop: "1rem" }}>
        What are you working on?
        <input
          style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. Calc homework, bio notes…"
        />
      </label>

      <label style={{ display: "block", marginTop: "1rem" }}>
        Lock-in level
        <select
          style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
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
        <div style={{ fontSize: "3rem", fontWeight: "bold" }}>
          {minutes}:{seconds}
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          Mode: <strong>{mode === "focus" ? "Focus" : "Break"}</strong>
        </div>
        {task && (
          <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
            Focusing on: {task}
          </div>
        )}

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          {!isRunning ? (
            <button onClick={() => setIsRunning(true)}>Start</button>
          ) : (
            <button onClick={() => setIsRunning(false)}>Pause</button>
          )}
          <button onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}

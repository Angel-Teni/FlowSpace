import { useState } from "react";
import { API_BASE_URL } from "../config";


type Theme = "light" | "dark";

type TaskInput = {
  id: number;
  title: string;
  minutes?: number;
};

type PlanItem = {
  task: string;
  minutes: number;
  reason: string;
};

type CoachPlan = {
  do_first: PlanItem[];
  do_next: PlanItem[];
  if_time: PlanItem[];
  summary: string;
};

type TimeCoachProps = {
  theme: Theme;
};

export function TimeCoach({ theme }: TimeCoachProps) {
  const isDark = theme === "dark";

  const [tasks, setTasks] = useState<TaskInput[]>([
    { id: 1, title: "", minutes: undefined },
    { id: 2, title: "", minutes: undefined },
  ]);
  const [totalMinutes, setTotalMinutes] = useState<number | "">("");
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldBaseStyles = {
    width: "100%",
    marginTop: "0.4rem",
    padding: "0.6rem 0.7rem",
    borderRadius: "10px",
    border: isDark
      ? "1px solid rgba(255,255,255,0.16)"
      : "1px solid rgba(0,0,0,0.12)",
    backgroundColor: isDark ? "rgba(10,12,29,0.95)" : "#ffffff",
    color: "var(--text-main)",
    fontSize: "0.9rem",
    boxSizing: "border-box" as const,
  };

  const handleTaskChange = (id: number, field: "title" | "minutes", value: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              [field]:
                field === "minutes"
                  ? value === ""
                    ? undefined
                    : Number(value)
                  : value,
            }
          : t,
      ),
    );
  };

  const addTaskRow = () => {
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: "", minutes: undefined },
    ]);
  };

  const removeTaskRow = (id: number) => {
    setTasks((prev) => (prev.length <= 1 ? prev : prev.filter((t) => t.id !== id)));
  };

  const handleGeneratePlan = async () => {
    setError(null);
    setPlan(null);

    const cleaned = tasks.filter((t) => t.title.trim().length > 0);
    if (cleaned.length === 0) {
      setError("Add at least one task before generating a plan.");
      return;
    }

    setIsLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/plan`, {
            method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: cleaned.map((t) => ({
            title: t.title,
            minutes: t.minutes && t.minutes > 0 ? t.minutes : undefined,
          })),
          totalMinutes:
            typeof totalMinutes === "number" && totalMinutes > 0
              ? totalMinutes
              : undefined,
        }),
      });

      const json = (await res.json()) as CoachPlan | { error?: string };

      if (!res.ok || !("do_first" in json)) {
        const message =
          "error" in json && json.error
            ? json.error
            : "Something went wrong generating your plan.";
        throw new Error(message);
      }

      setPlan(json as CoachPlan);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Could not generate plan.");
      } else {
        setError("Could not generate plan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderBucket = (title: string, items: PlanItem[]) => {
    if (!items || items.length === 0) return null;

    return (
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: "0.8rem 0.9rem",
          borderRadius: "12px",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <h5
          style={{
            margin: 0,
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </h5>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          {items.map((item, idx) => (
            <li key={idx} style={{ fontSize: "0.88rem" }}>
              <div style={{ fontWeight: 500 }}>
                {item.task}{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  · {item.minutes} min
                </span>
              </div>
              <div
                style={{
                  marginTop: "0.1rem",
                  color: "var(--text-muted)",
                }}
              >
                {item.reason}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "0.4rem" }}>
        Time & Priority Coach
      </h3>
      <p
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}
      >
        List what&apos;s on your plate and how much time you actually have. FlowSpace
        will sort it into a gentle, realistic plan.
      </p>

      {/* time input */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "0.75rem",
          fontSize: "0.9rem",
        }}
      >
        <label style={{ flex: "0 0 180px" }}>
          Time today (minutes)
          <input
            type="number"
            min={0}
            style={fieldBaseStyles}
            value={totalMinutes}
            onChange={(e) =>
              setTotalMinutes(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            placeholder="e.g. 60"
          />
        </label>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "var(--text-muted)",
          }}
        >
          You can leave this blank — we&apos;ll assume about an hour.
        </p>
      </div>

      {/* task list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          marginBottom: "0.4rem",
        }}
      >
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.8fr) 0.7fr auto",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <div>
              <label style={{ fontSize: "0.85rem" }}>
                Task
                <input
                  style={fieldBaseStyles}
                  value={task.title}
                  onChange={(e) =>
                    handleTaskChange(task.id, "title", e.target.value)
                  }
                  placeholder="e.g. Bio homework, finish lab report"
                />
              </label>
            </div>
            <div>
              <label style={{ fontSize: "0.85rem" }}>
                Est. minutes
                <input
                  type="number"
                  min={0}
                  style={fieldBaseStyles}
                  value={task.minutes ?? ""}
                  onChange={(e) =>
                    handleTaskChange(task.id, "minutes", e.target.value)
                  }
                  placeholder="optional"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => removeTaskRow(task.id)}
              disabled={tasks.length <= 1}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "var(--accent-soft)",
                fontSize: "0.8rem",
                opacity: tasks.length <= 1 ? 0.5 : 1,
                cursor: tasks.length <= 1 ? "default" : "pointer",
                marginTop: "1.1rem",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addTaskRow}
        style={{
          padding: "0.4rem 0.9rem",
          borderRadius: "999px",
          border: "none",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.04)",
          fontSize: "0.85rem",
          marginBottom: "0.8rem",
          cursor: "pointer",
        }}
      >
        + Add another task
      </button>

      <div style={{ marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={handleGeneratePlan}
          disabled={isLoading}
          style={{
            padding: "0.7rem 1.7rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "var(--accent)",
            color: "#ffffff",
            fontWeight: 600,
            opacity: isLoading ? 0.7 : 1,
            cursor: "pointer",
          }}
        >
          {isLoading ? "Drafting your plan…" : "Generate gentle plan"}
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

      {plan && (
        <div style={{ marginTop: "1.4rem" }}>
          <p
            style={{
              marginTop: 0,
              marginBottom: "0.9rem",
              fontSize: "0.9rem",
            }}
          >
            {plan.summary}
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.8rem",
            }}
          >
            {renderBucket("Do first", plan.do_first)}
            {renderBucket("Do next", plan.do_next)}
            {renderBucket("If there's time", plan.if_time)}
          </div>
        </div>
      )}
    </div>
  );
}

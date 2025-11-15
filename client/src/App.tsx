// client/src/App.tsx
import { useEffect, useState } from "react";
import "./App.css";

import {
  HomePage,
  FlowTimer,
  QuickQuiz,
  SafeSpace,
  TimeCoach,
  ProfilePage,
} from "./Components";

import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "./config";

export type Theme = "light" | "dark";

export type QuizQuestion = {
  q: string;
  a: string;
};

export type SavedQuizSet = {
  id: string;
  title: string;
  createdAt: string;
  difficulty: "chill" | "normal" | "spicy";
  questions: QuizQuestion[];
};

export type UserProfile = {
  name: string;
};

const LOCAL_STORAGE_PROFILE_KEY = "flowspace_profile_v1";
const LOCAL_STORAGE_QUIZZES_KEY = "flowspace_quiz_sets_v1";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("flowspace_theme");
  if (stored === "light" || stored === "dark") return stored;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

// NEW: lazy initializers to avoid setState in an effect
function getInitialProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getInitialQuizSets(): SavedQuizSet[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_QUIZZES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function App() {
  const [apiMessage, setApiMessage] = useState("Checking connection...");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [profile, setProfile] = useState<UserProfile | null>(getInitialProfile);
  const [savedQuizSets, setSavedQuizSets] = useState<SavedQuizSet[]>(
    getInitialQuizSets,
  );
  const location = useLocation();

  // theme on <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("flowspace_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // backend health check
  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then((res) => res.text())
      .then((text) => setApiMessage(text))
      .catch(() => setApiMessage("Could not reach FlowSpace API 😢"));
  }, []);

  // helpers to persist state
  const updateProfile = (next: UserProfile | null) => {
    setProfile(next);
    if (!next) {
      window.localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    } else {
      window.localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(next));
    }
  };

  const saveQuizSet = (set: Omit<SavedQuizSet, "id" | "createdAt">) => {
    const newSet: SavedQuizSet = {
      ...set,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSavedQuizSets((prev) => {
      const next = [newSet, ...prev];
      window.localStorage.setItem(LOCAL_STORAGE_QUIZZES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteQuizSet = (id: string) => {
    setSavedQuizSets((prev) => {
      const next = prev.filter((q) => q.id !== id);
      window.localStorage.setItem(LOCAL_STORAGE_QUIZZES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isDark = theme === "dark";

  const navLinkStyle = (path: string) => ({
    background: location.pathname === path ? "var(--accent-soft)" : "transparent",
    borderRadius: "999px",
    padding: "0.25rem 0.9rem",
    border: "none",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(circle at top left, rgba(88,164,176,0.05), transparent 55%), radial-gradient(circle at bottom right, rgba(176,123,172,0.20), #15172b)"
          : "radial-gradient(circle at top left, rgba(88,164,176,0.14), transparent 55%), radial-gradient(circle at bottom right, rgba(176,123,172,0.18), transparent 55%)",
      }}
    >
      {/* top nav (shared across pages) */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--nav-bg)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <nav
          style={{
            maxWidth: "1040px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link
              to="/"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "999px",
                  backgroundColor: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "white", fontSize: "0.9rem" }}>✶</span>
              </div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                FlowSpace
              </span>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              fontSize: "0.95rem",
              alignItems: "center",
            }}
          >
            <Link to="/timer">
              <button style={navLinkStyle("/timer")}>Timer</button>
            </Link>
            <Link to="/quiz">
              <button style={navLinkStyle("/quiz")}>Quiz</button>
            </Link>
            <Link to="/safe-space">
              <button style={navLinkStyle("/safe-space")}>Safe Space</button>
            </Link>
            <Link to="/coach">
              <button style={navLinkStyle("/coach")}>Time Coach</button>
            </Link>
            <Link to="/profile">
              <button style={navLinkStyle("/profile")}>Profile</button>
            </Link>

            {/* theme toggle */}
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <span className="theme-toggle-pill">{isDark ? "🌙" : "☀️"}</span>
              <span>{isDark ? "Dark" : "Light"}</span>
            </button>
          </div>
        </nav>
      </header>

          {/* routed pages */}
          <Routes>
        <Route
          path="/"
          element={
            <HomePage
              apiMessage={apiMessage}
              theme={theme}
            />
          }
        />

        <Route
          path="/timer"
          element={
            <PageShell title="Focus Timer">
              <FlowTimer theme={theme} />
            </PageShell>
          }
        />
        <Route
          path="/quiz"
          element={
            <PageShell title="Quick Quiz">
              <QuickQuiz
                theme={theme}
                onSaveQuizSet={(set) =>
                  saveQuizSet({
                    title: set.title,
                    difficulty: set.difficulty,
                    questions: set.questions,
                  })
                }
              />
            </PageShell>
          }
        />
        <Route
          path="/safe-space"
          element={
            <PageShell title="Safe Space">
              <SafeSpace theme={theme} />
            </PageShell>
          }
        />
        <Route
          path="/coach"
          element={
            <PageShell title="Time & Priority Coach">
              <TimeCoach theme={theme} />
            </PageShell>
          }
        />
        <Route
          path="/profile"
          element={
            <PageShell title="Your FlowSpace profile">
              <ProfilePage
                profile={profile}
                onUpdateProfile={updateProfile}
                savedQuizSets={savedQuizSets}
                onDeleteQuizSet={deleteQuizSet}
              />
            </PageShell>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

    </div>
  );
}

type PageShellProps = {
  title: string;
  children: React.ReactNode;
};

function PageShell({ title, children }: PageShellProps) {
  return (
    <main
      style={{
        maxWidth: "1040px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem 4rem",
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.8rem" }}>
        {title}
      </h1>
      {children}
    </main>
  );
}

export default App;

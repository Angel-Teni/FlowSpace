// client/src/Components/ProfilePage.tsx
import React, { useState } from "react";
import type { SavedQuizSet, UserProfile } from "../App";

type ProfilePageProps = {
  profile: UserProfile | null;
  onUpdateProfile: (next: UserProfile | null) => void;
  savedQuizSets: SavedQuizSet[];
  onDeleteQuizSet: (id: string) => void;
};

type FocusVibe = "soft" | "steady" | "spicy";

type StoredProfileExtras = {
  email?: string;
  tagline: string;
  focusVibe: FocusVibe;
  capacity: number; // 0–100
  isLoggedIn: boolean;
};

const PROFILE_STORAGE_KEY = "flowspace_profile_extras_v1";

const DEFAULT_EXTRAS: StoredProfileExtras = {
  email: "",
  tagline: "",
  focusVibe: "soft",
  capacity: 50,
  isLoggedIn: false,
};

export function ProfilePage({
  profile,
  onUpdateProfile,
  savedQuizSets,
  onDeleteQuizSet,
}: ProfilePageProps) {
  const nameFromProps = profile?.name ?? "";

  // --- extras: load once from localStorage via lazy initializer ---
  const [extras, setExtras] = useState<StoredProfileExtras>(() => {
    if (typeof window === "undefined") return DEFAULT_EXTRAS;

    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return DEFAULT_EXTRAS;

      const parsed = JSON.parse(raw) as StoredProfileExtras;
      return {
        ...DEFAULT_EXTRAS,
        ...parsed,
      };
    } catch {
      return DEFAULT_EXTRAS;
    }
  });

  const [authEmail, setAuthEmail] = useState(extras.email ?? "");
  const [authPassword, setAuthPassword] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const persistExtras = (next: StoredProfileExtras) => {
    setExtras(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const handleNameChange = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onUpdateProfile(null);
    } else {
      onUpdateProfile({ name: trimmed });
    }
  };

  // fake login just for UX – keeps email + "logged in" in localStorage
  const handleLogin = () => {
    const email = authEmail.trim();
    if (!email || !authPassword.trim()) return;

    const next: StoredProfileExtras = {
      ...extras,
      email,
      isLoggedIn: true,
    };
    persistExtras(next);
    setAuthPassword("");
  };

  const handleLogout = () => {
    const next: StoredProfileExtras = {
      ...extras,
      isLoggedIn: false,
    };
    persistExtras(next);
    setAuthPassword("");
  };

  const handleSaveProfile = () => {
    persistExtras(extras);
    setSaveMessage("Profile saved ✨");
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const cardBase: React.CSSProperties = {
    borderRadius: "1.5rem",
    padding: "1.6rem 1.8rem",
    backgroundColor: "var(--bg-surface)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.22)",
    border: "1px solid rgba(148,163,184,0.35)",
    color: "var(--text-main)",
  };

  const fieldBase: React.CSSProperties = {
    width: "100%",
    marginTop: "0.45rem",
    padding: "0.6rem 0.8rem",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.35)",
    backgroundColor: "rgba(15,23,42,0.02)",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    color: "var(--text-main)",
  };

  return (
    <main
      style={{
        maxWidth: "1040px",
        margin: "0 auto",
        padding: "3rem 1.5rem 4rem",
      }}
    >
      {/* <h1
        style={{
          marginTop: 0,
          marginBottom: "1.25rem",
          fontSize: "1.9rem",
          textAlign: "left",
        }}
      >
        Your FlowSpace profile
      </h1> */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT: account + profile */}
        <section style={cardBase}>
          {/* header with login pill */}
          <div
            style={{
              marginBottom: "1.4rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "0.35rem",
                  fontSize: "1.1rem",
                }}
              >
                Your FlowSpace
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                }}
              >
                This is your no-shame corner. Set up a tiny profile so it feels
                like home.
              </p>
            </div>
            <div
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.5)",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
              }}
            >
              {extras.isLoggedIn && extras.email ? (
                <span>
                  Signed in as <strong>{extras.email}</strong>
                </span>
              ) : (
                <span>Guest mode</span>
              )}
            </div>
          </div>

          {/* fake login row */}
          <div
            style={{
              marginBottom: "1.6rem",
              padding: "0.9rem 1rem",
              borderRadius: "1.1rem",
              backgroundColor: "rgba(15,23,42,0.06)",
              border: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            <p
              style={{
                margin: 0,
                marginBottom: "0.5rem",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Sign in to keep this profile on this device. For now it&apos;s a
              gentle, local login – no real accounts yet.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1.3fr) auto",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <input
                type="email"
                placeholder="email for this profile"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={fieldBase}
              />
              <input
                type="password"
                placeholder="password (stored only on this device)"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={fieldBase}
              />
              {extras.isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: "0.55rem 0.9rem",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "var(--accent-soft)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLogin}
                  style={{
                    padding: "0.55rem 0.9rem",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>

          {/* profile form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem" }}>
              Name or alias
              <input
                style={fieldBase}
                placeholder="e.g. Geo girl, Study gremlin, Angel…"
                value={nameFromProps}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>

            <label style={{ display: "block", fontSize: "0.9rem" }}>
              Little tagline
              <input
                style={fieldBase}
                placeholder="e.g. ‘Doing my best, softly.’"
                value={extras.tagline}
                onChange={(e) =>
                  setExtras({
                    ...extras,
                    tagline: e.target.value,
                  })
                }
              />
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
                gap: "1rem",
                marginTop: "0.3rem",
              }}
            >
              <label style={{ fontSize: "0.9rem" }}>
                Study vibe today
                <select
                  style={fieldBase}
                  value={extras.focusVibe}
                  onChange={(e) =>
                    setExtras({
                      ...extras,
                      focusVibe: e.target.value as FocusVibe,
                    })
                  }
                >
                  <option value="soft">😌 Soft & gentle</option>
                  <option value="steady">🙂 Steady & normal</option>
                  <option value="spicy">🌶️ Spicy & ambitious</option>
                </select>
              </label>

              <label style={{ fontSize: "0.9rem" }}>
                Capacity meter
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={extras.capacity}
                  onChange={(e) =>
                    setExtras({
                      ...extras,
                      capacity: Number(e.target.value),
                    })
                  }
                  style={{ width: "100%", marginTop: "0.6rem" }}
                />
                <div
                  style={{
                    marginTop: "0.2rem",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Today I have{" "}
                  <strong>{extras.capacity}%</strong> battery for school things.
                </div>
              </label>
            </div>

            <div
              style={{
                marginTop: "0.8rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleSaveProfile}
                style={{
                  padding: "0.6rem 1.3rem",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Save profile
              </button>
            </div>

            {saveMessage && (
              <p
                style={{
                  marginTop: "0.4rem",
                  fontSize: "0.85rem",
                  color: "var(--accent)",
                }}
              >
                {saveMessage}
              </p>
            )}

            <p
              style={{
                marginTop: "0.6rem",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              {nameFromProps
                ? `Hi ${nameFromProps}! All the quiz sets you save will show up here so you can review them later.`
                : "You don't have to add a name if you don't want to. This space is still all yours."}
            </p>
          </div>
        </section>

        {/* RIGHT: saved quiz sets */}
        <section style={cardBase}>
          <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            Saved quiz sets
          </h3>
          {savedQuizSets.length === 0 ? (
            <p
              style={{
                marginTop: 0,
                fontSize: "0.9rem",
                color: "var(--text-muted)",
              }}
            >
              You haven&apos;t saved any quizzes yet. Generate a quiz in the{" "}
              <strong>Quiz</strong> tab and hit &quot;Save this quiz&quot; to
              have it show up here as a mini flashcard set.
            </p>
          ) : (
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
              {savedQuizSets.map((set) => (
                <li
                  key={set.id}
                  style={{
                    borderRadius: "14px",
                    padding: "0.9rem 1rem",
                    backgroundColor: "rgba(15,23,42,0.03)",
                    border: "1px solid rgba(148,163,184,0.4)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.6rem",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        marginBottom: "0.2rem",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {set.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {set.difficulty} · {set.questions.length} questions
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteQuizSet(set.id)}
                    style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: "999px",
                      border: "none",
                      backgroundColor: "rgba(248,113,113,0.12)",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

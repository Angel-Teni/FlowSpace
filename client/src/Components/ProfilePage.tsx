// client/src/Components/ProfilePage.tsx
import type { SavedQuizSet, UserProfile } from "../App";

type ProfilePageProps = {
  profile: UserProfile | null;
  onUpdateProfile: (next: UserProfile | null) => void;
  savedQuizSets: SavedQuizSet[];
  onDeleteQuizSet: (id: string) => void;
};

export function ProfilePage({
  profile,
  onUpdateProfile,
  savedQuizSets,
  onDeleteQuizSet,
}: ProfilePageProps) {
  const name = profile?.name ?? "";

  const handleNameChange = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      onUpdateProfile(null);
    } else {
      onUpdateProfile({ name: trimmed });
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
        gap: "2rem",
        alignItems: "flex-start",
      }}
    >
      {/* Left column – profile basics */}
      <section
        style={{
          borderRadius: "1.5rem",
          padding: "1.6rem 1.8rem",
          backgroundColor: "var(--bg-surface)",
          boxShadow: "0 14px 30px rgba(15,23,42,0.18)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Your FlowSpace</h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: "1rem",
            color: "var(--text-muted)",
            fontSize: "0.95rem",
          }}
        >
          This is your no-shame corner. Add a name or nickname and keep track of
          your saved quiz sets.
        </p>

        <label style={{ display: "block", fontSize: "0.9rem" }}>
          Name or alias
          <input
            style={{
              width: "100%",
              marginTop: "0.5rem",
              padding: "0.7rem 0.8rem",
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.12)",
              backgroundColor: "rgba(255,255,255,0.96)",
              fontSize: "0.95rem",
              boxSizing: "border-box",
            }}
            placeholder="e.g. Geo girl, Study gremlin, Angel…"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </label>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          {name
            ? `Hi ${name}! All the quiz sets you save will show up here so you can review them later.`
            : "You don't have to add a name if you don't want to. This space is still all yours."}
        </p>
      </section>

      {/* Right column – saved quizzes */}
      <section
        style={{
          borderRadius: "1.5rem",
          padding: "1.5rem 1.6rem",
          backgroundColor: "var(--bg-surface)",
          boxShadow: "0 14px 30px rgba(15,23,42,0.18)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Saved quiz sets</h3>
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
                  backgroundColor: "rgba(0,0,0,0.02)",
                  border: "1px solid rgba(0,0,0,0.04)",
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
                    backgroundColor: "rgba(255,99,132,0.1)",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
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
  );
}

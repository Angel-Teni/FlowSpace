import { FlowTimer } from "./FlowTimer";
//import { QuickQuiz } from "./QuickQuiz";
import { SafeSpace } from "./SafeSpace";
import { TimeCoach } from "./TimeCoach";

type Theme = "light" | "dark";

type HomePageProps = {
  apiMessage: string;
  theme: Theme;
};

export function HomePage({ apiMessage, theme }: HomePageProps) {
  const isDark = theme === "dark";

  return (
    <main
      style={{
        maxWidth: "1040px",
        margin: "0 auto",
        padding: "3rem 1.5rem 4rem",
      }}
    >
      {/* hero section (no nav here) */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: "2.5rem",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "0.8rem",
            }}
          >
            your no-shame study companion
          </p>
          <h1
            style={{
              fontSize: "2.8rem",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: "0.7rem",
            }}
          >
            brighten up
          </h1>
          <p
            style={{
              fontSize: "1.02rem",
              fontWeight: 500,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              marginBottom: "0.8rem",
            }}
          >
            flowspace brings you vibrant study tools made with heart.
          </p>
          <p style={{ maxWidth: "32rem", color: "var(--text-muted)" }}>
            Designed to make your study sessions glow — especially when school
            feels heavy and you need a softer way to focus, practice, and reset.
          </p>

          <div
            style={{
              marginTop: "1.8rem",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                padding: "0.7rem 1.7rem",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "var(--accent)",
                color: "white",
                fontWeight: 600,
                boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
              }}
            >
              Start a focus session
            </button>
            <button
              style={{
                padding: "0.7rem 1.7rem",
                borderRadius: "999px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
              }}
            >
              Preview tools
            </button>
          </div>

          <p
            style={{
              marginTop: "1.2rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            Backend status: <strong>{apiMessage}</strong>
          </p>
        </div>

        {/* hero image bubble */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: "999px",
              background:
                "radial-gradient(circle at 20% 20%, rgba(88,164,176,0.25), transparent 60%), radial-gradient(circle at 80% 80%, rgba(176,123,172,0.3), transparent 55%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 45px rgba(15,23,42,0.35)",
            }}
          >
            <div
              style={{
                width: 210,
                height: 210,
                borderRadius: "999px",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              {/* add an illustration or orbit later if you want */}
            </div>
          </div>
        </div>
      </section>

      {/* feature row + embedded tools */}
      <section
        style={{
          marginTop: "3rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          <FeatureCard
            title="Focus Timer"
            emoji="⏱"
            description="Adaptive focus timer with gentle lock-in levels, not grind culture."
          />
          <FeatureCard
            title="Smart Quiz"
            emoji="🧠"
            description="Turn your messy notes into friendly practice questions with AI."
          />
          <FeatureCard
            title="Safe Space"
            emoji="💗"
            description="Check-ins, encouragement, and grounding prompts for burnt-out days."
          />
        </div>

        {/* Timer card */}
        <div
          style={{
            borderRadius: "1.5rem",
            padding: "1.5rem",
            backgroundColor: isDark
              ? "rgba(15,17,38,0.95)"
              : "rgba(255,255,255,0.9)",
            boxShadow: isDark
              ? "0 16px 40px rgba(0,0,0,0.55)"
              : "0 16px 40px rgba(15,23,42,0.16)",
            color: "var(--text-main)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
            Try a gentle session
          </h3>
          <p
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: "var(--text-muted)",
            }}
          >
            Start small with a Soft Start lock-in level — no pressure, just
            easing back into focus.
          </p>
          <FlowTimer theme={theme} />
        </div>


        {/* Time & Priority Coach card */}
        <div
          style={{
            borderRadius: "1.5rem",
            padding: "1.5rem",
            marginTop: "2rem",
            backgroundColor: isDark
              ? "rgba(15,17,38,0.95)"
              : "rgba(255,255,255,0.9)",
            boxShadow: isDark
              ? "0 16px 40px rgba(0,0,0,0.55)"
              : "0 16px 40px rgba(15,23,42,0.16)",
            color: "var(--text-main)",
          }}
        >
          <TimeCoach theme={theme} />
        </div>

        {/* Safe Space card */}
        <div
          style={{
            borderRadius: "1.5rem",
            padding: "1.5rem",
            marginTop: "2rem",
            backgroundColor: isDark
              ? "rgba(15,17,38,0.95)"
              : "rgba(255,255,255,0.9)",
            boxShadow: isDark
              ? "0 16px 40px rgba(0,0,0,0.55)"
              : "0 16px 40px rgba(15,23,42,0.16)",
            color: "var(--text-main)",
          }}
        >
          <SafeSpace theme={theme} />
        </div>
      </section>
    </main>
  );
}

type FeatureCardProps = {
  title: string;
  emoji: string;
  description: string;
};

function FeatureCard({ title, emoji, description }: FeatureCardProps) {
  return (
    <div
      style={{
        borderRadius: "1.5rem",
        padding: "1.2rem 1.3rem",
        backgroundColor: "var(--bg-surface)",
        boxShadow: "0 10px 26px rgba(15,23,42,0.12)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "999px",
          backgroundColor: "var(--accent-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "0.75rem",
          fontSize: "1.4rem",
        }}
      >
        {emoji}
      </div>
      <h3 style={{ margin: 0, marginBottom: "0.4rem", fontSize: "1.05rem" }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
        {description}
      </p>
    </div>
  );
}

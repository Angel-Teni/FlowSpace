// client/src/Components/Homepage.tsx
import { Link } from "react-router-dom";
import { FlowSpaceLogo } from "./FlowSpaceLogo";


type Theme = "light" | "dark";

type HomePageProps = {
  apiMessage: string;
  theme: Theme;
};

export function HomePage({ apiMessage }: HomePageProps) {
  return (
    <main
      style={{
        maxWidth: "1040px",
        margin: "0 auto",
        padding: "3rem 1.5rem 4rem",
      }}
    >
      {/* hero section */}
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
            <Link to="/timer">
              <button
                style={{
                  padding: "0.7rem 1.7rem",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  fontWeight: 600,
                  boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                  cursor: "pointer",
                }}
              >
                Start a focus session
              </button>
            </Link>
            <Link to="/quiz">
              <button className="fs-btn-ghost preview-btn">
                Preview tools
              </button>
            </Link>
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FlowSpaceLogo />
    </div>
  </div>
</div>

      </section>

      {/* feature navigation row */}
      <section
        style={{
          marginTop: "3rem",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "1rem",
            fontSize: "1.3rem",
          }}
        >
          Choose where to start
        </h2>

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
            to="/timer"
            cta="Open timer"
          />
          <FeatureCard
            title="Smart Quiz"
            emoji="🧠"
            description="Turn your messy notes or PDFs into friendly practice questions with AI."
            to="/quiz"
            cta="Open quiz lab"
          />
          <FeatureCard
            title="Safe Space"
            emoji="💗"
            description="Check-ins, encouragement, and grounding prompts for burnt-out days."
            to="/safe-space"
            cta="Open safe space"
          />
        </div>

        <div
          style={{
            borderRadius: "1.5rem",
            padding: "1.5rem 1.4rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            Want help deciding? Try{" "}
            <Link
              to="/coach"
              style={{
                color: "var(--accent)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Time &amp; Priority Coach
            </Link>{" "}
            to gently plan your next 60–90 minutes.
          </p>
        </div>
      </section>
    </main>
  );
}

type FeatureCardProps = {
  title: string;
  emoji: string;
  description: string;
  to: string;
  cta: string;
};

function FeatureCard({ title, emoji, description, to, cta }: FeatureCardProps) {
  return (
    <div
      style={{
        borderRadius: "1.5rem",
        padding: "1.2rem 1.3rem",
        backgroundColor: "var(--bg-surface)",
        boxShadow: "0 10px 26px rgba(15,23,42,0.12)",
        border: "1px solid rgba(148,163,184,0.28)",
        display: "flex",
        flexDirection: "column",
        gap: "0.7rem",
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
          fontSize: "1.4rem",
        }}
      >
        {emoji}
      </div>
      <div>
        <h3
          style={{
            margin: 0,
            marginBottom: "0.2rem",
            fontSize: "1.05rem",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "var(--text-muted)",
          }}
        >
          {description}
        </p>
      </div>
      <div style={{ marginTop: "0.4rem" }}>
        <Link to={to}>
          <button
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.5)",
              backgroundColor: "transparent",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {cta}
          </button>
        </Link>
      </div>
    </div>
  );
}

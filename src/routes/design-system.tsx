import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import dsCss from "../styles/design-system.css?url";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: "Design System - Scholars Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "stylesheet", href: dsCss },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/FunnelDisplay-Variable-latin.woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: DesignSystem,
});

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const SCALES: { name: string; key: string; note: string; anchors: Record<number, string> }[] = [
  {
    name: "Blue",
    key: "blue",
    note: "Logo mark, hue 248°. Accent and actions.",
    anchors: { 700: "Logo" },
  },
  {
    name: "Ice",
    key: "ice",
    note: "Logo gradient, hue 234°. Light surfaces and text on dark.",
    anchors: { 100: "Logo top", 300: "Logo bottom" },
  },
  {
    name: "Neutral",
    key: "neutral",
    note: "Blue-tinted grays. Text, hairlines, most surfaces.",
    anchors: {},
  },
];
const HEX: Record<string, string[]> = {
  blue: [
    "#f1f8ff",
    "#e0effd",
    "#c3dcf6",
    "#9ac2e9",
    "#6ea4d7",
    "#4685bf",
    "#2b6da6",
    "#185689",
    "#0b426d",
    "#083050",
    "#041c31",
  ],
  ice: [
    "#f6fbfe",
    "#e8f3f9",
    "#d8e7f0",
    "#c7d9e5",
    "#abc2d0",
    "#89a3b2",
    "#6a8494",
    "#4f6775",
    "#374b56",
    "#23333c",
    "#111c23",
  ],
  neutral: [
    "#f8fafc",
    "#f1f4f7",
    "#e3e7eb",
    "#d0d5da",
    "#9ca2a9",
    "#6b727a",
    "#4f565e",
    "#384149",
    "#242c35",
    "#101922",
    "#060f18",
  ],
};

function Block({
  title,
  intro,
  children,
  dark = false,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={`ds-section ${dark ? "ds-dark" : ""}`}>
      <div className="ds-container">
        <div style={{ display: "grid", gap: 16, maxWidth: 640, marginBottom: 64 }}>
          <h2 className="ds-h2">{title}</h2>
          {intro && (
            <p className="ds-lead" style={{ margin: 0 }}>
              {intro}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function DesignSystem() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="ds">
      {/* Cover */}
      <header
        className="ds-dark"
        style={{ minHeight: "88vh", display: "flex", alignItems: "flex-end" }}
      >
        <div className="ds-container" style={{ width: "100%", paddingBlock: "160px 96px" }}>
          <img
            src="/brand/mark-ice.webp"
            alt="Scholars Cafe"
            width={160}
            height={144}
            style={{ height: 56, width: "auto" }}
          />
          <h1 className="ds-display" style={{ marginTop: 96, maxWidth: "11ch" }}>
            Quiet confidence.
          </h1>
          <p className="ds-lead" style={{ marginTop: 32, maxWidth: 520 }}>
            The Scholars Cafe design system. Restraint first: one typeface, three tonal families
            from the logo, and space doing most of the work.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 48 }}>
            <a className="ds-btn" href="#color">
              Explore the system
            </a>
            <a className="ds-btn ds-btn--secondary" href="#type">
              Typography
            </a>
          </div>
        </div>
      </header>

      {/* Logo */}
      <Block
        title="Mark"
        intro="The icon carries the brand on its own. The wordmark appears only in the footer and formal contexts."
      >
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <div
            className="ds-card"
            style={{ display: "grid", placeItems: "center", aspectRatio: "4 / 3" }}
          >
            <img
              src="/brand/mark-blue.webp"
              alt="Icon on light"
              style={{ height: 88, width: "auto" }}
            />
          </div>
          <div
            className="ds-card ds-dark"
            style={{ display: "grid", placeItems: "center", aspectRatio: "4 / 3", border: 0 }}
          >
            <img
              src="/brand/mark-ice.webp"
              alt="Icon on dark"
              style={{ height: 88, width: "auto" }}
            />
          </div>
          <div
            className="ds-card"
            style={{
              display: "grid",
              placeItems: "center",
              aspectRatio: "4 / 3",
              background: "var(--surface-ice)",
              border: 0,
            }}
          >
            <img
              src="/brand/lockup-blue.webp"
              alt="Wordmark (footer only)"
              style={{ height: 56, width: "auto" }}
            />
          </div>
        </div>
      </Block>

      {/* Color */}
      <div id="color" />
      <Block
        title="Color"
        intro="Three families generated from the logo in OKLCH, keeping each hue exact. About 90% of any screen is neutral; blue is reserved for actions, focus and key highlights."
      >
        <div style={{ display: "grid", gap: 56 }}>
          {SCALES.map((s) => (
            <div key={s.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <h3 className="ds-h4">{s.name}</h3>
                <span className="ds-small">{s.note}</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(84px, 1fr))",
                  gap: 8,
                }}
              >
                {STEPS.map((step, i) => (
                  <div key={step}>
                    <div
                      style={{
                        background: `var(--color-${s.key}-${step})`,
                        height: 72,
                        borderRadius: 12,
                        boxShadow: step <= 100 ? "inset 0 0 0 1px var(--hairline)" : undefined,
                      }}
                    />
                    <div className="ds-label" style={{ marginTop: 8, color: "var(--text)" }}>
                      {step}
                      {s.anchors[step] && (
                        <span style={{ color: "var(--accent)" }}> · {s.anchors[step]}</span>
                      )}
                    </div>
                    <div className="ds-mono">{HEX[s.key][i]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="ds-h4" style={{ marginBottom: 16 }}>
              Proportion
            </h3>
            <div
              style={{
                display: "flex",
                height: 56,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "inset 0 0 0 1px var(--hairline)",
              }}
            >
              <div style={{ flex: 62, background: "#fff" }} />
              <div style={{ flex: 18, background: "var(--color-neutral-50)" }} />
              <div style={{ flex: 10, background: "var(--color-blue-950)" }} />
              <div style={{ flex: 6, background: "var(--color-ice-100)" }} />
              <div style={{ flex: 4, background: "var(--color-blue-700)" }} />
            </div>
            <p className="ds-small" style={{ marginTop: 12 }}>
              White and neutral surfaces, deep blue for hero and key bands, ice for quiet emphasis,
              logo blue as the accent. All text pairings meet WCAG AA (body 10.4:1, muted 7.4:1,
              buttons 7.7:1, text on dark 17.3:1).
            </p>
          </div>
        </div>
      </Block>

      {/* Type */}
      <div id="type" />
      <Block
        title="Typography"
        intro="Funnel Display, self-hosted as one variable file. Light weights at large sizes, tight tracking, generous line height for reading. Inter only for small text."
      >
        <div style={{ display: "grid", gap: 0 }}>
          {[
            [
              "Display · 120/0.95 · Light · -3%",
              <div key="d" className="ds-display">
                Beyond borders.
              </div>,
            ],
            [
              "H1 · 80/1.0 · Light · -3%",
              <h1 key="1" className="ds-h1">
                Your future, mapped.
              </h1>,
            ],
            [
              "H2 · 56/1.05 · Regular · -2.5%",
              <h2 key="2" className="ds-h2">
                Twelve destinations, one plan.
              </h2>,
            ],
            [
              "H3 · 32/1.15 · Medium · -2%",
              <h3 key="3" className="ds-h3">
                Full scholarship track
              </h3>,
            ],
            [
              "H4 · 20/1.3 · Medium · -1%",
              <h4 key="4" className="ds-h4">
                Strategy and roadmap
              </h4>,
            ],
            [
              "Lead · 22/1.5 · Light",
              <p key="l" className="ds-lead" style={{ margin: 0, maxWidth: 640 }}>
                Mentorship from your first conversation to the day your visa is approved.
              </p>,
            ],
            [
              "Body · Inter 16/1.65",
              <p key="b" style={{ margin: 0, maxWidth: 640 }}>
                We help ambitious students build a clear plan, write applications that sound like
                them, and secure the funding to go.
              </p>,
            ],
            [
              "Small · Inter 14/1.6",
              <p key="s" className="ds-small" style={{ margin: 0 }}>
                Replies within 24 hours on weekdays.
              </p>,
            ],
            [
              "Label · Inter 13 · Medium",
              <span key="la" className="ds-label">
                Application deadline
              </span>,
            ],
          ].map(([meta, el], i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "minmax(0,1fr)",
                padding: "32px 0",
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <span className="ds-mono">{meta as string}</span>
              {el}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32, marginTop: 48 }}>
          {[300, 400, 500, 600, 700, 800].map((w) => (
            <div key={w}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: w,
                  fontSize: 48,
                  letterSpacing: "-0.03em",
                  color: "var(--text)",
                  lineHeight: 1,
                }}
              >
                Aa
              </div>
              <div className="ds-mono" style={{ marginTop: 8 }}>
                {w}
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* Buttons */}
      <Block
        title="Actions"
        intro="One primary action per view. Hover lifts gently, press settles, focus is always visible."
      >
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <div className="ds-card" style={{ display: "grid", gap: 24 }}>
            <span className="ds-label">On light</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <button className="ds-btn">Book a strategy call</button>
              <button className="ds-btn ds-btn--secondary">View programs</button>
              <button className="ds-btn ds-btn--quiet">Read more →</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <button
                className="ds-btn"
                aria-busy={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1800);
                }}
              >
                {loading ? (
                  <>
                    <span className="ds-spinner" aria-hidden /> Sending
                  </>
                ) : (
                  "Click for loading"
                )}
              </button>
              <button className="ds-btn" disabled>
                Disabled
              </button>
              <button className="ds-btn ds-btn--sm">Small</button>
            </div>
          </div>
          <div className="ds-card ds-dark" style={{ display: "grid", gap: 24, border: 0 }}>
            <span className="ds-label" style={{ color: "var(--color-ice-500)" }}>
              On dark
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button className="ds-btn">Book a strategy call</button>
              <button className="ds-btn ds-btn--secondary">View programs</button>
            </div>
          </div>
        </div>
      </Block>

      {/* Fields & states */}
      <Block
        title="Fields and states"
        intro="Every state is designed: rest, focus, error, disabled, loading and empty."
      >
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <label className="ds-field">
            <span className="ds-label" style={{ color: "var(--text)" }}>
              Full name
            </span>
            <input className="ds-input" placeholder="Your name" />
            <span className="ds-help">Click to see the focus ring.</span>
          </label>
          <label className="ds-field">
            <span className="ds-label" style={{ color: "var(--text)" }}>
              Email
            </span>
            <input className="ds-input" defaultValue="student@" aria-invalid="true" />
            <span className="ds-help ds-help--error">Enter a complete email address.</span>
          </label>
          <label className="ds-field">
            <span className="ds-label" style={{ color: "var(--text)" }}>
              Mentor
            </span>
            <input className="ds-input" value="Assigned after your first call" disabled readOnly />
            <span className="ds-help">Disabled</span>
          </label>
        </div>
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            marginTop: 48,
          }}
        >
          <div className="ds-card" style={{ display: "grid", gap: 12 }} aria-label="Loading">
            <div className="ds-skeleton" style={{ height: 20, width: "60%" }} />
            <div className="ds-skeleton" style={{ height: 14 }} />
            <div className="ds-skeleton" style={{ height: 14, width: "80%" }} />
          </div>
          <div
            className="ds-card"
            style={{ textAlign: "center", display: "grid", gap: 8, placeItems: "center" }}
          >
            <h4 className="ds-h4">No lessons yet</h4>
            <p className="ds-small" style={{ margin: 0 }}>
              Your mentor will add your first module after onboarding.
            </p>
          </div>
          <div
            className="ds-card"
            role="alert"
            style={{ display: "grid", gap: 8, borderColor: "rgb(179 38 30 / 0.25)" }}
          >
            <h4 className="ds-h4" style={{ color: "var(--danger)" }}>
              Couldn't send
            </h4>
            <p className="ds-small" style={{ margin: 0 }}>
              Check your connection and try again. Nothing was lost.
            </p>
          </div>
        </div>
      </Block>

      {/* Cards */}
      <Block title="Cards" intro="Hairline borders at rest; depth appears only on interaction.">
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {["United States", "United Kingdom", "Germany"].map((c, i) => (
            <a
              key={c}
              href="#color"
              className="ds-card ds-card--interactive"
              style={{ display: "grid", gap: 64, textDecoration: "none" }}
            >
              <span className="ds-mono">0{i + 1}</span>
              <div>
                <h3 className="ds-h3">{c}</h3>
                <p className="ds-small" style={{ margin: "8px 0 0" }}>
                  Hover to see elevation.
                </p>
              </div>
            </a>
          ))}
        </div>
      </Block>

      {/* Space, radius, depth, motion */}
      <Block
        title="Space and depth"
        intro="Everything sits on an 8px grid. Sections breathe at 96–160px."
      >
        <div style={{ display: "grid", gap: 12 }}>
          {[8, 16, 24, 32, 48, 64, 96, 128, 160, 200].map((v) => (
            <div key={v} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span className="ds-mono" style={{ width: 48 }}>
                {v}
              </span>
              <div
                style={{
                  height: 8,
                  width: v,
                  background: "var(--color-blue-700)",
                  borderRadius: 4,
                  opacity: 0.85,
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            marginTop: 64,
          }}
        >
          {[
            ["Radius 8 · fields", 8, "none"],
            ["Radius 16 · media", 16, "var(--shadow-sm)"],
            ["Radius 24 · cards", 24, "var(--shadow-md)"],
            ["Shadow large · overlays", 24, "var(--shadow-lg)"],
          ].map(([label, r, sh]) => (
            <div
              key={label as string}
              style={{
                height: 140,
                borderRadius: r as number,
                boxShadow: sh as string,
                background: "#fff",
                border: "1px solid var(--hairline)",
                display: "grid",
                placeItems: "end start",
                padding: 16,
              }}
            >
              <span className="ds-label">{label as string}</span>
            </div>
          ))}
        </div>
        <p className="ds-small" style={{ marginTop: 32 }}>
          Motion: cubic-bezier(0.22, 1, 0.36, 1), 400–800ms. No bounce, no overshoot; respects
          reduced-motion.
        </p>
      </Block>

      <footer className="ds-dark">
        <div
          className="ds-container"
          style={{
            paddingBlock: 64,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <img
            src="/brand/lockup-ice.webp"
            alt="Scholars Cafe"
            style={{ height: 40, width: "auto" }}
          />
          <span className="ds-small" style={{ color: "var(--color-ice-500)" }}>
            Style tile · not linked from the site
          </span>
        </div>
      </footer>
    </div>
  );
}

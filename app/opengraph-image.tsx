import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Phenotype - AI Ancestry & Heritage Analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* DNA Helix Background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="600" height="600" viewBox="0 0 100 100" fill="none">
            <path
              d="M30 10 Q50 30 70 10 Q50 30 30 50 Q50 70 70 50 Q50 70 30 90"
              stroke="#8B5CF6"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M70 10 Q50 30 30 10 Q50 30 70 50 Q50 70 30 50 Q50 70 70 90"
              stroke="#6366F1"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Phenotype
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "white",
            textAlign: "center",
            marginBottom: 40,
            maxWidth: 800,
          }}
        >
          AI Ancestry & Heritage Analysis
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 40,
          }}
        >
          {[
            { label: "Facial Analysis", icon: "👤" },
            { label: "Ancestry Matching", icon: "🧬" },
            { label: "Heritage Reports", icon: "📊" },
          ].map((feature) => (
            <div
              key={feature.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 30px",
                borderRadius: 16,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span style={{ fontSize: 32, marginBottom: 8 }}>{feature.icon}</span>
              <span style={{ fontSize: 18, color: "#9ca3af" }}>{feature.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            color: "#6b7280",
            fontSize: 24,
          }}
        >
          phenotype.app
        </div>
      </div>
    ),
    { ...size }
  );
}

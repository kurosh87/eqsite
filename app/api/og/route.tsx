import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title") || "Phenotype Analysis";
  const match = searchParams.get("match") || "";
  const confidence = searchParams.get("confidence") || "";
  const region = searchParams.get("region") || "";

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
        {/* Logo and Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "white",
            }}
          >
            Phenotype
          </span>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            marginBottom: 20,
            maxWidth: 900,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Match info if provided */}
        {match && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 40px",
                borderRadius: 16,
                background: "rgba(139, 92, 246, 0.2)",
                border: "2px solid rgba(139, 92, 246, 0.4)",
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  color: "#a78bfa",
                  marginBottom: 8,
                }}
              >
                Top Match
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {match}
              </span>
              {region && (
                <span
                  style={{
                    fontSize: 18,
                    color: "#9ca3af",
                    marginTop: 4,
                  }}
                >
                  {region}
                </span>
              )}
            </div>

            {confidence && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px 40px",
                  borderRadius: 16,
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "2px solid rgba(16, 185, 129, 0.4)",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    color: "#34d399",
                    marginBottom: 8,
                  }}
                >
                  Confidence
                </span>
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {confidence}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            color: "#6b7280",
            fontSize: 20,
          }}
        >
          phenotype.app • AI Ancestry Analysis
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters
    const title = searchParams.get("title") || "Free AI Prompt Marketplace";
    const category = searchParams.get("category") || "General";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#0b0f19",
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)",
            padding: "80px",
            boxSizing: "border-box",
          }}
        >
          {/* Top Brand Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#000",
                  fontSize: "20px",
                  fontWeight: "bold",
                  fontFamily: "sans-serif",
                }}
              >
                F
              </span>
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ffffff",
                fontFamily: "sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              freeprompts.store
            </span>
          </div>

          {/* Middle Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "24px",
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <span
                style={{
                  color: "#f59e0b",
                  fontSize: "16px",
                  fontWeight: "semibold",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: "sans-serif",
                }}
              >
                {category}
              </span>
            </div>
            <span
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#ffffff",
                fontFamily: "sans-serif",
                lineHeight: "1.2",
                letterSpacing: "-1px",
              }}
            >
              {title.length > 60 ? `${title.substring(0, 57)}...` : title}
            </span>
          </div>

          {/* Bottom Footer Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "32px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: "#9ca3af",
                fontFamily: "sans-serif",
              }}
            >
              Copy-Paste Free AI Prompt Templates
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  color: "#f59e0b",
                  fontSize: "18px",
                  fontWeight: "bold",
                  fontFamily: "sans-serif",
                }}
              >
                ★
              </span>
              <span
                style={{
                  fontSize: "18px",
                  color: "#ffffff",
                  fontWeight: "semibold",
                  fontFamily: "sans-serif",
                }}
              >
                4.9/5 Rating
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(`OG image generation failed: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

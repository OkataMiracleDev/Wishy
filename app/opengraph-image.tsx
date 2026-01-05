import { ImageResponse } from "next/og";
export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 20% 20%, #3b0764 0%, #0a0a0a 60%), radial-gradient(circle at 80% 30%, #9d174d 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 32,
            padding: 48,
            width: "86%",
            backgroundColor: "rgba(22, 22, 24, 0.75)",
            border: "2px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 100 }}>🦄</div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -1,
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Wishy
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#d1d5db",
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            Dream, Plan, Save — build wishlists and track savings with a clean dashboard.
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 22,
              color: "#a78bfa",
            }}
          >
            wishy-app.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: size.width, height: size.height }
  );
}

import { ImageResponse } from "next/server";

export const size = {
  width: 800,
  height: 418,
};

export const contentType = "image/png";

export default function TwitterImage() {
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
            flexDirection: "row",
            gap: 24,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            padding: 32,
            width: "86%",
            backgroundColor: "rgba(22, 22, 24, 0.75)",
            border: "2px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 72 }}>🦄</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: -1,
                color: "#ffffff",
              }}
            >
              Wishy
            </div>
            <div style={{ fontSize: 22, color: "#d1d5db" }}>
              Dream, Plan, Save — build wishlists and track savings.
            </div>
          </div>
        </div>
      </div>
    ),
    { size }
  );
}


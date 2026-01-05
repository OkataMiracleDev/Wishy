import { ImageResponse } from "next/server";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
            "radial-gradient(circle at 50% 50%, #7c3aed 0%, #0a0a0a 65%)",
          color: "#ffffff",
          fontSize: 96,
        }}
      >
        🦄
      </div>
    ),
    { size }
  );
}


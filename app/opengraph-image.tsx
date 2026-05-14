import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "C4U — You are not alone.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #0d4a45 50%, #1e1b4b 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(13,148,136,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0d9488, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          <div style={{ color: "white", fontSize: "42px" }}>♥</div>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: "transparent",
            backgroundImage: "linear-gradient(90deg, #5eead4, #a78bfa)",
            backgroundClip: "text",
            marginBottom: "16px",
            letterSpacing: "-2px",
          }}
        >
          C4U
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            color: "rgba(255,255,255,0.85)",
            fontWeight: 500,
            marginBottom: "40px",
            letterSpacing: "0.5px",
          }}
        >
          You are not alone.
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "16px" }}>
          {["AI Support Exercises", "Guided Meditations", "AI Companion"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 22px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "18px",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            color: "rgba(255,255,255,0.35)",
            fontSize: "20px",
          }}
        >
          c4ucare.netlify.app
        </div>
      </div>
    ),
    { ...size }
  );
}

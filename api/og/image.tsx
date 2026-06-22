import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Garage sale").slice(0, 90);
  const subtitle = (searchParams.get("subtitle") || "Tap to browse, buy, or offer").slice(0, 140);
  const price = (searchParams.get("price") || "").slice(0, 24);
  const badge = (searchParams.get("badge") || "Open garage").slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(155deg, #FFF9F0 0%, #FDE9C3 38%, #0D5C3A 100%)",
          padding: "48px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            backgroundColor: "#F0B429",
            color: "#0D5C3A",
            fontSize: 28,
            fontWeight: 800,
            padding: "10px 22px",
            borderRadius: 999,
          }}
        >
          {badge}
        </div>
        {price ? (
          <div
            style={{
              fontSize: 58,
              fontWeight: 800,
              color: "#F0B429",
              marginBottom: 10,
              textShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
          >
            {price}
          </div>
        ) : null}
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.12,
            maxWidth: 980,
            textShadow: "0 2px 16px rgba(0,0,0,0.28)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.9)",
            marginTop: 18,
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Generated at build/request time from the same brand mark used in the
 * Header/Footer ("fd" on the brand gradient) — no separate image asset to
 * keep in sync. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: "linear-gradient(120deg, #078b9a, #12afc2 50%, #8fc93b)",
          color: "white",
          fontSize: 30,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        fd
      </div>
    ),
    { ...size },
  );
}

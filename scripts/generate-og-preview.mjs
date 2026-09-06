import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const root = process.cwd();
const baseImage = readFileSync(resolve(root, "src/imports/og/evorios-og-base.png")).toString("base64");

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${baseImage}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>
  <rect x="0" y="0" width="510" height="630" fill="url(#leftShade)"/>
  <defs>
    <linearGradient id="leftShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#063E29" stop-opacity="0.96"/>
      <stop offset="0.78" stop-color="#063E29" stop-opacity="0.86"/>
      <stop offset="1" stop-color="#063E29" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="54" y="54" width="122" height="26" rx="13" fill="#F59E0B"/>
  <g transform="translate(64 286)">
    <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="#FFFFFF" letter-spacing="-1.8">Evorios</text>
    <text x="0" y="82" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800" fill="#FDE68A" letter-spacing="-0.9">More around you</text>
    <text x="0" y="132" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800" fill="#FDE68A" letter-spacing="-0.9">than you think.</text>
    <text x="0" y="196" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="650" fill="#EAF7EF">Rent · Sell · Gift</text>
  </g>
</svg>`;

const png = new Resvg(svg, {
  fitTo: {
    mode: "width",
    value: 1200,
  },
}).render().asPng();

writeFileSync(resolve(root, "public/og/evorios-share-v2.png"), png);

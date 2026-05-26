import twemoji from "twemoji";
import fs from "fs";

const files = ["src/app/data/subcategories.ts", "src/app/components/HomeFeed.tsx"];
const emojiRe = /emoji: "([^"]+)"/g;
const set = new Set();

for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  let m;
  while ((m = emojiRe.exec(text))) set.add(m[1]);
}
set.add("📷");

const base = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/";
const missing = [];

for (const emoji of [...set].sort()) {
  const cp = twemoji.convert.toCodePoint(emoji.trim()).replace(/-fe0f/g, "");
  const url = `${base}${cp}.svg`;
  const res = await fetch(url, { method: "HEAD" });
  if (!res.ok) missing.push({ emoji, cp, url, status: res.status });
}

console.log(`Total: ${set.size}`);
console.log(`Missing: ${missing.length}`);
for (const m of missing) console.log(JSON.stringify(m));

import { useState } from "react";
import twemoji from "twemoji";

const TWEMOJI_CDN = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets";

export function getTwemojiSrc(emoji: string): string {
  const codePoint = twemoji.convert
    .toCodePoint(emoji.trim())
    .replace(/-fe0f/g, "");
  return `${TWEMOJI_CDN}/svg/${codePoint}.svg`;
}

export function Emoji({
  emoji,
  size = 28,
  className = "",
}: {
  emoji: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`inline-block shrink-0 select-none leading-none ${className}`}
        style={{ fontSize: size }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={getTwemojiSrc(emoji)}
      alt=""
      aria-hidden="true"
      draggable={false}
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

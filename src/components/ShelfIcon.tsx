import type { CategoryGlyphId } from "./categoryGlyphs";
import { CategoryGlyph } from "./categoryGlyphs";
import { Emoji } from "../app/components/Emoji";

type ShelfIconSource = {
  emoji: string;
  glyph?: CategoryGlyphId;
};

/** Renders a custom SVG glyph when set, otherwise Twemoji. */
export function ShelfIcon({
  source,
  size = 28,
  className = "",
  inverted = false,
}: {
  source: ShelfIconSource | null | undefined;
  size?: number;
  className?: string;
  inverted?: boolean;
}) {
  if (!source) return null;
  if (source.glyph) {
    // SVGs read smaller than Twemoji at the same box — bump optical size.
    const glyphSize = Math.round(size * 1.28);
    return (
      <CategoryGlyph
        id={source.glyph}
        size={glyphSize}
        className={className}
        inverted={inverted}
      />
    );
  }
  return <Emoji emoji={source.emoji} size={size} className={className} />;
}

import type { CategoryGlyphId } from "./categoryGlyphs";
import { CategoryGlyph } from "./categoryGlyphs";
import { subcategoryArtSrc, type SubcategoryArtId } from "./subcategoryArt";
import { Emoji } from "../app/components/Emoji";

type ShelfIconSource = {
  emoji: string;
  glyph?: CategoryGlyphId;
  art?: SubcategoryArtId;
};

/** Renders a shelf's illustration when drawn, then a custom SVG, then Twemoji. */
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

  const art = subcategoryArtSrc(source.art);
  if (art) {
    return (
      <img
        src={art}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className={`inline-block shrink-0 select-none object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

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

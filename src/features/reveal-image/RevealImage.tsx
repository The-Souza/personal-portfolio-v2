import type { RevealEffect } from "@/features/reveal-image/effects";
import { cn } from "@/lib/utils";

interface RevealImageProps {
  effect: RevealEffect;
  seed: number;
  /** Text on the placeholder art, e.g. "imagem · vazia". */
  placeholderLabel: string;
  /** Describes the image for screen readers; omit when the image is decorative. */
  alt?: string;
  className?: string;
}

/**
 * Brief section 9. The server renders a CSS placeholder that reads without JS; the client
 * paints the placeholder art on the canvas through `createReveal` and plays the effect.
 * When the screenshots arrive, a next/image goes here, under the canvas, with the same `alt`.
 */
export function RevealImage({ effect, seed, placeholderLabel, alt, className }: RevealImageProps) {
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      className={cn("relative overflow-hidden bg-secondary", className)}
    >
      <span className="absolute bottom-4 left-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {placeholderLabel}
      </span>
      <canvas
        data-reveal={effect}
        data-seed={seed}
        data-label={placeholderLabel}
        aria-hidden="true"
        className="absolute inset-0 size-full [image-rendering:pixelated]"
      />
    </div>
  );
}

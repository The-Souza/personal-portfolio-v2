import Image from "next/image";
import type { RevealEffect } from "@/features/reveal-image/effects";
import { cn } from "@/lib/utils";

interface RevealImageProps {
  effect: RevealEffect;
  seed: number;
  /** Text on the placeholder art, e.g. "imagem · vazia". */
  placeholderLabel: string;
  /** The image, from public/, with its real size: it shows whole, in its own shape. Placeholder art without one. */
  image?: { src: string; width: number; height: number };
  /** next/image `sizes`, so phones don't download the desktop width. */
  sizes?: string;
  /** Describes the image for screen readers; omit when the image is decorative. */
  alt?: string;
  className?: string;
}

/**
 * Brief section 9. The real image is always in the DOM (next/image, with its `alt`); the effect
 * is an aria-hidden canvas on top that draws it and clears at the end (see `createReveal`).
 * Without JS or with reduced motion the image just shows. Without an image, a CSS placeholder
 * that reads without JS, and the placeholder art on the canvas (the wrapper sets the size).
 */
export function RevealImage({ effect, seed, placeholderLabel, image, sizes = "100vw", alt, className }: RevealImageProps) {
  return (
    <div
      role={!image && alt ? "img" : undefined}
      aria-label={!image ? alt : undefined}
      aria-hidden={!image && !alt ? true : undefined}
      className={cn("relative overflow-hidden", !image && "bg-secondary", className)}
    >
      {!image && (
        <span className="absolute bottom-4 left-4 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {placeholderLabel}
        </span>
      )}
      {image && (
        <Image
          data-reveal-image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={alt ?? ""}
          sizes={sizes}
          // Not lazy: the cards sit in a clipped, transformed track, where the browser's lazy
          // loading never sees them on screen. Low priority keeps them behind the hero.
          loading="eager"
          fetchPriority="low"
          // Hidden only while the canvas will reveal it (one rule: a separate `data-shown:opacity-100`
          // ties in specificity and loses to the order in the CSS).
          className="block h-auto w-full transition-opacity duration-300 ease-entrance js:motion-safe:not-data-shown:opacity-0"
        />
      )}
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

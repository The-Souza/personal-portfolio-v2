/** Brief section 4.1. Keep in step with the `tablet` breakpoint and the `short` variant in globals.css. */
export const BREAKPOINTS = {
  narrowBelowWidth: 720,
  shortBelowHeight: 600,
} as const;

export type ActVariant = "full" | "narrow" | "short" | "static";

export const MEDIA = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  short: `(max-height: ${BREAKPOINTS.shortBelowHeight - 0.02}px)`,
  narrow: `(max-width: ${BREAKPOINTS.narrowBelowWidth - 0.02}px)`,
  /** The `phone` breakpoint (35rem) in globals.css, and up. */
  phoneUp: "(min-width: 35rem)",
} as const;

/** One condition per variant, for `gsap.matchMedia()` inside each act. */
export const ACT_VARIANT_CONDITIONS: Record<ActVariant, string> = {
  static: MEDIA.reducedMotion,
  short: `${MEDIA.short} and (prefers-reduced-motion: no-preference)`,
  narrow: `${MEDIA.narrow} and (min-height: ${BREAKPOINTS.shortBelowHeight}px) and (prefers-reduced-motion: no-preference)`,
  full: `(min-width: ${BREAKPOINTS.narrowBelowWidth}px) and (min-height: ${BREAKPOINTS.shortBelowHeight}px) and (prefers-reduced-motion: no-preference)`,
};

/** Reduced motion wins over everything, then a short screen over a narrow one. */
export function variantFromMatches({ reducedMotion, short, narrow }: { reducedMotion: boolean; short: boolean; narrow: boolean }): ActVariant {
  if (reducedMotion) return "static";
  if (short) return "short";
  if (narrow) return "narrow";
  return "full";
}

export function resolveActVariant({ width, height, reducedMotion }: { width: number; height: number; reducedMotion: boolean }) {
  return variantFromMatches({
    reducedMotion,
    short: height < BREAKPOINTS.shortBelowHeight,
    narrow: width < BREAKPOINTS.narrowBelowWidth,
  });
}

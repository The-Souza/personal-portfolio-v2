"use client";

import { useSyncExternalStore } from "react";
import { type ActVariant, MEDIA, variantFromMatches } from "@/lib/motion/breakpoints";

const QUERIES = [MEDIA.reducedMotion, MEDIA.short, MEDIA.narrow];

function subscribe(onChange: () => void) {
  const lists = QUERIES.map((query) => window.matchMedia(query));
  for (const list of lists) list.addEventListener("change", onChange);
  return () => {
    for (const list of lists) list.removeEventListener("change", onChange);
  };
}

function getSnapshot(): ActVariant {
  const matches = (query: string) => window.matchMedia(query).matches;
  return variantFromMatches({
    reducedMotion: matches(MEDIA.reducedMotion),
    short: matches(MEDIA.short),
    narrow: matches(MEDIA.narrow),
  });
}

/** `null` on the server and during hydration; acts render the same HTML in every variant. */
export function useActVariant(): ActVariant | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

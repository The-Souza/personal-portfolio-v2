"use client";

import { useSyncExternalStore } from "react";
import { MEDIA } from "@/lib/motion/breakpoints";

function subscribe(onChange: () => void) {
  const list = window.matchMedia(MEDIA.reducedMotion);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MEDIA.reducedMotion).matches,
    () => false,
  );
}

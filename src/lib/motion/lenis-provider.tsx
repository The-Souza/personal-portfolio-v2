"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { type ReactNode, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ScrollTarget = string | HTMLElement | number;

// Module-level on purpose: the page has one Lenis, and the controls must work
// from anywhere (the drawer, the boot) without re-rendering when it changes.
let instance: Lenis | null = null;
// The boot asks to stop before the provider's effect creates Lenis (children's effects run
// first), so the request is kept and applied when the instance appears.
let stopRequested = false;

const controls = {
  /** Locks scrolling, e.g. while the drawer or the boot is on screen. */
  stop: () => {
    stopRequested = true;
    instance?.stop();
  },
  start: () => {
    stopRequested = false;
    instance?.start();
  },
  scrollTo: (target: ScrollTarget) => {
    if (instance) {
      instance.scrollTo(target);
      return;
    }
    if (typeof target === "number") window.scrollTo(0, target);
    else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
  },
};

export function useLenis() {
  return controls;
}

/** Internal links (`#about`) scroll with Lenis; Lenis alone would let the browser jump first. */
function onAnchorClick(event: MouseEvent) {
  if (!instance || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
  const hash = link?.getAttribute("href");
  if (!hash || hash === "#") return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;

  event.preventDefault();
  instance.scrollTo(target);
  history.replaceState(null, "", hash);
}

/** Brief section 6.1: Lenis runs on GSAP's ticker, so there is one loop; off with reduced motion. */
export function LenisProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", onAnchorClick);
    instance = lenis;
    if (stopRequested) lenis.stop();

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, [reducedMotion]);

  return children;
}

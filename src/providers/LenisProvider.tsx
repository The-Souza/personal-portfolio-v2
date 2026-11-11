"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { type ReactNode, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { connectLenis } from "@/lib/scroll/lenis";

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
    const disconnect = connectLenis(lenis);

    return () => {
      disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return children;
}

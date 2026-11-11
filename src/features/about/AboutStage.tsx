"use client";

import { type ReactNode, useRef } from "react";
import { hasEntered, markerFrame, parseCount } from "@/features/about/about-motion";
import { MEDIA } from "@/lib/motion/breakpoints";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { hasPlayed, markPlayed } from "@/lib/motion/played";
import { SPRINGS } from "@/lib/motion/spring";
import { type SplitResult, scramble, splitChars, splitWords } from "@/lib/motion/text";

/**
 * Client shell for About (brief, act 02 · C): paragraphs word by word, the rail thread and
 * marker, the milestone years and the counting stats. Finds the server content by `data-about`.
 */
export function AboutStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || window.matchMedia(MEDIA.reducedMotion).matches) return;
      const one = (name: string) => root.querySelector<HTMLElement>(`[data-about="${name}"]`);
      const all = (name: string) => [...root.querySelectorAll<HTMLElement>(`[data-about="${name}"]`)];
      const splits: SplitResult[] = [];
      // Anything already past its trigger line at load (a reload or a language switch mid-page)
      // keeps the server-rendered state: hiding it now just to fade it back in would flash.
      // So does anything that already played this session (see `played.ts`).
      const skip = (key: string, el: HTMLElement, startRatio: number) => {
        const done = hasPlayed(key) || hasEntered(el.getBoundingClientRect().top, window.innerHeight, startRatio);
        if (done) markPlayed(key);
        return done;
      };

      // Each paragraph enters word by word when it reaches 82% of the viewport.
      for (const [i, paragraph] of all("paragraph").entries()) {
        const key = `about-paragraph-${i}`;
        if (skip(key, paragraph, 0.82)) continue;
        const split = splitWords(paragraph);
        splits.push(split);
        gsap.set(split.parts, { opacity: 0 });
        ScrollTrigger.create({
          trigger: paragraph,
          start: "top 82%",
          once: true,
          onEnter: () => {
            markPlayed(key);
            gsap.fromTo(
              split.parts,
              { opacity: 0, y: "0.35em", filter: "blur(8px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.025, ...SPRINGS.REVEAL },
            );
          },
        });
      }

      // The thread fills the rail as the column passes 60% of the viewport; the marker rides it.
      const column = one("column");
      const thread = one("thread");
      const marker = one("marker");
      if (column && thread && marker) {
        const fill = gsap.fromTo(
          thread,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: column,
              start: "top 60%",
              end: "bottom 60%",
              scrub: true,
              onUpdate: (self) => gsap.set(marker, markerFrame(self.progress, column.offsetHeight)),
            },
          },
        );
        // Without this the thread waits for the first scroll event, so after a reload or a
        // language switch mid-section it would sit at the wrong length until the visitor scrolls.
        const trigger = fill.scrollTrigger;
        if (trigger) {
          trigger.refresh();
          fill.progress(trigger.progress);
          gsap.set(marker, markerFrame(trigger.progress, column.offsetHeight));
        }
      }

      // Milestone years assemble letter by letter at full strength, then settle to the theme's
      // `--figure-rest` (the `settle` utility).
      for (const [i, milestone] of all("milestone").entries()) {
        const key = `about-year-${i}`;
        const year = milestone.querySelector<HTMLElement>('[data-about="year"]');
        if (!year || skip(key, milestone, 0.75)) continue;
        const split = splitChars(year);
        splits.push(split);
        gsap.set(year, { "--settle": 0 });
        gsap.set(split.parts, { opacity: 0 });
        ScrollTrigger.create({
          trigger: milestone,
          start: "top 75%",
          once: true,
          onEnter: () => {
            markPlayed(key);
            gsap
              .timeline()
              .fromTo(split.parts, { opacity: 0, y: "0.3em" }, { opacity: 1, y: 0, stagger: 0.07, ...SPRINGS.FIGURE })
              .to(year, { "--settle": 1, duration: 1.2, ease: "power2.inOut" }, "+=0.5");
          },
        });
      }

      // Stats count up from 0 (1.2s, staggered 120ms); a non-number like v1.5.1 scrambles.
      const stats = one("stats");
      if (stats && !skip("about-stats", stats, 0.8)) {
        const values = [...stats.querySelectorAll<HTMLElement>("[data-stat-value]")];
        ScrollTrigger.create({
          trigger: stats,
          start: "top 80%",
          once: true,
          onEnter: () => {
            markPlayed("about-stats");
            values.forEach((value, i) => {
              const final = value.textContent ?? "";
              const target = parseCount(final);
              if (target === null) {
                scramble(value, final, { duration: 0.7, delay: i * 0.12 });
                return;
              }
              const counter = { n: 0 };
              gsap.to(counter, {
                n: target,
                duration: 1.2,
                delay: i * 0.12,
                ease: "power2.out",
                onUpdate: () => {
                  value.textContent = String(Math.round(counter.n));
                },
              });
            });
          },
        });
      }

      return () => {
        for (const split of splits) split.revert();
      };
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}

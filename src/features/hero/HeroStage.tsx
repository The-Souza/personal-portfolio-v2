"use client";

import { type ReactNode, useRef } from "react";
import { onBootHandover } from "@/features/boot/boot-state";
import { nextGlitchDelay, playGlitch } from "@/lib/motion/glitch";
import { createHeroGrid } from "@/features/hero/hero-grid";
import { ACT_VARIANT_CONDITIONS, MEDIA } from "@/lib/motion/breakpoints";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { hasPlayed, markPlayed } from "@/lib/motion/played";
import { SPRINGS } from "@/lib/motion/spring";
import { scramble, splitWords } from "@/lib/motion/text";

const CORNER_OFFSETS = { x: [-24, 24, -24, 24], y: [-24, -24, 24, 24] };
const INTRO_KEY = "hero-intro";
/** Timed glitches after the entrance; hover still plays one at any time. */
const AUTO_GLITCHES = 3;

/**
 * Client shell for the hero (brief, act 01 · A): grid, entrance, name glitch and the scroll crack.
 * The content stays server-rendered; this finds it through `data-hero` attributes.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const one = (name: string) => root.querySelector<HTMLElement>(`[data-hero="${name}"]`);
      const all = (name: string) => [...root.querySelectorAll<HTMLElement>(`[data-hero="${name}"]`)];

      const canvas = one("grid") as HTMLCanvasElement | null;
      const name = one("name");
      const visual = one("name-visual");
      const first = one("first");
      const last = one("last");
      const bio = one("bio");
      const content = one("content");
      if (!canvas || !name || !visual || !first || !last || !bio || !content) return;

      const grid = createHeroGrid(canvas, root);
      if (window.matchMedia(MEDIA.reducedMotion).matches) {
        grid.show();
        return () => grid.destroy();
      }

      const eyebrow = one("eyebrow");
      const actions = one("actions");
      const rail = one("rail");
      const target = one("target");
      const panels = all("panel");
      const words = splitWords(bio);
      const firstText = first.textContent ?? "";
      const lastText = last.textContent ?? "";
      const hiddenUntilIntro = [content, rail, target].filter(Boolean);
      // After a reload or a language switch the entrance already played: show the hero as is.
      const introPlayed = hasPlayed(INTRO_KEY);
      if (!introPlayed) gsap.set(hiddenUntilIntro, { autoAlpha: 0 });

      // Glitch: on entrance, on mouse hover, and every 6–11s while visible and the tab is active,
      // up to AUTO_GLITCHES times: flicker that keeps coming back by itself next to the text would
      // fail WCAG 2.2.2 (Pause, Stop, Hide).
      // The timer only runs while the name is on screen: off screen it pauses (the observer starts
      // it again on the way back), and once the glitches are spent it's never armed again.
      let glitchTimer = 0;
      let nameVisible = true;
      let autoGlitches = 0;
      let glitchStarted = false;
      const glitch = contextSafe((strength: number) => playGlitch(visual, name, strength));
      const stopGlitchTimer = () => {
        window.clearTimeout(glitchTimer);
        glitchTimer = 0;
      };
      const scheduleGlitch = () => {
        glitchStarted = true;
        stopGlitchTimer();
        if (autoGlitches >= AUTO_GLITCHES || !nameVisible) return;
        glitchTimer = window.setTimeout(() => {
          glitchTimer = 0;
          if (!document.hidden) {
            glitch(0.8 + Math.random() * 0.6);
            autoGlitches++;
          }
          scheduleGlitch();
        }, nextGlitchDelay());
      };
      const visibility = new IntersectionObserver(([entry]) => {
        nameVisible = entry.isIntersecting;
        if (!glitchStarted) return;
        if (!nameVisible) stopGlitchTimer();
        else if (!glitchTimer) scheduleGlitch();
      });
      visibility.observe(name);
      const onNameEnter = (event: PointerEvent) => {
        if (event.pointerType === "mouse") glitch(1.1);
      };
      name.addEventListener("pointerenter", onNameEnter);

      const scroll = gsap.matchMedia();
      const setupScroll = contextSafe(() => {
        scroll.add(ACT_VARIANT_CONDITIONS, (media) => {
          const { full, narrow, short } = media.conditions ?? {};
          if (!full && !narrow && !short) return;
          const inner = one("inner");
          const shade = one("shade");
          const leaving = [eyebrow, bio, actions, ...panels].filter(Boolean);
          const pinned = full || narrow;

          // One ScrollTrigger owns both the pin and the scrub. The pin sits on the root and the
          // scale on an inner wrapper, never on the pinned element.
          const crack = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              // Starts when the hero's bottom reaches the screen's bottom: the same as "top top" when
              // it fits the screen, and later when it is taller (stacked panels on a phone, a short
              // landscape screen), so the whole hero is read before it blurs and About covers it.
              start: "bottom bottom",
              end: pinned ? "+=100%" : "bottom top",
              pin: pinned,
              pinSpacing: false,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          crack
            .to(first, { x: () => -window.innerWidth * 0.14, filter: "blur(8px)", opacity: 0.35, ease: "none" }, 0)
            .to(last, { x: () => window.innerWidth * 0.14, filter: "blur(8px)", opacity: 0.35, ease: "none" }, 0)
            .to(leaving, { opacity: 0, filter: "blur(6px)", y: -24, stagger: 0.04, ease: "none" }, pinned ? 0 : 0.1)
            .to(shade, { opacity: 0.55, ease: "none" }, pinned ? 0 : 0.3);
          if (pinned) crack.to(inner, { scale: 0.9, ease: "none" }, 0);
        });
      });

      // Brief, act 01: entrance timeline from the boot handover.
      const intro = contextSafe(() => {
        markPlayed(INTRO_KEY);
        gsap.set(hiddenUntilIntro, { autoAlpha: 1 });
        grid.reveal();
        const timeline = gsap.timeline({ onComplete: setupScroll });
        if (eyebrow) timeline.fromTo(eyebrow, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.05);
        timeline
          .add(scramble(first, firstText, { duration: 0.9 }), 0.12)
          .add(scramble(last, lastText, { duration: 0.7 }), 0.3)
          .fromTo(
            words.parts,
            { opacity: 0, y: "0.35em", filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.035, ...SPRINGS.REVEAL },
            0.42,
          );
        panels.forEach((panel, i) => {
          const box = panel.firstElementChild ?? panel;
          const corners = box.querySelectorAll("[data-corner]");
          const body = [...box.children].filter((child) => !child.hasAttribute("data-corner"));
          timeline.fromTo(
            corners,
            { x: (k: number) => CORNER_OFFSETS.x[k], y: (k: number) => CORNER_OFFSETS.y[k], opacity: 0 },
            { x: 0, y: 0, opacity: 1, ...SPRINGS.ITEM },
            0.6 + i * 0.12,
          );
          timeline.fromTo(body, { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.06, ...SPRINGS.ITEM }, 0.8 + i * 0.12);
        });
        if (actions) timeline.fromTo(actions.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.08, ...SPRINGS.ITEM }, 0.9);
        if (rail) timeline.fromTo(rail, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, ...SPRINGS.REVEAL }, 0.8);
        if (target) timeline.fromTo(target, { rotation: -90, opacity: 0 }, { rotation: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.8);
        timeline.call(
          () => {
            glitch(1.3);
            scheduleGlitch();
          },
          undefined,
          1.6,
        );
      });

      const skipIntro = contextSafe(() => {
        grid.show();
        setupScroll();
        scheduleGlitch();
      });
      const stopWaiting = onBootHandover(introPlayed ? skipIntro : intro);

      return () => {
        stopWaiting();
        stopGlitchTimer();
        visibility.disconnect();
        name.removeEventListener("pointerenter", onNameEnter);
        scroll.revert();
        grid.destroy();
        words.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    // Plain block on purpose: as a flex item, the pin's spacer doesn't keep the hero's height.
    <div ref={rootRef} className="relative">
      <div data-hero="inner" className="relative flex min-h-[max(100vh,40rem)] items-center overflow-hidden bg-background">
        <canvas data-hero="grid" aria-hidden="true" className="absolute inset-0 size-full" />
        {children}
        <div data-hero="shade" aria-hidden="true" className="dark pointer-events-none absolute inset-0 bg-background opacity-0" />
      </div>
    </div>
  );
}

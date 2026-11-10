"use client";

import { type ReactNode, useRef } from "react";
import { BLADE, bladeAt, bladeClip, isBladeDone, isTitleReady } from "@/features/contact/blade";
import { lineIndexes, lineOffsets } from "@/features/contact/title-lines";
import { ACT_VARIANT_CONDITIONS } from "@/lib/motion/breakpoints";
import { playGlitch } from "@/lib/motion/glitch";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { hasPlayed, markPlayed } from "@/lib/motion/played";
import { SPRINGS } from "@/lib/motion/spring";
import { splitWordChars } from "@/lib/motion/text";
import { registerLanding } from "@/lib/scroll/landing";
import { registerRelayout } from "@/lib/scroll/relayout";
import { settleScrubs } from "@/lib/scroll/scroll-keeper";
import { holdPageHeight } from "@/lib/scroll/viewport";

const PLAYED_KEY = "contact-poster";
/** Each title line shifts this much from the one above, to a random side, in em. */
const LINE_STEP = 0.3;
/** The `phone` breakpoint (35rem) in globals.css. */
const PHONE_UP = "(min-width: 35rem)";

/**
 * Client shell for Contact (brief, act 05 · B): the pinned stage where the poster enters as a
 * 45° blade, the title letter by letter with its lines shifted at random, and the hero's glitch when
 * the pin ends and on hover. On short screens the same blade runs without the pin. Finds the
 * server poster through `data-contact-*`.
 */
export function ContactStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = root?.querySelector<HTMLElement>("[data-contact-stage]");
      const poster = root?.querySelector<HTMLElement>("[data-contact-poster]");
      const edge = root?.querySelector<HTMLElement>("[data-contact-edge]");
      const title = root?.querySelector<HTMLElement>("[data-contact-title]");
      const text = root?.querySelector<HTMLElement>("[data-contact-title-text]");
      if (!root || !stage || !poster || !edge || !title || !text) return;
      // The first item (the eyebrow and the ⚠ mark, top right) is never hidden: it is what the blade
      // uncovers first, so the yellow carries a signal while the title still waits for the cut.
      // Hidden too, the poster swept in empty for over a screen of scroll.
      const [, ...items] = root.querySelectorAll<HTMLElement>("[data-contact-item]");
      // Outside any context on purpose: fired from scroll callbacks that can run while another
      // act's context is being built, `contextSafe` would nest the contexts in a loop. The glitch
      // removes its copies when it ends; the cleanup ends a running one early.
      let running: gsap.core.Timeline | null = null;
      const glitch = (strength: number) => {
        running?.progress(1);
        running = playGlitch(text, title, strength);
      };

      const build = (short: boolean) => {
        // Short screens, or a poster taller than the screen (a small phone, a long translation):
        // the same blade without the pin, the poster scrolling normally. Pinned, its top would be cut.
        const content = poster.firstElementChild as HTMLElement | null;
        const pinned = !short && (content?.offsetHeight ?? 0) <= window.innerHeight;
        if (pinned) {
          gsap.set(stage, { height: "100vh", overflow: "hidden" });
          gsap.set(poster, { position: "absolute", inset: 0 });
        }
        gsap.set(edge, { display: "block" });

        let live = false;
        let reveal: (() => void) | null = null;
        const blade = { s: BLADE.from };
        const apply = () => {
          const done = isBladeDone(blade.s);
          poster.style.clipPath = done ? "" : bladeClip(blade.s);
          edge.style.clipPath = done ? "" : bladeClip(blade.s, BLADE.edge);
          edge.style.visibility = done ? "hidden" : "";
          if (reveal && isTitleReady(blade.s)) reveal();
        };

        // The pin holds the stage for one screen, but the blade starts as the stage comes up from
        // the bottom: started with the pin, the stage rose as a full screen of black after the
        // Stack. Both end together (the blade's 200% from one screen above the pin's start).
        if (pinned) ScrollTrigger.create({ trigger: stage, start: "top top", end: "+=100%", pin: true });
        const tween = gsap.to(blade, {
          s: BLADE.to,
          ease: "none",
          onUpdate: apply,
          scrollTrigger: {
            trigger: stage,
            start: "top bottom",
            end: pinned ? "+=200%" : "top 15%",
            scrub: 0.6,
            // Only for a visitor scrolling past: a page loaded beyond the stage would fire it
            // inside this setup, nesting the glitch's context in the one being built.
            onLeave: () => {
              if (live) glitch(1.3);
            },
          },
        });
        // Loaded mid-scroll (reload, language switch, #hash): jump to the current cut.
        const trigger = tween.scrollTrigger as ScrollTrigger;
        trigger.refresh();
        tween.progress(trigger.progress);
        // Links to #contact land where the blade is done, not on the dark stage before it.
        const unregisterLanding = registerLanding("contact", () => trigger.end);

        // The lines shift by word blocks, to random sides drawn once, so a rewrap (measured again
        // on resize) keeps the same pattern.
        const split = splitWordChars(text);
        const words = [...new Set(split.parts.map((part) => part.parentElement))].filter((word) => word !== null);
        const picks = words.map(() => Math.random());
        const shiftLines = () => {
          gsap.set(words, { x: 0 });
          const lines = lineIndexes(words.map((word) => word.offsetTop));
          const widths: number[] = [];
          words.forEach((word, i) => {
            const right = word.offsetLeft + word.offsetWidth;
            widths[lines[i]] = Math.max(widths[lines[i]] ?? 0, right);
          });
          const container = title.parentElement ?? title;
          const padding = parseFloat(getComputedStyle(container).paddingLeft) + parseFloat(getComputedStyle(container).paddingRight);
          // Below `phone` the title breaks into four or five short lines, and shifting each one
          // read as broken type ("I AUTOMATE / WHAT / HOLDS YOUR…"): there they stay aligned.
          const step = window.matchMedia(PHONE_UP).matches ? parseFloat(getComputedStyle(title).fontSize) * LINE_STEP : 0;
          const offsets = lineOffsets(widths, container.clientWidth - padding, step, picks);
          words.forEach((word, i) => gsap.set(word, { x: offsets[lines[i]] }));
        };
        shiftLines();
        const rewrap = new ResizeObserver(shiftLines);
        rewrap.observe(title);

        // Hidden only on the client, and only when the entrance is still ahead: a title already
        // past the cut at load stays visible.
        const entered = hasPlayed(PLAYED_KEY) || isTitleReady(bladeAt(trigger.progress));
        if (entered) {
          markPlayed(PLAYED_KEY);
          // The entrance starts from the blade's onUpdate, so it belongs to the layout context: a
          // relayout reverting it mid-way (one fires right after a #contact load) leaves the items
          // at their hidden start. A poster that already entered shows them, whatever came before.
          gsap.set(items, { opacity: 1, y: 0 });
        } else {
          gsap.set([...split.parts, ...items], { opacity: 0 });
          reveal = () => {
            reveal = null;
            markPlayed(PLAYED_KEY);
            gsap.fromTo(split.parts, { opacity: 0, y: "0.3em" }, { opacity: 1, y: 0, stagger: 0.018, ...SPRINGS.FIGURE });
            gsap.fromTo(items, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.08, delay: 0.35, ...SPRINGS.ITEM });
          };
        }
        apply();

        const onTitleEnter = (event: PointerEvent) => {
          if (event.pointerType === "mouse") glitch(1.1);
        };
        title.addEventListener("pointerenter", onTitleEnter);
        // Tabbing into the poster before it entered would focus buttons still hidden on the dark
        // stage: the page goes where the blade is done, which plays the entrance.
        const onFocus = () => {
          if (!reveal && !poster.style.clipPath) return;
          window.scrollTo(0, trigger.end);
          settleScrubs();
        };
        root.addEventListener("focusin", onFocus);
        live = true;

        return () => {
          root.removeEventListener("focusin", onFocus);
          unregisterLanding();
          rewrap.disconnect();
          title.removeEventListener("pointerenter", onTitleEnter);
          // Set by hand on every update, so the context can't revert them.
          poster.style.clipPath = "";
          edge.style.clipPath = "";
          edge.style.visibility = "";
          split.revert();
        };
      };

      const media = gsap.matchMedia();
      media.add(ACT_VARIANT_CONDITIONS, (context) => {
        const { full, narrow, short } = context.conditions ?? {};
        // Reduced motion: the poster from the server HTML, as is.
        if (!full && !narrow && !short) return;

        // Its own context, so a rebuild reverts only the layout (see StackStage).
        let undo = () => {};
        const layOut = () =>
          gsap.context(() => {
            undo = build(Boolean(short));
          });
        let layout = layOut();

        // The pin keeps the width it was built with, and whether the poster fits the screen
        // changes with it, so each relayout rebuilds the stage.
        const unregister = registerRelayout(root, () => {
          undo();
          layout.revert();
          layout = layOut();
        });
        return () => {
          unregister();
          undo();
          layout.revert();
        };
      });

      return () => {
        // See ProjectsStage: keep the page height until the setup runs again.
        requestAnimationFrame(holdPageHeight());
        media.revert();
        running?.progress(1);
      };
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}

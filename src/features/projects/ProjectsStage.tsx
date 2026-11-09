"use client";

import { type ReactNode, useRef } from "react";
import { closestToCenter, counterLabel, ghostOffset, trackStops } from "@/features/projects/track";
import { createReveal, type RevealController, type RevealEffect } from "@/features/reveal-image/effects";
import { ACT_VARIANT_CONDITIONS } from "@/lib/motion/breakpoints";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { hasPlayed, markPlayed } from "@/lib/motion/played";
import { SPRINGS } from "@/lib/motion/spring";
import { scramble } from "@/lib/motion/text";
import { registerRelayout } from "@/lib/scroll/relayout";
import { settleScrubs } from "@/lib/scroll/scroll-keeper";
import { holdPageHeight } from "@/lib/scroll/viewport";

interface CardState {
  /** Session key in `played.ts`. */
  key: string;
  card: HTMLElement;
  wipe: HTMLElement | null;
  title: HTMLElement | null;
  ghost: HTMLElement | null;
  lines: HTMLElement[];
  images: { effect: RevealEffect; controller: RevealController }[];
  /** Kept across rebuilds (a resize or a band change), so nothing replays. */
  wiped: boolean;
  lit: boolean;
}

/** The cards away from the center recede, but stay readable (4.5:1 on their faintest text). */
const INACTIVE_OPACITY = 0.8;

/**
 * Client shell for Projects (brief, act 03 · A): the pinned horizontal track on wide screens,
 * the vertical list on phones and short screens, the image reveals, the title scramble and
 * BillWise's v1 glitch. Finds the server content through `data-project-*` attributes.
 */
export function ProjectsStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const viewport = root.querySelector<HTMLElement>("[data-projects-viewport]");
      const track = root.querySelector<HTMLElement>("[data-projects-track]");
      const bar = root.querySelector<HTMLElement>("[data-projects-bar]");
      const counter = root.querySelector<HTMLElement>("[data-projects-counter]");
      if (!viewport || !track) return;

      const cards: CardState[] = [...root.querySelectorAll<HTMLElement>("[data-project-card]")].map((card, i) => ({
        key: `project-${i}`,
        card,
        wipe: card.querySelector("[data-wipe]"),
        title: card.querySelector("[data-project-title]"),
        ghost: card.querySelector("[data-ghost]"),
        lines: [...card.querySelectorAll<HTMLElement>("[data-project-terminal] p")],
        images: [...card.querySelectorAll<HTMLCanvasElement>("canvas[data-reveal]")].map((canvas) => ({
          effect: canvas.dataset.reveal as RevealEffect,
          controller: createReveal(canvas, canvas.dataset.reveal as RevealEffect, Number(canvas.dataset.seed), canvas.dataset.label ?? ""),
        })),
        // A card revealed earlier this session (before a reload or a language switch) starts open.
        wiped: hasPlayed(`project-${i}`),
        lit: hasPlayed(`project-${i}`),
      }));

      const wipeIn = (state: CardState, instant: boolean) => {
        if (state.wiped) return;
        state.wiped = true;
        if (!state.wipe) return;
        if (instant) gsap.set(state.wipe, { scaleX: 0 });
        else gsap.to(state.wipe, { scaleX: 0, duration: 0.7, ease: "power3.inOut" });
      };

      const reveal = (state: CardState, instant: boolean, narrow: boolean) => {
        if (state.lit) return;
        state.lit = true;
        markPlayed(state.key);
        if (instant) {
          for (const { controller } of state.images) controller.set(1);
          if (state.ghost) gsap.set(state.ghost, { opacity: 1, ...ghostOffset(narrow) });
          return;
        }
        state.images.forEach(({ effect, controller }, i) => {
          const progress = { value: 0 };
          const onUpdate = () => controller.set(progress.value);
          if (effect === "mosaic") gsap.to(progress, { value: 1, duration: 1.1, ease: "none", onUpdate });
          else gsap.to(progress, { value: 1.05, duration: 1.3, delay: 0.15 + i * 0.14, ease: "power1.inOut", onUpdate });
        });
        if (state.title) scramble(state.title, state.title.textContent ?? "", { duration: 0.6 });
        if (state.ghost) {
          gsap
            .timeline({ delay: 0.4 })
            .set(state.ghost, { opacity: 1 })
            .to(state.ghost, { x: -10, duration: 0.05 })
            .to(state.ghost, { x: 8, y: -4, duration: 0.05 })
            .to(state.ghost, { x: -4, duration: 0.05 })
            .to(state.ghost, { ...ghostOffset(narrow), ...SPRINGS.ITEM });
        }
      };

      // Cards that already played keep their end state when a rebuild reverts the tweens.
      const restore = (state: CardState, narrow: boolean) => {
        gsap.set(state.wipe, { scaleX: state.wiped ? 0 : 1 });
        for (const { controller } of state.images) controller.set(state.lit ? 1 : 0);
        if (state.ghost && state.lit) gsap.set(state.ghost, { opacity: 1, ...ghostOffset(narrow) });
      };

      const setActive = (activeIndex: number) => {
        cards.forEach((state, i) => {
          const active = i === activeIndex;
          state.card.dataset.active = String(active);
          gsap.to(state.card, { opacity: active ? 1 : INACTIVE_OPACITY, duration: 0.25, overwrite: "auto" });
        });
        if (counter && activeIndex >= 0) counter.textContent = counterLabel(activeIndex, cards.length);
      };

      const buildTrack = () => {
        // Both axes: the track moves by transform, so nothing in here should scroll on its own.
        gsap.set(viewport, { overflow: "hidden" });
        gsap.set(cards.map((state) => state.card), { opacity: INACTIVE_OPACITY });
        cards.forEach((state) => restore(state, false));

        // A card taller than the space between the title and the progress bar (the clients block
        // on screens like 768×768) has to scale down, keeping 16px above and below. It first gets
        // wider, so its text wraps less and it gets shorter, until its on-screen width (after the
        // scale) is back to what it was. The scale keeps its center, so the measures below hold.
        // A binary search finds the widest layout whose scaled width doesn't pass the original:
        // wider means shorter, so the on-screen width only grows with the layout width.
        const room = viewport.clientHeight - 32;
        for (const state of cards) {
          const { card } = state;
          const visualWidth = card.offsetWidth;
          if (card.offsetHeight <= room) continue;
          const scaleAt = (width: number) => {
            gsap.set(card, { width, maxWidth: "none" });
            return Math.min(1, room / card.offsetHeight);
          };
          let narrow = visualWidth;
          let wide = visualWidth / scaleAt(visualWidth);
          for (let pass = 0; pass < 8; pass++) {
            const middle = (narrow + wide) / 2;
            if (middle * scaleAt(middle) <= visualWidth) narrow = middle;
            else wide = middle;
          }
          gsap.set(card, { scale: scaleAt(narrow), transformOrigin: "50% 50%" });
        }

        const width = viewport.clientWidth;
        const height = window.innerHeight;
        const boxes = cards.map((state) => ({ left: state.card.offsetLeft, width: state.card.offsetWidth }));
        const stops = trackStops(boxes, width, Math.max(0, track.scrollWidth - width));
        const hold = height * 0.3;
        const dwell = height * 0.22;
        let active = -1;

        const update = (instant = false) => {
          const x = Number(gsap.getProperty(track, "x"));
          boxes.forEach((box, i) => {
            if (box.left + x < width * 0.92) wipeIn(cards[i], instant);
          });
          const closest = closestToCenter(boxes, x, width);
          if (closest.index !== active) {
            active = closest.index;
            setActive(active);
          }
          if (closest.index >= 0 && closest.distance < boxes[closest.index].width * 0.3) reveal(cards[closest.index], instant, false);
        };

        // One pinned ScrollTrigger drives a timeline measured in pixels: a hold on the first card
        // (its terminal lines appear), then for each card a move that centers it and a dwell.
        // Reverting the timeline (a relayout, or useGSAP's own cleanup when Next hides and shows the
        // page) renders it back to the start, which runs this `onUpdate`: at progress 0 there's
        // nothing to update, and the card at the center would be revealed by the teardown itself.
        const timeline = gsap.timeline({ onUpdate: () => timeline.progress() > 0 && update() });
        timeline.to({}, { duration: hold }, 0);
        const firstLines = cards[0]?.lines ?? [];
        if (firstLines.length) {
          timeline.fromTo(firstLines, { opacity: 0, x: -8 }, { opacity: 1, x: 0, stagger: hold * 0.18, duration: hold * 0.2, ease: "none" }, 0);
        }
        // Where each card sits at the center, for the keyboard (see `onFocus`).
        timeline.addLabel("card-0", hold);
        for (let i = 1; i < stops.length; i++) {
          timeline.to(track, { x: stops[i], duration: Math.max(Math.abs(stops[i] - stops[i - 1]), height * 0.2), ease: "power1.inOut" });
          timeline.addLabel(`card-${i}`);
          timeline.to({}, { duration: dwell });
        }

        const trigger = ScrollTrigger.create({
          animation: timeline,
          trigger: root,
          start: "top top",
          end: `+=${timeline.duration()}`,
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            if (bar) bar.style.width = `${self.progress * 100}%`;
          },
        });

        // The first card opens and lights up with the section, before the pin starts. Its image
        // waits for the pin like the others (`update` reveals it once the track starts to move):
        // revealed on the way in, the mosaic was over before the card settled on screen.
        const first = cards[0];
        const sectionTop = root.getBoundingClientRect().top;
        if (first) {
          if (sectionTop < height * 0.7) wipeIn(first, true);
          else ScrollTrigger.create({ trigger: root, start: "top 70%", once: true, onEnter: () => wipeIn(first, false) });
          const light = () => {
            setActive(0);
            active = 0;
          };
          if (sectionTop < height * 0.35) light();
          else ScrollTrigger.create({ trigger: root, start: "top 35%", once: true, onEnter: light });
        }

        // Loaded mid-track (reload, language switch, #hash): jump to the current state, no replay.
        trigger.refresh();
        timeline.progress(trigger.progress);
        if (trigger.progress > 0) update(true);

        // Tabbing into a card: the browser would scroll the clipped viewport sideways to show the
        // link, around the pin, leaving the card dim and the track offset for good. Instead the page
        // scrolls to where that card is centered and the card shows at once, as on a mid-track load.
        const keepTrack = () => {
          if (viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
        };
        const onFocus = (event: FocusEvent) => {
          keepTrack();
          const card = (event.target as Element | null)?.closest("[data-project-card]");
          const index = cards.findIndex((state) => state.card === card);
          if (index < 0) return;
          window.scrollTo(0, trigger.labelToScroll(`card-${index}`));
          settleScrubs();
          timeline.progress(trigger.progress);
          update(true);
        };
        viewport.addEventListener("scroll", keepTrack);
        root.addEventListener("focusin", onFocus);
        return () => {
          viewport.removeEventListener("scroll", keepTrack);
          root.removeEventListener("focusin", onFocus);
        };
      };

      const buildList = () => {
        // In the list the cards span nearly the whole width, so the v1 ghost always rises
        // straight up: the diagonal offset would push it off the left edge (phone in landscape).
        const narrow = true;
        const height = window.innerHeight;
        cards.forEach((state) => {
          restore(state, narrow);
          const top = state.card.getBoundingClientRect().top;
          const onScreen = top < height;
          if (onScreen) {
            wipeIn(state, true);
            reveal(state, true, narrow);
          } else {
            ScrollTrigger.create({ trigger: state.card, start: "top 85%", once: true, onEnter: () => wipeIn(state, false) });
          }
          ScrollTrigger.create({
            trigger: state.card,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (self) => {
              state.card.dataset.active = String(self.isActive);
            },
            onEnter: () => reveal(state, false, narrow),
            onEnterBack: () => reveal(state, false, narrow),
          });
          if (state.lines.length && !onScreen) {
            gsap.set(state.lines, { opacity: 0 });
            ScrollTrigger.create({
              trigger: state.card,
              start: "top 55%",
              once: true,
              onEnter: () => gsap.to(state.lines, { opacity: 1, stagger: 0.15, ...SPRINGS.ITEM }),
            });
          }
        });
      };

      const media = gsap.matchMedia();
      media.add(ACT_VARIANT_CONDITIONS, (context) => {
        const { full, narrow, short } = context.conditions ?? {};
        if (full) {
          // Its own context, so a rebuild reverts only the layout: reverting the matchMedia
          // context would also run this cleanup.
          let layout = gsap.context(() => buildTrack());
          // The stops depend on the viewport width (a few pixels can cross a breakpoint and
          // reflow a card), so each relayout rebuilds the track, in page order with the others.
          const unregister = registerRelayout(root, () => {
            layout.revert();
            layout = gsap.context(() => buildTrack());
          });
          return () => {
            unregister();
            layout.revert();
            // The active-card fades start in scroll callbacks, outside the context, so the revert
            // misses them: without this the list (phone width) keeps the track's dimmed cards.
            for (const { card } of cards) {
              gsap.killTweensOf(card, "opacity");
              card.style.opacity = "";
              delete card.dataset.active;
            }
            // Reverting the hold timeline can leave the first card's terminal lines at their hidden
            // start, and a setup that runs again (React's dev double run) would take that as their
            // original state: the list would then keep the terminal empty.
            gsap.set(cards[0]?.lines ?? [], { clearProps: "opacity,transform" });
          };
        }
        if (narrow || short) {
          buildList();
          return;
        }
        // Reduced motion: the images show at once, nothing moves.
        for (const state of cards) for (const { controller } of state.images) controller.set(1);
      });

      return () => {
        // React can run this cleanup and the setup again without replacing the DOM (Next hides
        // and shows the page segment after hydration); without the pin the page would shrink and
        // clamp the scroll before the new pin is built.
        requestAnimationFrame(holdPageHeight());
        media.revert();
        for (const state of cards) for (const { controller } of state.images) controller.destroy();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="track:flex track:h-screen track:flex-col track:overflow-hidden">
      {children}
    </div>
  );
}

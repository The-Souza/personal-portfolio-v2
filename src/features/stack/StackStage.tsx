"use client";

import { type ReactNode, useRef } from "react";
import { circuitPoints, circuitSpacing, cumulativeLengths } from "@/features/stack/circuit";
import { ACT_VARIANT_CONDITIONS } from "@/lib/motion/breakpoints";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { hasPlayed, markPlayed } from "@/lib/motion/played";
import { SPRINGS } from "@/lib/motion/spring";
import { holdPageHeight, isOnScreenAtLoad } from "@/lib/motion/viewport";

const HOLD = 0.55;
const FIRST_HOLD = 0.45;
const AI_LINES_KEY = "stack-ai-lines";

/**
 * Client shell for Stack (brief, act 04 · C): the pinned stair circuit, with the camera, the
 * live trace and the dot moving card to card. Finds the server grid through `data-stack-*`.
 */
export function StackStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = root?.querySelector<HTMLElement>("[data-stack-pin]");
      const head = root?.querySelector<HTMLElement>("[data-stack-head]");
      const stage = root?.querySelector<HTMLElement>("[data-stack-stage]");
      const board = root?.querySelector<HTMLElement>("[data-stack-board]");
      const trace = root?.querySelector<SVGSVGElement>("[data-stack-trace]");
      const base = root?.querySelector<SVGPathElement>("[data-stack-base]");
      const live = root?.querySelector<SVGPathElement>("[data-stack-live]");
      const dot = root?.querySelector<HTMLElement>("[data-stack-dot]");
      const after = root?.querySelector<HTMLElement>("[data-stack-after]");
      const ai = root?.querySelector<HTMLElement>("[data-stack-ai]");
      if (!root || !pin || !head || !stage || !board || !trace || !base || !live || !dot || !after || !ai) return;

      const allNodes = [...board.querySelectorAll<HTMLElement>("[data-stack-node]")];
      const body = (node: HTMLElement) => [...(node.firstElementChild?.children ?? [])];
      const ready = () => {
        pin.dataset.ready = "";
      };

      const build = (compact: boolean) => {
        // On short screens the AI card leaves the circuit and follows it, with its terminal in sequence.
        const nodes = compact ? allNodes.filter((node) => node !== ai) : allNodes;
        if (compact) {
          after.append(ai);
          const lines = [...ai.querySelectorAll<HTMLElement>("[data-stack-terminal] p")];
          if (!hasPlayed(AI_LINES_KEY) && !isOnScreenAtLoad(ai)) {
            gsap.set(lines, { opacity: 0 });
            ScrollTrigger.create({
              trigger: ai,
              start: "top 80%",
              once: true,
              onEnter: () => {
                markPlayed(AI_LINES_KEY);
                gsap.to(lines, { opacity: 1, stagger: 0.15, ...SPRINGS.ITEM });
              },
            });
          }
        }

        const viewport = { width: window.innerWidth, height: window.innerHeight };
        // In the circuit the title sits over the stage; on short screens it stays above it.
        const pinTarget = compact ? stage : pin;
        if (!compact) gsap.set(head, { position: "absolute", top: 0, left: 0, right: 0, zIndex: 3 });
        gsap.set(stage, { position: "relative", height: "100vh", overflow: "hidden" });
        gsap.set(board, { display: "block", position: "absolute", top: 0, left: 0, padding: 0, maxWidth: "none", width: "auto" });
        // `data-compact` switches the cards to the compact padding and type (see StackAct).
        if (compact) board.dataset.compact = "";

        const nodeWidth = compact ? Math.min(460, viewport.width * 0.56) : Math.min(480, viewport.width * 0.8);
        gsap.set(nodes, { position: "absolute", width: nodeWidth, zIndex: 2, xPercent: -50, yPercent: -50 });
        const nodeHeight = Math.max(...nodes.map((node) => node.offsetHeight));
        const spacing = circuitSpacing(viewport, { width: nodeWidth, height: nodeHeight }, compact);
        const points = circuitPoints(nodes.length, spacing);
        nodes.forEach((node, k) => gsap.set(node, { left: points[k][0], top: points[k][1] }));

        const [lastX, lastY] = points[points.length - 1];
        // CSS size and setAttribute, not gsap `attr`: reverting `attr` restores the missing
        // attributes as "" (StrictMode remounts in dev), which the browser reports as invalid.
        gsap.set(trace, { display: "block", width: lastX + 300, height: lastY + 300 });
        const d = `M${points.map(([x, y]) => `${x} ${y}`).join(" L")}`;
        for (const path of [base, live]) path.setAttribute("d", d);
        const lengths = cumulativeLengths(points);
        const total = lengths[lengths.length - 1];
        gsap.set(live, { strokeDasharray: total, strokeDashoffset: total });

        const focus = ([x, y]: [number, number]) => ({ x: viewport.width / 2 - x, y: spacing.fy - y });
        gsap.set(board, focus(points[0]));
        gsap.set(dot, { display: "block", x: points[0][0], y: points[0][1], xPercent: -50, yPercent: -50 });
        // The cards stay opaque, so the dot disappears behind them; only their content fades.
        nodes.slice(1).forEach((node) => gsap.set(body(node), { opacity: 0.22 }));

        const timeline = gsap.timeline();
        let at = FIRST_HOLD;
        for (let k = 1; k < points.length; k++) {
          timeline.to(body(nodes[k - 1]), { opacity: 0.4, duration: 0.3 }, at + 0.05);
          timeline.to(board, { ...focus(points[k]), duration: 1, ease: "power2.inOut" }, at);
          timeline.to(live, { strokeDashoffset: total - lengths[k], duration: 1, ease: "power2.inOut" }, at);
          timeline.to(dot, { x: points[k][0], y: points[k][1], duration: 1, ease: "power2.inOut" }, at);
          timeline.to(body(nodes[k]), { opacity: 1, duration: 0.25 }, at + 0.85);
          timeline.from(nodes[k].querySelectorAll("li, span.inline-flex, [data-stack-terminal] p"), { opacity: 0, y: 8, stagger: 0.04, duration: 0.25 }, at + 0.9);
          at += 1 + HOLD;
        }
        timeline.to({}, { duration: 0.1 }, at - 0.1);

        const trigger = ScrollTrigger.create({
          animation: timeline,
          trigger: pinTarget,
          start: "top top",
          end: `+=${nodes.length * 72}%`,
          pin: true,
          scrub: 0.8,
        });
        // Loaded mid-circuit (reload, language switch, #hash): jump to the current state.
        trigger.refresh();
        timeline.progress(trigger.progress);

        return () => {
          for (const path of [base, live]) path.removeAttribute("d");
          if (!compact) return;
          board.append(ai);
          delete board.dataset.compact;
        };
      };

      const media = gsap.matchMedia();
      media.add(ACT_VARIANT_CONDITIONS, (context) => {
        const { full, narrow, short } = context.conditions ?? {};
        if (!full && !narrow && !short) {
          // Reduced motion: the grid from the server HTML, as is.
          ready();
          return;
        }
        // Its own context, so a rebuild reverts only the layout: reverting the matchMedia
        // context would also run this cleanup and drop the resize listener after one rebuild.
        let undo = () => {};
        const layOut = () =>
          gsap.context(() => {
            undo = build(Boolean(short));
          });
        let layout = layOut();
        ready();

        // Step sizes depend on the viewport, so a width change rebuilds the circuit.
        let lastWidth = window.innerWidth;
        let timer = 0;
        const onResize = () => {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            // Any width change: a few pixels can cross a breakpoint and reflow a card.
            if (window.innerWidth === lastWidth) return;
            lastWidth = window.innerWidth;
            const release = holdPageHeight();
            undo();
            layout.revert();
            layout = layOut();
            release();
          }, 300);
        };
        window.addEventListener("resize", onResize);
        return () => {
          window.clearTimeout(timer);
          window.removeEventListener("resize", onResize);
          undo();
          layout.revert();
        };
      });

      return () => {
        // See ProjectsStage: keep the page height until the setup runs again.
        requestAnimationFrame(holdPageHeight());
        media.revert();
      };
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}

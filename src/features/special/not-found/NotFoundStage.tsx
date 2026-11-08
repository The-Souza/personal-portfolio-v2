"use client";

import { type ReactNode, useRef } from "react";
import { aimReading, isAimLineHidden, looseOffset } from "@/features/special/shared/special-motion";
import { playSpecialEntrance } from "@/features/special/shared/special-entrance";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { SPRINGS } from "@/lib/motion/spring";
import { scramble } from "@/lib/motion/text";

const MOTION = "(prefers-reduced-motion: no-preference)";
const HOVER = "(hover: hover)";

/**
 * Client shell for the 404 (brief, section 11): the entrance, the scrambled digits, the loose "0"
 * that follows the cursor on a loose spring, and the aim (dashed line to the cursor, corner
 * reticle, reading, dotted tether back to the slot). On touch screens the "0" only sways in.
 */
export function NotFoundStage({ aimLabel, children }: { aimLabel: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const aimRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const aim = aimRef.current;
      const big = root?.querySelector<HTMLElement>("[data-big]");
      const zero = root?.querySelector<HTMLElement>("[data-zero]");
      const slot = root?.querySelector<HTMLElement>("[data-slot]");
      const toCursor = aim?.querySelector<SVGLineElement>("[data-aim-cursor]");
      const tether = aim?.querySelector<SVGLineElement>("[data-aim-tether]");
      const reticle = aim?.querySelector<HTMLElement>("[data-aim-reticle]");
      const reading = aim?.querySelector<HTMLElement>("[data-aim-reading]");
      if (!root || !aim || !big || !zero || !slot || !toCursor || !tether || !reticle || !reading) return;

      // The dashed slot marks where the "0" belongs.
      const placeSlot = () => {
        Object.assign(slot.style, {
          left: `${zero.offsetLeft}px`,
          top: `${zero.offsetTop}px`,
          width: `${zero.offsetWidth}px`,
          height: `${zero.offsetHeight}px`,
        });
      };
      placeSlot();
      const resize = new ResizeObserver(placeSlot);
      resize.observe(big);

      const media = gsap.matchMedia();
      media.add({ motion: MOTION, hover: HOVER }, (context) => {
        const { motion, hover } = context.conditions ?? {};
        if (!motion) return;

        const undoEntrance = playSpecialEntrance(root);
        root.querySelectorAll<HTMLElement>("[data-digit]").forEach((digit, i) => {
          scramble(digit, digit.textContent ?? "", { duration: 0.6, delay: 0.1 + i * 0.08 });
        });

        if (!hover) {
          // Touch: no cursor to follow, just a sway as the page comes in.
          gsap.fromTo(zero, { rotation: -16 }, { rotation: 0, delay: 0.8, ...SPRINGS.LOOSE });
          return undoEntrance;
        }

        const loose = { duration: SPRINGS.LOOSE.duration, ease: SPRINGS.LOOSE.ease };
        const toX = gsap.quickTo(zero, "x", loose);
        const toY = gsap.quickTo(zero, "y", loose);
        const toRotation = gsap.quickTo(zero, "rotation", loose);
        const toSlot = gsap.quickTo(slot, "opacity", { duration: 0.3 });

        const center = (el: Element) => {
          const box = el.getBoundingClientRect();
          return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        };
        const line = (el: SVGLineElement, a: { x: number; y: number }, b: { x: number; y: number }) => {
          el.setAttribute("x1", String(a.x));
          el.setAttribute("y1", String(a.y));
          el.setAttribute("x2", String(b.x));
          el.setAttribute("y2", String(b.y));
        };

        let cursor = { x: 0, y: 0 };
        let aiming = false;
        const tick = () => {
          if (!aiming) return;
          const from = center(zero);
          const home = center(slot);
          const distance = Math.hypot(cursor.x - from.x, cursor.y - from.y);
          line(toCursor, from, cursor);
          toCursor.style.strokeDashoffset = String(-distance * 0.5);
          toCursor.style.opacity = isAimLineHidden(distance) ? "0" : "1";
          line(tether, home, from);
          gsap.set(reticle, { x: cursor.x, y: cursor.y });
          gsap.set(reading, { x: cursor.x + 22, y: cursor.y + 20 });
          reading.textContent = aimReading(aimLabel, cursor.x, cursor.y, Math.hypot(cursor.x - home.x, cursor.y - home.y));
        };
        gsap.ticker.add(tick);

        const onMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          cursor = { x: event.clientX, y: event.clientY };
          const home = center(slot);
          const offset = looseOffset(cursor.x - home.x, cursor.y - home.y);
          toX(offset.x);
          toY(offset.y);
          toRotation(offset.rotation);
          toSlot(offset.slot);
          if (!aiming) {
            aiming = true;
            gsap.to(aim, { opacity: 1, duration: 0.2 });
            gsap.fromTo(reticle, { scale: 1.6, rotation: 45 }, { scale: 1, rotation: 0, ...SPRINGS.ITEM });
          }
        };
        const onLeave = () => {
          toX(0);
          toY(0);
          toRotation(0);
          toSlot(0);
          aiming = false;
          gsap.to(aim, { opacity: 0, duration: 0.25 });
        };
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);

        return () => {
          undoEntrance();
          gsap.ticker.remove(tick);
          root.removeEventListener("pointermove", onMove);
          root.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => {
        resize.disconnect();
        media.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="alert pointer-fine:cursor-crosshair">
      {children}
      <div ref={aimRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 opacity-0">
        <svg className="absolute inset-0 size-full overflow-visible">
          <line data-aim-cursor className="stroke-foreground [stroke-dasharray:5_6]" />
          <line data-aim-tether className="stroke-muted-foreground [stroke-dasharray:2_4]" />
        </svg>
        <div data-aim-reticle className="brackets absolute top-0 left-0 -mt-3.75 -ml-3.75 size-7.5 [--bc:var(--foreground)]">
          <i className="absolute top-1/2 left-1/2 -mt-0.5 -ml-0.5 size-1 bg-foreground" />
        </div>
        <p
          data-aim-reading
          className="absolute top-0 left-0 font-mono text-xs leading-none tracking-widest whitespace-nowrap text-foreground uppercase"
        />
      </div>
    </div>
  );
}

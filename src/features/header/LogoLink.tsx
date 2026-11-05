"use client";

import { useRef } from "react";
import { MEDIA } from "@/lib/motion/breakpoints";
import { gsap } from "@/lib/motion/gsap";
import { scramble } from "@/lib/motion/text";

const RGB_SPLIT = ["-2px 0 var(--hot), 2px 0 var(--primary)", "1px 0 var(--hot), -1px 0 var(--primary)", "none"];
const reveal = "opacity-0 transition-[opacity,translate] duration-250 ease-plate group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100";

/**
 * Brief 7.1: on hover and focus the name scrambles (0.5s), the brackets slide in,
 * a cursor blinks after `_dev` and the letters split in RGB for 120ms.
 */
export function LogoLink({ name, suffix, label }: { name: string; suffix: string; label: string }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const scrambleRef = useRef<gsap.core.Tween | null>(null);

  // Event handler only: the tweens end on their own and the header never unmounts.
  const play = () => {
    const link = linkRef.current;
    const nameEl = nameRef.current;
    if (!link || !nameEl || window.matchMedia(MEDIA.reducedMotion).matches) return;
    scrambleRef.current?.kill();
    scrambleRef.current = scramble(nameEl, name, { duration: 0.5 });
    const split = gsap.timeline();
    RGB_SPLIT.forEach((shadow, i) =>
      split.call(
        () => {
          link.style.textShadow = shadow;
        },
        undefined,
        i * 0.06,
      ),
    );
  };

  return (
    <a
      ref={linkRef}
      href="#hero"
      aria-label={label}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") play();
      }}
      onFocus={play}
      className="group inline-flex items-center font-heading text-base font-bold tracking-wide text-foreground uppercase"
    >
      <span aria-hidden="true" className={`mr-1.5 translate-x-1.5 font-mono text-sm font-medium text-primary-accessible ${reveal}`}>
        [
      </span>
      <span ref={nameRef} aria-hidden="true">
        {name}
      </span>
      <span aria-hidden="true" className="text-primary-accessible">
        {suffix}
      </span>
      <span
        aria-hidden="true"
        className="ml-0.5 h-3.5 w-2 bg-primary opacity-0 group-hover:animate-blink-cursor group-hover:opacity-100 group-focus-visible:animate-blink-cursor group-focus-visible:opacity-100"
      />
      <span aria-hidden="true" className={`ml-1.5 -translate-x-1.5 font-mono text-sm font-medium text-primary-accessible ${reveal}`}>
        ]
      </span>
    </a>
  );
}

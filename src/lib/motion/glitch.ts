import { gsap } from "@/lib/motion/gsap";

type Random = () => number;

const FRAMES = 7;
const FRAME_SECONDS = 0.05;
const DURATION = 0.36;

/** One horizontal slice of a glitch copy: `top`/`bottom` are clip-path insets in %. */
export function glitchSlice(direction: 1 | -1, strength: number, random: Random = Math.random) {
  const top = random() * 85;
  const height = 6 + random() * 26;
  return {
    top,
    bottom: Math.max(0, 100 - top - height),
    x: direction * (3 + random() * 12) * strength,
  };
}

/** The original name shakes along with the copies. */
export function glitchJitter(strength: number, random: Random = Math.random) {
  return { x: (random() - 0.5) * 6 * strength, skewX: (random() - 0.5) * 10 * strength };
}

/** Milliseconds until the next automatic glitch. */
export function nextGlitchDelay(random: Random = Math.random) {
  return 6000 + random() * 5000;
}

/**
 * Two copies of `base` (in `hot` and `primary`) show random slices for 7 frames of 50ms
 * while `base` shakes, about 0.36s in all. The copies are removed at the end.
 */
export function playGlitch(base: HTMLElement, host: HTMLElement, strength = 1) {
  const copies = (["text-hot", "text-primary"] as const).map((color) => {
    const copy = base.cloneNode(true) as HTMLElement;
    // No `data-*` hooks on the copies, so the acts' queries never find them.
    for (const name of copy.getAttributeNames()) if (name.startsWith("data-")) copy.removeAttribute(name);
    copy.setAttribute("aria-hidden", "true");
    copy.classList.add("pointer-events-none", "absolute", "inset-0", "opacity-0", color);
    host.append(copy);
    return copy;
  });

  const timeline = gsap.timeline({ onComplete: () => copies.forEach((copy) => copy.remove()) });
  for (let frame = 0; frame < FRAMES; frame++) {
    const at = frame * FRAME_SECONDS;
    copies.forEach((copy, i) => {
      const slice = glitchSlice(i === 0 ? -1 : 1, strength);
      timeline.set(copy, { opacity: 0.9, x: slice.x, clipPath: `inset(${slice.top}% 0 ${slice.bottom}% 0)` }, at);
    });
    timeline.set(base, glitchJitter(strength), at);
  }
  timeline.set(copies, { opacity: 0 }, DURATION).set(base, { x: 0, skewX: 0 }, DURATION);
  return timeline;
}

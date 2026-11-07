import { gsap } from "@/lib/motion/gsap";

export interface SplitResult {
  parts: HTMLSpanElement[];
  /** Puts the original nodes back, as they were before the split. */
  revert: () => void;
}

/**
 * Moves the element's own nodes into an `sr-only` copy, so screen readers keep the real text
 * (and React keeps the nodes it rendered), and adds an aria-hidden copy split into spans.
 */
function splitInto(el: HTMLElement, build: (visual: HTMLSpanElement) => HTMLSpanElement[]): SplitResult {
  const original = [...el.childNodes];

  const copy = document.createElement("span");
  copy.className = "sr-only";
  copy.append(...original);

  const visual = document.createElement("span");
  visual.setAttribute("aria-hidden", "true");
  const parts = build(visual);

  el.append(copy, visual);

  return {
    parts,
    revert: () => {
      el.append(...original);
      copy.remove();
      visual.remove();
    },
  };
}

const piece = (text: string, className: string) => {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
};

function split(el: HTMLElement, pieces: string[], joiner: string, pieceClass: string): SplitResult {
  return splitInto(el, (visual) =>
    pieces.map((text, i) => {
      const span = piece(text, pieceClass);
      if (i > 0 && joiner) visual.append(joiner);
      visual.append(span);
      return span;
    }),
  );
}

/** Never put `overflow: hidden` on the element: it clips descenders while words move. */
export function splitWords(el: HTMLElement) {
  const words = (el.textContent ?? "").trim().split(/\s+/).filter(Boolean);
  return split(el, words, " ", "inline-block");
}

export function splitChars(el: HTMLElement) {
  return split(el, [...(el.textContent ?? "")], "", "inline-block whitespace-pre");
}

/**
 * Letters for text that wraps over several lines: each word is a block that never breaks, and
 * plain spaces sit between words, so a line starting after a break isn't indented by one.
 */
export function splitWordChars(el: HTMLElement) {
  const words = (el.textContent ?? "").trim().split(/\s+/).filter(Boolean);
  return splitInto(el, (visual) =>
    words.flatMap((word, i) => {
      const block = piece("", "inline-block whitespace-nowrap");
      const letters = [...word].map((letter) => piece(letter, "inline-block"));
      block.append(...letters);
      if (i > 0) visual.append(" ");
      visual.append(block);
      return letters;
    }),
  );
}

export const SCRAMBLE_GLYPHS = "▲■/_<>01#";

/** Text revealed from left to right; characters not yet revealed swap for glyphs. */
export function scrambleFrame(final: string, progress: number, random: () => number = Math.random) {
  const count = Math.floor(Math.min(1, Math.max(0, progress)) * final.length);
  let pending = "";
  for (const char of final.slice(count)) {
    if (char === " ") pending += " ";
    else pending += random() < 0.6 ? SCRAMBLE_GLYPHS[Math.floor(random() * SCRAMBLE_GLYPHS.length)] : char;
  }
  return { settled: final.slice(0, count), pending };
}

/**
 * Writes straight into `el`, so pass an element React doesn't render children into,
 * like the aria-hidden copy from `splitWords`/`splitChars`.
 */
export function scramble(el: HTMLElement, final: string, { duration = 0.8, delay = 0 } = {}) {
  const state = { progress: 0 };
  const pendingSpan = document.createElement("span");
  pendingSpan.className = "text-primary-accessible";

  return gsap.to(state, {
    progress: 1,
    duration,
    delay,
    ease: "none",
    onUpdate: () => {
      const { settled, pending } = scrambleFrame(final, state.progress);
      el.textContent = settled;
      if (pending) {
        pendingSpan.textContent = pending;
        el.append(pendingSpan);
      }
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
}

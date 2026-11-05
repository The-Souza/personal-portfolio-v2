export interface Spring {
  /** Seconds until the spring settles; use it as the tween duration. */
  duration: number;
  /** GSAP ease: progress 0–1 in, spring position out (may pass 1 before settling). */
  ease: (progress: number) => number;
}

const STEP = 0.001;
const MAX_STEPS = 5000;

/**
 * Damped spring with mass 1, simulated in 1ms steps until it rests at 1.
 * Spread the result into a tween: `gsap.to(el, { x: 0, ...SPRINGS.ITEM })`.
 */
export function spring(tension: number, friction: number): Spring {
  const samples = [0];
  let position = 0;
  let velocity = 0;

  for (let i = 0; i < MAX_STEPS; i++) {
    const acceleration = -tension * (position - 1) - friction * velocity;
    velocity += acceleration * STEP;
    position += velocity * STEP;
    samples.push(position);
    if (i > 40 && Math.abs(velocity) < 0.002 && Math.abs(1 - position) < 0.001) break;
  }

  const last = samples.length - 1;
  return {
    duration: last * STEP,
    ease: (progress) => {
      if (progress >= 1) return 1;
      if (progress <= 0) return 0;
      const exact = progress * last;
      const index = Math.floor(exact);
      return samples[index] + (samples[index + 1] - samples[index]) * (exact - index);
    },
  };
}

/** Brief section 6.3. */
export const SPRINGS = {
  /** Text word by word, rails. */
  REVEAL: spring(90, 26),
  /** Lines, items, panels, masthead. */
  ITEM: spring(170, 24),
  /** Numbers and title letters. */
  FIGURE: spring(200, 24),
  /** Boot content leaving. */
  CLEAR: spring(140, 26),
  /** Veils. */
  VEIL: spring(70, 24),
  /** The 404's loose piece. */
  LOOSE: spring(120, 14),
} as const;

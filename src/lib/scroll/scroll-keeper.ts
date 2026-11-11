import { ScrollTrigger } from "@/lib/motion/gsap";

export interface SectionBox {
  id: string;
  top: number;
  height: number;
}

/** Where the visitor is: a section and how much of it has passed, from 0 to 1. */
export interface ScrollPlace {
  id: string;
  progress: number;
}

/**
 * A resize can rebuild every act above (the projects track becomes a list, the stack goes
 * compact), so the same pixel lands in another act. A place relative to the section survives it.
 */
export function placeAt(sections: SectionBox[], scrollY: number): ScrollPlace | null {
  const current = sections.findLast(({ top }) => top <= scrollY) ?? sections[0];
  if (!current) return null;
  const progress = current.height > 0 ? (scrollY - current.top) / current.height : 0;
  return { id: current.id, progress: Math.min(1, Math.max(0, progress)) };
}

export function scrollForPlace(sections: SectionBox[], place: ScrollPlace) {
  const section = sections.find(({ id }) => id === place.id);
  return section ? Math.round(section.top + place.progress * section.height) : null;
}

/**
 * After a programmatic jump, scrubbed acts would ease toward the new position (0.6–0.8s) and
 * replay on screen: read the new position and finish them now.
 */
export function settleScrubs() {
  ScrollTrigger.update();
  for (const trigger of ScrollTrigger.getAll()) {
    // `false` for triggers without scrub.
    const scrub = trigger.getTween();
    if (scrub) scrub.progress(1);
  }
}

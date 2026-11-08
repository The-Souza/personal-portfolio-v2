import { gsap } from "@/lib/motion/gsap";
import { SPRINGS } from "@/lib/motion/spring";
import { splitWords } from "@/lib/motion/text";

/**
 * The special pages' entrance (brief, section 11): the band grows from the left, the title comes
 * in word by word out of a blur, the rest follows in sequence. Call it inside a GSAP context;
 * returns the cleanup for the split title.
 */
export function playSpecialEntrance(root: HTMLElement) {
  const band = root.querySelector<HTMLElement>("[data-special-band]");
  const title = root.querySelector<HTMLElement>("[data-special-title]");
  const items = root.querySelectorAll<HTMLElement>("[data-special-item]");

  if (band) gsap.fromTo(band, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.out" });
  const split = title ? splitWords(title) : null;
  if (split) {
    gsap.fromTo(
      split.parts,
      { opacity: 0, y: "0.35em", filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.06, delay: 0.35, ...SPRINGS.REVEAL },
    );
  }
  gsap.fromTo(items, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.07, delay: 0.5, ...SPRINGS.ITEM });
  return () => split?.revert();
}

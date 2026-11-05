import { gsap } from "@/lib/motion/gsap";
import { SPRINGS } from "@/lib/motion/spring";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const CHAR_MS = 10;
const LINE_GAP_MS = 60;
const MIN_BOOT_MS = 1200;

interface BootOptions {
  /** Repeat visit in the same session: skip the typing and the progress bar. */
  skipIntro: boolean;
  /** Fires when the screen collapses: unlock scroll, drop the header, start the hero. */
  onHandover: () => void;
  isCancelled: () => boolean;
  loadedLabel: string;
}

async function typeLine(line: HTMLElement) {
  const text = line.querySelector<HTMLElement>("[data-boot-text]");
  const full = text?.dataset.full ?? "";
  for (let i = 1; text && i <= full.length; i++) {
    text.textContent = full.slice(0, i);
    await wait(CHAR_MS);
  }
  line.querySelector<HTMLElement>("[data-boot-status]")?.classList.remove("opacity-0");
}

/** Brief, act 00: the CRT turns on, types the log, waits for the fonts and turns off. */
export async function runBootSequence(root: HTMLElement, { skipIntro, onHandover, isCancelled, loadedLabel }: BootOptions) {
  const screen = root.querySelector<HTMLElement>("[data-boot-screen]");
  const bar = root.querySelector<HTMLElement>("[data-boot-bar]");
  const percent = root.querySelector<HTMLElement>("[data-boot-percent]");
  const lines = [...root.querySelectorAll<HTMLElement>("[data-boot-line]")];
  if (!screen || !bar || !percent) return;

  const ready = Promise.all([document.fonts?.ready, wait(MIN_BOOT_MS)]);
  gsap.set(screen, { scaleX: 0.004, scaleY: 0.004, filter: "brightness(4)" });

  await wait(260);
  if (isCancelled()) return;
  await gsap.to(screen, { scaleX: 1, duration: 0.32, ease: "power3.out" });
  await gsap.to(screen, { scaleY: 1, filter: "brightness(1)", ...SPRINGS.REVEAL });

  if (!skipIntro) {
    const progress = { value: 0 };
    const render = () => {
      bar.style.width = `${progress.value * 100}%`;
      percent.textContent = `${Math.round(progress.value * 100)}%`;
    };
    gsap.to(progress, { value: 0.7, duration: 1, ease: "power2.out", onUpdate: render });
    for (const line of lines) {
      await typeLine(line);
      if (isCancelled()) return;
      await wait(LINE_GAP_MS);
    }
    await ready;
    if (isCancelled()) return;
    await gsap.to(progress, { value: 1, ...SPRINGS.ITEM, onUpdate: render, overwrite: true });
    await wait(200);
  }

  root.setAttribute("aria-label", loadedLabel);
  await gsap.to(screen, { scaleY: 0.004, filter: "brightness(4)", duration: 0.22, ease: "power3.in" });
  onHandover();
  await gsap.to(screen, { scaleX: 0, duration: 0.18, ease: "power3.in" });
  await gsap.to(root, { opacity: 0, duration: 0.35 });
}

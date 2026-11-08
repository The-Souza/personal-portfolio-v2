import type Lenis from "lenis";

type ScrollTarget = string | HTMLElement | number;

// Module-level on purpose: the page has one Lenis, and the controls must work
// from anywhere (the drawer, the boot) without re-rendering when it changes.
let instance: Lenis | null = null;
// The boot asks to stop before the provider's effect creates Lenis (children's effects run
// first), so the request is kept and applied when the instance appears.
let stopRequested = false;

const controls = {
  /** Locks scrolling, e.g. while the drawer or the boot is on screen. */
  stop: () => {
    stopRequested = true;
    instance?.stop();
  },
  start: () => {
    stopRequested = false;
    instance?.start();
  },
  scrollTo: (target: ScrollTarget) => {
    if (instance) {
      instance.scrollTo(target);
      return;
    }
    if (typeof target === "number") window.scrollTo(0, target);
    else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
  },
};

/** The page's scroll controls; they fall back to native scrolling when Lenis is off. */
export function useLenis() {
  return controls;
}

/** Internal links (`#about`) scroll with Lenis; Lenis alone would let the browser jump first. */
function onAnchorClick(event: MouseEvent) {
  if (!instance || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
  const hash = link?.getAttribute("href");
  if (!hash || hash === "#") return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;

  event.preventDefault();
  instance.scrollTo(target);
  history.replaceState(null, "", hash);
}

/**
 * Hands the page's Lenis to the controls (LenisProvider creates it): applies a stop asked for
 * before it existed and takes over internal links. Returns the disconnect.
 */
export function connectLenis(lenis: Lenis) {
  instance = lenis;
  if (stopRequested) lenis.stop();
  document.addEventListener("click", onAnchorClick);
  return () => {
    document.removeEventListener("click", onAnchorClick);
    instance = null;
  };
}

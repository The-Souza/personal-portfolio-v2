import type Lenis from "lenis";
import { hashId } from "@/lib/scroll/hash";
import { landingFor } from "@/lib/scroll/landing";

type ScrollTarget = string | HTMLElement | number;

// Module-level on purpose: the page has one Lenis, and the controls must work
// from anywhere (the drawer, the boot) without re-rendering when it changes.
let instance: Lenis | null = null;
// The boot asks to stop before the provider's effect creates Lenis (children's effects run
// first), so the request is kept and applied when the instance appears.
let stopRequested = false;

/** A `#section` target goes to the section's landing point when it registered one. */
function withLanding(target: ScrollTarget): ScrollTarget {
  if (typeof target !== "string" || !target.startsWith("#")) return target;
  const id = hashId(target);
  return (id && landingFor(id)) ?? target;
}

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
  scrollTo: (requested: ScrollTarget) => {
    const target = withLanding(requested);
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
  const id = hash ? hashId(hash) : null;
  if (!hash || !id) return;
  const target = document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  instance.scrollTo(landingFor(id) ?? target);
  history.replaceState(null, "", hash);
  // The browser's own jump would also move the focus there; preventing it keeps the focus on the
  // link, and a skip link would skip nothing. Targets that take focus (tabindex) get it back.
  if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
}

/**
 * A hash typed into the address bar of the open page (or a history step between hashes) makes
 * the browser jump to the section's top; a section with a landing point goes there instead.
 */
function onHashChange() {
  const id = hashId(window.location.hash);
  const landing = id ? landingFor(id) : null;
  if (instance && landing !== null) instance.scrollTo(landing, { immediate: true });
}

/**
 * Hands the page's Lenis to the controls (LenisProvider creates it): applies a stop asked for
 * before it existed and takes over internal links. Returns the disconnect.
 */
export function connectLenis(lenis: Lenis) {
  instance = lenis;
  if (stopRequested) lenis.stop();
  document.addEventListener("click", onAnchorClick);
  window.addEventListener("hashchange", onHashChange);
  return () => {
    document.removeEventListener("click", onAnchorClick);
    window.removeEventListener("hashchange", onHashChange);
    instance = null;
  };
}

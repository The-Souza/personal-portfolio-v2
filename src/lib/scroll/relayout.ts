import { MEDIA, resolveActVariant } from "@/lib/motion/breakpoints";
import { ScrollTrigger } from "@/lib/motion/gsap";
import { holdPageHeight } from "@/lib/scroll/viewport";

/** After the last resize event of a round: the window has stopped changing. */
const SETTLE_MS = 150;

/**
 * One rebuild pass for the pinned acts when the size (or the screen band) changes. Each act
 * rebuilding on its own timer left the acts below it with stale positions for a few frames (the
 * Contact blade sweeping out); here they rebuild in page order in a single task, then one
 * ScrollTrigger refresh, then `onRelayout` listeners (the ScrollKeeper puts the visitor back).
 * It runs at the first resize, so a one-step change (a phone turning, a DevTools preset) never
 * shows the page half-measured, and once more at the end if the size kept changing (a drag).
 */
const rebuilders = new Map<Element, () => void>();
const startListeners = new Set<() => void>();
const doneListeners = new Set<() => void>();

let width = 0;
let height = 0;
let variant = "";
let settling = false;
let dirty = false;
let timer = 0;
let listening = false;

const variantNow = () =>
  resolveActVariant({
    width: window.innerWidth,
    height: window.innerHeight,
    reducedMotion: window.matchMedia(MEDIA.reducedMotion).matches,
  });

function run() {
  const order = [...rebuilders.keys()].sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
  // Reverting a pin removes its spacer for a moment; near the end of the page that would clamp
  // the scroll into an earlier act.
  const release = holdPageHeight();
  for (const element of order) rebuilders.get(element)?.();
  ScrollTrigger.refresh();
  release();
  for (const listener of doneListeners) listener();
}

function onResize() {
  const nextVariant = variantNow();
  // On touch screens a height-only change is the address bar showing or hiding: nothing to
  // rebuild (ScrollTrigger's `ignoreMobileResize` does the same). Elsewhere the pins, sized in
  // vh, need it.
  const heightCounts = ScrollTrigger.isTouch !== 1 && window.innerHeight !== height;
  if (window.innerWidth === width && nextVariant === variant && !heightCounts) return;
  const bandChanged = nextVariant !== variant;
  width = window.innerWidth;
  height = window.innerHeight;
  variant = nextVariant;
  if (settling) dirty = true;
  else {
    settling = true;
    for (const listener of startListeners) listener();
    // A band change also swaps the acts through gsap.matchMedia, whose media listeners fire after
    // this event, in the same frame. Rebuilt now, the acts were measured in the old band and the
    // ScrollKeeper restored the place before the swap changed every height: the page drifted
    // into another act. The next animation frame runs after the swap.
    if (bandChanged) requestAnimationFrame(run);
    else run();
  }
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    settling = false;
    if (!dirty) return;
    dirty = false;
    run();
  }, SETTLE_MS);
}

function listen() {
  if (listening) return;
  listening = true;
  width = window.innerWidth;
  height = window.innerHeight;
  variant = variantNow();
  window.addEventListener("resize", onResize);
}

/** Rebuilds `element`'s act on each relayout, in page order with the others. */
export function registerRelayout(element: Element, rebuild: () => void) {
  listen();
  rebuilders.set(element, rebuild);
  return () => {
    if (rebuilders.get(element) === rebuild) rebuilders.delete(element);
  };
}

/** Called once when a relayout starts (the first resize of a round). */
export function onRelayoutStart(listener: () => void) {
  listen();
  startListeners.add(listener);
  return () => {
    startListeners.delete(listener);
  };
}

/** Called after every act has rebuilt and ScrollTrigger has refreshed. */
export function onRelayout(listener: () => void) {
  listen();
  doneListeners.add(listener);
  return () => {
    doneListeners.delete(listener);
  };
}

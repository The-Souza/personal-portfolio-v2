/**
 * True when the element already shows on screen at load (a reload or a language switch mid-page).
 * Entrance animations skip it: hiding server-rendered text only to fade it back in flashes it.
 */
export function isOnScreenAtLoad(el: Element) {
  return el.getBoundingClientRect().top < window.innerHeight;
}

let holds = 0;
let unheldMinHeight = "";

/**
 * Keeps the page at its current height until released. Rebuilding a pinned act removes its
 * spacer for a moment; near the end of the page that shortens it below the scroll position,
 * and the browser clamps the scroll up to an earlier act. Several acts can hold at once (they
 * rebuild together): the height stays until the last one releases.
 */
export function holdPageHeight() {
  const root = document.documentElement;
  if (holds === 0) {
    unheldMinHeight = root.style.minHeight;
    root.style.minHeight = `${root.scrollHeight}px`;
  }
  holds++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds--;
    if (holds === 0) root.style.minHeight = unheldMinHeight;
  };
}

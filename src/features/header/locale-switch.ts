const SCROLL_KEY = "locale-switch-scroll";

/**
 * Where the visitor was, relative to a section rather than the page: the other language's
 * text has a different length, and the pins (hero, projects) add scroll length only once
 * their ScrollTriggers exist, so an absolute `scrollY` would land somewhere else.
 */
export interface ScrollAnchor {
  section: string;
  offset: number;
}

export function localeHref(locale: string, hash: string) {
  return `/${locale}${hash}`;
}

export function saveScrollAnchor(anchor: ScrollAnchor) {
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ section: anchor.section, offset: Math.round(anchor.offset) }));
  } catch {
    // Storage can be blocked; the switch still works, just without restoring the position.
  }
}

/** Reads the saved anchor once, so a later navigation doesn't reuse it. */
export function consumeScrollAnchor(): ScrollAnchor | null {
  try {
    const value = sessionStorage.getItem(SCROLL_KEY);
    sessionStorage.removeItem(SCROLL_KEY);
    if (value === null) return null;
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    const { section, offset } = parsed as Record<string, unknown>;
    return typeof section === "string" && typeof offset === "number" && Number.isFinite(offset) ? { section, offset } : null;
  } catch {
    return null;
  }
}

/** The act a page was opened at (`/pt#contact`), or null when the hash isn't one of them. */
export function hashSection(hash: string, ids: readonly string[]) {
  try {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    return ids.includes(id) ? id : null;
  } catch {
    return null;
  }
}

/** The anchor for a scroll position: the last section that starts at or above it. */
export function anchorAt(tops: { id: string; top: number }[], scrollY: number): ScrollAnchor | null {
  const current = tops.findLast(({ top }) => top <= scrollY) ?? tops[0];
  return current ? { section: current.id, offset: scrollY - current.top } : null;
}

/**
 * A reload or a history step returns to where the visitor was, like the language switch. A new
 * navigation doesn't: it starts at the top or at the link's hash.
 */
export function shouldRestoreScroll(navigationType: string, localeSwitch: boolean) {
  return localeSwitch || navigationType === "reload" || navigationType === "back_forward";
}

export function scrollTargetFor(anchor: ScrollAnchor, sectionTop: number) {
  return Math.max(0, sectionTop + anchor.offset);
}

/** The section's top in page coordinates, or null if it isn't on this page. */
export function sectionTop(id: string) {
  const section = document.getElementById(id);
  return section ? section.getBoundingClientRect().top + window.scrollY : null;
}

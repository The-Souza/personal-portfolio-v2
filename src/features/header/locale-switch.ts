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

/** Reads the saved anchor once, so a later reload doesn't jump. */
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

export function scrollTargetFor(anchor: ScrollAnchor, sectionTop: number) {
  return Math.max(0, sectionTop + anchor.offset);
}

/** The section's top in page coordinates, or null if it isn't on this page. */
export function sectionTop(id: string) {
  const section = document.getElementById(id);
  return section ? section.getBoundingClientRect().top + window.scrollY : null;
}

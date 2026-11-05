const SCROLL_KEY = "locale-switch-scroll";

export function localeHref(locale: string, hash: string) {
  return `/${locale}${hash}`;
}

export function saveScrollPosition(y: number) {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(y)));
  } catch {
    // Storage can be blocked; the switch still works, just without restoring the position.
  }
}

/** Reads the saved position once, so a later reload doesn't jump. */
export function consumeScrollPosition() {
  try {
    const value = sessionStorage.getItem(SCROLL_KEY);
    sessionStorage.removeItem(SCROLL_KEY);
    if (value === null) return null;
    const y = Number(value);
    return Number.isFinite(y) ? y : null;
  } catch {
    return null;
  }
}

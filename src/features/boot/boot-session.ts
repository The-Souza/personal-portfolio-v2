const SEEN_KEY = "boot-seen";
const SKIP_KEY = "boot-skip";

/** Repeat visits in the same session skip the typing and the progress bar (brief, act 00). */
export function hasSeenBoot() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markBootSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Without storage every visit gets the full boot, which is fine.
  }
}

/** Asks the next page load to skip the boot entirely, e.g. after switching language. */
export function requestBootSkip() {
  try {
    sessionStorage.setItem(SKIP_KEY, "1");
  } catch {
    // Without storage the next page shows the short boot, which is fine.
  }
}

/** Reads the skip request once, so a later reload shows the boot again. */
export function consumeBootSkip() {
  try {
    const requested = sessionStorage.getItem(SKIP_KEY) === "1";
    sessionStorage.removeItem(SKIP_KEY);
    return requested;
  } catch {
    return false;
  }
}

/**
 * Inline script for the top of <body>, run before the first paint:
 * - `js` on every load, so CSS can drop no-JS fallbacks (like the scrollable project track)
 *   before the first paint instead of after hydration;
 * after a language switch:
 * - `boot-skip` hides the boot veil, so a skipped boot never flashes;
 * - `locale-restoring` hides the page until the scroll position is back (the LanguageSwitcher
 *   removes it), so the top of the page never flashes either. After 3s it lifts on its own,
 *   so the page can't stay hidden if something fails.
 */
export const BOOT_SKIP_SCRIPT = `var h=document.documentElement;h.classList.add("js");try{if(sessionStorage.getItem("${SKIP_KEY}")==="1"){h.classList.add("boot-skip","locale-restoring");setTimeout(function(){h.classList.remove("locale-restoring")},3000)}}catch(e){}`;

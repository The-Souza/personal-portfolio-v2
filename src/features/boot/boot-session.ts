const SEEN_KEY = "boot-seen";

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

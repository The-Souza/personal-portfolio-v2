const KEY = "played-animations";

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Entrance animations play once per session: after a reload or a language switch, whatever
 * already played shows in its end state. Keys don't depend on the language.
 */
export function hasPlayed(key: string) {
  return read().includes(key);
}

export function markPlayed(key: string) {
  const played = read();
  if (played.includes(key)) return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...played, key]));
  } catch {
    // Without storage the animation simply plays again next time.
  }
}

/**
 * The element id a hash points to (`#contact` → "contact"), decoded; null when it's empty or its
 * escapes are malformed (`#%E0`). Hashes come from the URL and from links, so a bad one must not
 * throw a URIError inside a listener.
 */
export function hashId(hash: string) {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

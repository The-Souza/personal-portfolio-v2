// Where an internal link to a section should land, when that isn't the section's top: the
// contact poster only finishes entering at the end of its pin, so `#contact` lands there.
const landings = new Map<string, () => number>();

/** Registers a section's landing point, measured when a link asks for it. Returns the unregister. */
export function registerLanding(id: string, getY: () => number) {
  landings.set(id, getY);
  return () => {
    // A rebuild registers again before the old setup is cleaned up: keep the newer one.
    if (landings.get(id) === getY) landings.delete(id);
  };
}

/** The scroll position a link to `id` should land on, or null to land on the section's top. */
export function landingFor(id: string) {
  return landings.get(id)?.() ?? null;
}

type Listener = () => void;

let done = false;
const listeners = new Set<Listener>();

export function isBootDone() {
  return done;
}

/**
 * Runs `listener` at the handover (scroll unlocks, header drops in, hero entrance starts),
 * or right away if the boot already handed over or never ran.
 */
export function onBootHandover(listener: Listener) {
  if (done) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function completeBoot() {
  if (done) return;
  done = true;
  for (const listener of listeners) listener();
  listeners.clear();
}

export function resetBootForTests() {
  done = false;
  listeners.clear();
}

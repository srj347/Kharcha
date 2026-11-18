// SQLite has no subscription API that we use here, so every repository write
// bumps this counter. Hooks re-run their queries when it changes.

type Listener = () => void;

let version = 0;
const listeners = new Set<Listener>();

export function bumpDataVersion(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

export function getDataVersion(): number {
  return version;
}

export function subscribeDataVersion(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

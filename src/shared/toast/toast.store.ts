// One toast at a time, shown above the tab bar on every screen.

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

export interface ToastState extends ToastOptions {
  id: number;
}

const DEFAULT_DURATION_MS = 5000;

type Listener = () => void;

let current: ToastState | null = null;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function hideToast(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  current = null;
  emit();
}

export function showToast(options: ToastOptions): void {
  if (timer) clearTimeout(timer);
  current = { ...options, id: nextId };
  nextId += 1;
  timer = setTimeout(hideToast, options.durationMs ?? DEFAULT_DURATION_MS);
  emit();
}

export function getToast(): ToastState | null {
  return current;
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

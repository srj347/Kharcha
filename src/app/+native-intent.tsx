import { rewriteSystemPath } from '@/features/shortcut/system-path';

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    return rewriteSystemPath(path);
  } catch (error: unknown) {
    console.warn('[shortcut] could not rewrite path', error);
    return path;
  }
}

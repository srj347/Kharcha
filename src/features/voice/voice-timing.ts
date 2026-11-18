// Timing rules for hands-free listening (docs/PLAN.md §4, "Auto-listen rules").

// The sentence is complete after this much silence following some speech.
export const END_OF_SPEECH_MS = 1200;
// Stop listening when nobody speaks for this long.
export const IDLE_TIMEOUT_MS = 8000;
// How often the hook checks the two rules above.
export const TICK_MS = 200;

export interface ListeningClock {
  startedAt: number;
  lastHeardAt: number | null;
  transcript: string;
}

export type ListeningStep = 'wait' | 'finish' | 'timeout';

export function nextListeningStep(clock: ListeningClock, now: number): ListeningStep {
  if (clock.lastHeardAt !== null && clock.transcript.trim().length > 0) {
    return now - clock.lastHeardAt >= END_OF_SPEECH_MS ? 'finish' : 'wait';
  }
  return now - clock.startedAt >= IDLE_TIMEOUT_MS ? 'timeout' : 'wait';
}

// Words the recogniser should expect: category names and their keywords.
const MAX_CONTEXT_WORDS = 100;

export function contextualWords(categories: { name: string; keywords: string }[]): string[] {
  const words = new Set<string>();
  categories.forEach((category) => {
    words.add(category.name);
    category.keywords
      .split(',')
      .map((word) => word.trim())
      .filter(Boolean)
      .forEach((word) => words.add(word.charAt(0).toUpperCase() + word.slice(1)));
  });
  return [...words].slice(0, MAX_CONTEXT_WORDS);
}

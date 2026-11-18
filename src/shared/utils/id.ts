const RANDOM_PART_LENGTH = 10;

// Local-only ids: time-ordered prefix plus random suffix. Unique enough for one
// device, and sortable when read in a database browser.
export function createId(): string {
  const time = Date.now().toString(36);
  let random = '';
  while (random.length < RANDOM_PART_LENGTH) {
    random += Math.random().toString(36).slice(2);
  }
  return `${time}-${random.slice(0, RANDOM_PART_LENGTH)}`;
}

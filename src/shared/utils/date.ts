// All keys use the device's local time zone, matching SQLite's 'localtime'.

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = MONTH_NAMES.map((name) => name.slice(0, 3));
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function monthKey(time: number): string {
  const date = new Date(time);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function dayKey(time: number): string {
  const date = new Date(time);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split('-').map(Number);
  return { year, month: month - 1 };
}

export function shiftMonthKey(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  const date = new Date(year, month + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

// The last `count` month keys, oldest first, ending with `endKey`.
export function monthKeysEndingAt(endKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => shiftMonthKey(endKey, index - count + 1));
}

export function formatMonthLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTH_NAMES[month]} ${year}`;
}

export function formatShortMonth(key: string): string {
  return SHORT_MONTHS[parseMonthKey(key).month];
}

// "Today", "Yesterday", or "Mon, 16 Nov" (year added when not this year).
export function formatDayLabel(key: string, now: number = Date.now()): string {
  if (key === dayKey(now)) return 'Today';
  if (key === dayKey(now - MS_PER_DAY)) return 'Yesterday';
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const base = `${SHORT_DAYS[date.getDay()]}, ${day} ${SHORT_MONTHS[month - 1]}`;
  return year === new Date(now).getFullYear() ? base : `${base} ${year}`;
}

// "9:40 am"
export function formatTime(time: number): string {
  const date = new Date(time);
  const hours = date.getHours();
  const suffix = hours < 12 ? 'am' : 'pm';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(date.getMinutes())} ${suffix}`;
}

// Moves `time` to the given local calendar day, keeping its clock time.
export function withDay(time: number, key: string): number {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(time);
  date.setFullYear(year, month - 1, day);
  return date.getTime();
}

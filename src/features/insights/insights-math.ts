import type { CategoryTotal, MonthTotal } from '@/db/types';

export interface CategoryBar extends CategoryTotal {
  percent: number; // whole numbers that add up to 100
  fraction: number; // bar length, 0..1, relative to the largest category
}

// Largest-remainder rounding, so the shown percentages always add up to 100.
export function toCategoryBars(totals: CategoryTotal[]): CategoryBar[] {
  const sum = totals.reduce((total, item) => total + item.totalPaise, 0);
  if (sum <= 0) return [];
  const max = Math.max(...totals.map((item) => item.totalPaise));

  const raw = totals.map((item) => (item.totalPaise / sum) * 100);
  const floors = raw.map(Math.floor);
  let missing = 100 - floors.reduce((total, value) => total + value, 0);
  const order = raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const { index } of order) {
    if (missing <= 0) break;
    floors[index] += 1;
    missing -= 1;
  }

  return totals.map((item, index) => ({ ...item, percent: floors[index], fraction: item.totalPaise / max }));
}

export interface MonthBar extends MonthTotal {
  fraction: number;
}

export function toMonthBars(months: MonthTotal[]): MonthBar[] {
  const max = Math.max(0, ...months.map((month) => month.totalPaise));
  return months.map((month) => ({ ...month, fraction: max > 0 ? month.totalPaise / max : 0 }));
}

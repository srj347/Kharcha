// Runs with TZ=Asia/Kolkata (see the "test" npm script).
import { dayKey, formatDayLabel, formatTime, monthKey, monthKeysEndingAt, shiftMonthKey, withDay } from './date';

// 2026-10-31T18:45:00Z is 1 Nov 2026, 00:15 in India.
const JUST_AFTER_IST_MIDNIGHT = Date.UTC(2026, 9, 31, 18, 45);

describe('local date keys', () => {
  it('runs in the India time zone', () => {
    expect(new Date(JUST_AFTER_IST_MIDNIGHT).getTimezoneOffset()).toBe(-330);
  });

  it('puts an expense at 00:15 IST in the new month and day', () => {
    expect(monthKey(JUST_AFTER_IST_MIDNIGHT)).toBe('2026-11');
    expect(dayKey(JUST_AFTER_IST_MIDNIGHT)).toBe('2026-11-01');
  });

  it('shifts month keys across years', () => {
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12');
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01');
  });

  it('lists the last six months oldest first', () => {
    expect(monthKeysEndingAt('2026-02', 6)).toEqual(['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02']);
  });
});

describe('labels', () => {
  const now = new Date(2026, 10, 18, 13, 15).getTime();

  it('names today and yesterday', () => {
    expect(formatDayLabel('2026-11-18', now)).toBe('Today');
    expect(formatDayLabel('2026-11-17', now)).toBe('Yesterday');
  });

  it('formats older days', () => {
    expect(formatDayLabel('2026-11-16', now)).toBe('Mon, 16 Nov');
    expect(formatDayLabel('2025-11-16', now)).toBe('Sun, 16 Nov 2025');
  });

  it('formats times in 12-hour clock', () => {
    expect(formatTime(new Date(2026, 10, 18, 9, 40).getTime())).toBe('9:40 am');
    expect(formatTime(new Date(2026, 10, 18, 0, 5).getTime())).toBe('12:05 am');
    expect(formatTime(new Date(2026, 10, 18, 13, 15).getTime())).toBe('1:15 pm');
  });

  it('moves a time to another day and keeps the clock time', () => {
    const moved = withDay(new Date(2026, 10, 18, 9, 40).getTime(), '2026-11-15');
    expect(new Date(moved).getDate()).toBe(15);
    expect(formatTime(moved)).toBe('9:40 am');
  });
});

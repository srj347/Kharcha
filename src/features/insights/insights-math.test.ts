import { toCategoryBars, toMonthBars } from './insights-math';

function total(name: string, totalPaise: number) {
  return { categoryId: name, name, icon: 'cart', tint: 'green' as const, totalPaise };
}

describe('toCategoryBars', () => {
  it('returns percentages that add up to 100', () => {
    const bars = toCategoryBars([total('A', 620000), total('B', 310000), total('C', 295000), total('D', 240000), total('E', 210000), total('F', 170000)]);
    expect(bars.map((bar) => bar.percent)).toEqual([34, 17, 16, 13, 11, 9]);
    expect(bars.reduce((sum, bar) => sum + bar.percent, 0)).toBe(100);
  });

  it('handles thirds', () => {
    const bars = toCategoryBars([total('A', 100), total('B', 100), total('C', 100)]);
    expect(bars.reduce((sum, bar) => sum + bar.percent, 0)).toBe(100);
  });

  it('sizes bars against the largest category', () => {
    const bars = toCategoryBars([total('A', 400), total('B', 100)]);
    expect(bars.map((bar) => bar.fraction)).toEqual([1, 0.25]);
  });

  it('is empty when nothing was spent', () => {
    expect(toCategoryBars([])).toEqual([]);
  });
});

describe('toMonthBars', () => {
  it('scales months against the largest month and keeps zero months', () => {
    const bars = toMonthBars([
      { monthKey: '2026-10', totalPaise: 0 },
      { monthKey: '2026-11', totalPaise: 2000 },
      { monthKey: '2026-12', totalPaise: 1000 },
    ]);
    expect(bars.map((bar) => bar.fraction)).toEqual([0, 1, 0.5]);
  });

  it('handles all-zero months', () => {
    expect(toMonthBars([{ monthKey: '2026-10', totalPaise: 0 }])[0].fraction).toBe(0);
  });
});

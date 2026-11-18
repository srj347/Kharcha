import { applyKeypadKey, formatAmountInput, formatINR, paiseToInputText, parseAmountInput, rupeesToPaise } from './money';

describe('formatINR', () => {
  it.each([
    [50000, '₹500'],
    [50050, '₹500.50'],
    [5, '₹0.05'],
    [123456700, '₹12,34,567'],
    [99999, '₹999.99'],
    [100000, '₹1,000'],
    [10000000, '₹1,00,000'],
  ])('formats %i paise as %s', (paise, expected) => {
    expect(formatINR(paise)).toBe(expected);
  });

  it('can leave out the symbol', () => {
    expect(formatINR(184500, { symbol: false })).toBe('1,845');
  });
});

describe('rupeesToPaise', () => {
  it('avoids float errors', () => {
    expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
    expect(rupeesToPaise(19.99)).toBe(1999);
  });
});

describe('parseAmountInput', () => {
  it.each([
    ['500', 50000],
    ['500.5', 50050],
    ['0.75', 75],
    ['500.', 50000],
  ])('parses %s', (text, paise) => {
    expect(parseAmountInput(text)).toBe(paise);
  });

  it.each(['', '0', '0.00', 'abc', '1.234', '-5'])('rejects %p', (text) => {
    expect(parseAmountInput(text)).toBeNull();
  });
});

describe('keypad', () => {
  function type(keys: string[]): string {
    return keys.reduce(applyKeypadKey, '');
  }

  it('builds an amount', () => {
    expect(type(['5', '0', '0'])).toBe('500');
  });

  it('allows one decimal point and two decimals', () => {
    expect(type(['1', '.', '.', '5', '5', '5'])).toBe('1.55');
  });

  it('starts a decimal with a zero', () => {
    expect(type(['.', '5'])).toBe('0.5');
  });

  it('replaces a leading zero', () => {
    expect(type(['0', '7'])).toBe('7');
  });

  it('limits to seven integer digits', () => {
    expect(type(['1', '2', '3', '4', '5', '6', '7', '8'])).toBe('1234567');
  });

  it('deletes the last character', () => {
    expect(type(['5', '0', 'del'])).toBe('5');
    expect(type(['del'])).toBe('');
  });

  it('turns paise back into keypad text', () => {
    expect(paiseToInputText(50000)).toBe('500');
    expect(paiseToInputText(50050)).toBe('500.5');
    expect(paiseToInputText(50005)).toBe('500.05');
    expect(parseAmountInput(paiseToInputText(123456))).toBe(123456);
  });

  it('groups digits for display', () => {
    expect(formatAmountInput('1234567.5')).toBe('12,34,567.5');
    expect(formatAmountInput('')).toBe('0');
  });
});

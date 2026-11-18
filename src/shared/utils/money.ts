const PAISE_PER_RUPEE = 100;
export const MAX_AMOUNT_PAISE = 99_99_999_00; // ₹99,99,999 — keeps keypad input sane

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * PAISE_PER_RUPEE);
}

// Indian digit grouping: 1234567 → "12,34,567".
function groupIndian(integerDigits: string): string {
  const lastThree = integerDigits.slice(-3);
  const rest = integerDigits.slice(0, -3);
  if (!rest) {
    return lastThree;
  }
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`;
}

// 50050 → "₹500.50", 50000 → "₹500". Paise are shown only when not zero.
export function formatINR(paise: number, options: { symbol?: boolean } = {}): string {
  const symbol = options.symbol ?? true;
  const sign = paise < 0 ? '-' : '';
  const absolute = Math.abs(Math.round(paise));
  const rupees = Math.floor(absolute / PAISE_PER_RUPEE);
  const remainder = absolute % PAISE_PER_RUPEE;
  const decimals = remainder === 0 ? '' : `.${String(remainder).padStart(2, '0')}`;
  return `${sign}${symbol ? '₹' : ''}${groupIndian(String(rupees))}${decimals}`;
}

// Keypad text → paise. Accepts "500", "500.5", "0.75". Returns null when the
// text is not a valid positive amount.
export function parseAmountInput(text: string): number | null {
  if (!/^\d+(\.\d{0,2})?$/.test(text)) {
    return null;
  }
  const paise = rupeesToPaise(Number(text));
  if (paise <= 0 || paise > MAX_AMOUNT_PAISE) {
    return null;
  }
  return paise;
}

// Paise → keypad text: 50050 → "500.5", 50000 → "500".
export function paiseToInputText(paise: number): string {
  const rupees = Math.floor(paise / PAISE_PER_RUPEE);
  const remainder = paise % PAISE_PER_RUPEE;
  if (remainder === 0) return String(rupees);
  return `${rupees}.${String(remainder).padStart(2, '0').replace(/0$/, '')}`;
}

// Keypad text with grouping for display: "1234567.5" → "12,34,567.5".
export function formatAmountInput(text: string): string {
  if (!text) {
    return '0';
  }
  const [integer, decimal] = text.split('.');
  const grouped = groupIndian(integer || '0');
  return decimal === undefined ? grouped : `${grouped}.${decimal}`;
}

const MAX_INTEGER_DIGITS = 7;
const MAX_DECIMAL_DIGITS = 2;

// Applies one keypad key ("0"-"9", ".", "del") to the current input text.
export function applyKeypadKey(text: string, key: string): string {
  if (key === 'del') {
    return text.slice(0, -1);
  }
  if (key === '.') {
    if (text.includes('.')) return text;
    return text === '' ? '0.' : `${text}.`;
  }
  if (!/^\d$/.test(key)) {
    return text;
  }
  const [integer, decimal] = text.split('.');
  if (decimal !== undefined) {
    return decimal.length >= MAX_DECIMAL_DIGITS ? text : `${text}${key}`;
  }
  if (integer === '0') {
    return key;
  }
  return integer.length >= MAX_INTEGER_DIGITS ? text : `${text}${key}`;
}

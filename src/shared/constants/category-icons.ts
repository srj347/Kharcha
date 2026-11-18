import type { SFSymbol } from 'expo-symbols';

// The icons a user can pick for a category. Stored in the database by name.
export const CATEGORY_SYMBOLS: SFSymbol[] = [
  'fork.knife',
  'cup.and.saucer',
  'takeoutbag.and.cup.and.straw',
  'cart',
  'basket',
  'car',
  'bus',
  'tram',
  'airplane',
  'fuelpump',
  'bag',
  'tshirt',
  'gift',
  'doc.text',
  'bolt',
  'wifi',
  'iphone',
  'house',
  'building.2',
  'wrench.and.screwdriver',
  'ticket',
  'film',
  'gamecontroller',
  'music.note',
  'cross.case',
  'pills',
  'heart',
  'figure.run',
  'graduationcap',
  'book',
  'pawprint',
  'leaf',
  'scissors',
  'person.2',
  'creditcard',
  'banknote',
  'sparkles',
  'square.grid.2x2',
];

const FALLBACK_SYMBOL: SFSymbol = 'square.grid.2x2';

export function toCategorySymbol(name: string): SFSymbol {
  return CATEGORY_SYMBOLS.find((symbol) => symbol === name) ?? FALLBACK_SYMBOL;
}

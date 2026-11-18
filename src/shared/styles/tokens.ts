import { DynamicColorIOS, Platform, type ColorValue } from 'react-native';

import type { CategoryTint } from '@/db/types';

// Design tokens from the Kharcha UI canvas (docs/PLAN.md §10). Every colour has
// a light and a dark value; iOS switches between them by itself.
function dynamic(light: string, dark: string): ColorValue {
  return Platform.OS === 'ios' ? DynamicColorIOS({ light, dark }) : light;
}

export const colors = {
  background: dynamic('#F7F7F4', '#111214'),
  surface: dynamic('#FFFFFF', '#1C1D20'),
  surfaceMuted: dynamic('#EDEDE8', '#26282C'),
  text: dynamic('#15171A', '#F2F2EE'),
  textMuted: dynamic('#60656D', '#A3A8AF'),
  border: dynamic('#E4E4DE', '#2E3034'),
  accent: dynamic('#1E6B52', '#4FB58E'),
  accentSoft: dynamic('#E3EFE9', '#1B3229'),
  onAccent: dynamic('#FFFFFF', '#0B1F17'),
  listening: dynamic('#C2410C', '#FB8B5B'),
  danger: dynamic('#B42318', '#F97066'),
  toastBackground: dynamic('#15171A', '#F2F2EE'),
  toastText: dynamic('#FFFFFF', '#15171A'),
  toastAction: dynamic('#9FD8C3', '#1E6B52'),
  scrim: 'rgba(0, 0, 0, 0.35)',
} as const;

export const tintColors: Record<CategoryTint, { background: ColorValue; foreground: ColorValue }> = {
  green: { background: dynamic('#E3EFE9', '#1B3229'), foreground: dynamic('#1E6B52', '#6FCBA5') },
  amber: { background: dynamic('#F6EBDD', '#3A2A17'), foreground: dynamic('#8A4B12', '#F0B46F') },
  blue: { background: dynamic('#E6EBF7', '#1C2540'), foreground: dynamic('#2F4FB0', '#8EA8F5') },
  purple: { background: dynamic('#EEE6F4', '#2D2238'), foreground: dynamic('#6B3F8F', '#C9A2EC') },
  slate: { background: dynamic('#E9ECEF', '#25292E'), foreground: dynamic('#3F4752', '#B3BCC8') },
  rose: { background: dynamic('#F8E5E8', '#3A1E25'), foreground: dynamic('#A3324A', '#F29AAE') },
  teal: { background: dynamic('#E0F1F1', '#163131'), foreground: dynamic('#1D6B6B', '#74D1D1') },
  orange: { background: dynamic('#FBE9DE', '#3B2418'), foreground: dynamic('#A3471B', '#F5A273') },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

export const fontSizes = {
  small: 12,
  caption: 13,
  body: 15,
  bodyLarge: 17,
  heading: 20,
  title: 30,
  amount: 44,
  amountLarge: 64,
} as const;

// Amounts use Space Grotesk (loaded in the root layout); text uses the system font.
export const fonts = {
  amount: 'SpaceGrotesk_600SemiBold',
  amountMedium: 'SpaceGrotesk_500Medium',
} as const;

export const MIN_TOUCH_SIZE = 44;

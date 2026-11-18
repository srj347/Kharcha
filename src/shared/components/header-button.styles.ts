import { StyleSheet } from 'react-native';

import { colors, fontSizes } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: '600',
    color: colors.accent,
  },
  disabled: {
    opacity: 0.4,
  },
});

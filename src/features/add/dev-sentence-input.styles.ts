import { StyleSheet } from 'react-native';

import { colors, fontSizes, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  input: {
    alignSelf: 'stretch',
    marginHorizontal: spacing.xl,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.caption,
    color: colors.text,
  },
});

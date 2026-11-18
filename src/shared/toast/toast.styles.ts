import { StyleSheet } from 'react-native';

import { colors, fontSizes, MIN_TOUCH_SIZE, radii, spacing } from '@/shared/styles/tokens';

// Distance below the top safe area.
export const TOP_OFFSET = 8;

export const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
  },
  toast: {
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: colors.toastBackground,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    color: colors.toastText,
    fontSize: fontSizes.body,
  },
  action: {
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  actionText: {
    color: colors.toastAction,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
});

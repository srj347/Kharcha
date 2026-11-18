import { StyleSheet } from 'react-native';

import { colors, fontSizes, MIN_TOUCH_SIZE, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  headerLabel: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  headerValue: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  iconButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: MIN_TOUCH_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  secondaryButton: {
    height: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryText: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.text,
  },
  modelHint: {
    marginHorizontal: spacing.xxl,
    fontSize: fontSizes.caption,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bottom: {
    paddingHorizontal: spacing.xl,
  },
});

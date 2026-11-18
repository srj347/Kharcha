import { StyleSheet } from 'react-native';

import { colors, fontSizes, MIN_TOUCH_SIZE, radii, spacing } from '@/shared/styles/tokens';

const ICON_CELL = 48;

export const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: 60,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  nameInput: {
    flex: 1,
    height: MIN_TOUCH_SIZE,
    fontSize: fontSizes.heading,
    fontWeight: '600',
    color: colors.text,
  },
  label: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  tints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tint: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: MIN_TOUCH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tintSelected: {
    borderWidth: 3,
    borderColor: colors.surface,
  },
  icons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconCell: {
    width: ICON_CELL,
    height: ICON_CELL,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  fieldInput: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
    backgroundColor: colors.border,
  },
  removeButton: {
    marginTop: spacing.xl,
    minHeight: 52,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: fontSizes.bodyLarge,
    color: colors.danger,
  },
});

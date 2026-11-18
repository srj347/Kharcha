import { Pressable, Text } from 'react-native';

import { styles } from './header-button.styles';

interface HeaderButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

// A text button for native stack headers (Done, Add, Save).
export function HeaderButton({ label, onPress, disabled = false, accessibilityLabel }: HeaderButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={10}>
      <Text style={[styles.label, disabled && styles.disabled]}>{label}</Text>
    </Pressable>
  );
}

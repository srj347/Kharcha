import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/styles/tokens';

import { styles } from './keypad.styles';

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
] as const;

interface KeypadProps {
  onKey: (key: string) => void;
}

function labelFor(key: string): string {
  if (key === 'del') return 'Delete digit';
  if (key === '.') return 'Decimal point';
  return key;
}

export function Keypad({ onKey }: KeypadProps) {
  function press(key: string) {
    void Haptics.selectionAsync();
    onKey(key);
  }

  return (
    <View style={styles.grid}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={labelFor(key)}
              onPress={() => press(key)}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
              {key === 'del' ? (
                <SymbolView name="delete.left" size={22} tintColor={colors.text} />
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

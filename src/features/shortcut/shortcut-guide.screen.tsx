import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/shared/styles/tokens';

import { styles } from './shortcut-guide.styles';

interface Step {
  symbol: SFSymbol;
  text: string;
}

const BACK_TAP_STEPS: Step[] = [
  { symbol: 'gear', text: 'Open the Settings app, then Accessibility › Touch › Back Tap.' },
  { symbol: 'hand.tap', text: 'Choose Double Tap (or Triple Tap).' },
  { symbol: 'indianrupeesign.circle', text: 'Scroll to Shortcuts and pick “Log Expense”.' },
];

function openShortcutsApp() {
  void Linking.openURL('shortcuts://');
}

export function ShortcutGuideScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Tap the back of your iPhone twice and Kharcha opens, already listening. Say the expense; it saves by itself.
      </Text>

      <Text style={styles.label}>SET UP BACK TAP (ONCE)</Text>
      <View style={styles.card}>
        {BACK_TAP_STEPS.map((step, index) => (
          <View key={step.text} style={[styles.step, index > 0 && styles.stepDivider]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step.text}</Text>
            <SymbolView name={step.symbol} size={18} tintColor={colors.textMuted} />
          </View>
        ))}
      </View>
      <Text style={styles.note}>iOS does not let apps change Back Tap, so this step is yours.</Text>

      <Text style={styles.label}>OTHER WAYS</Text>
      <View style={styles.card}>
        <View style={styles.step}>
          <SymbolView name="mic" size={18} tintColor={colors.accent} />
          <Text style={styles.stepText}>Say “Log expense in Kharcha” to Siri.</Text>
        </View>
        <View style={[styles.step, styles.stepDivider]}>
          <SymbolView name="button.horizontal.top.press" size={18} tintColor={colors.accent} />
          <Text style={styles.stepText}>Action Button: Settings › Action Button › Shortcut › Log Expense.</Text>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={openShortcutsApp} style={styles.button}>
        <Text style={styles.buttonText}>Open Shortcuts</Text>
      </Pressable>
    </ScrollView>
  );
}

import { router, Stack } from 'expo-router';

import { HeaderButton } from '@/shared/components/header-button.component';
import { colors } from '@/shared/styles/tokens';

function close() {
  router.dismiss();
}

function DoneButton() {
  return <HeaderButton label="Done" onPress={close} />;
}

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.text },
        headerStyle: { backgroundColor: colors.background },
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ title: 'Settings', headerRight: DoneButton }} />
      <Stack.Screen name="categories" options={{ title: 'Categories' }} />
      <Stack.Screen name="category" options={{ title: 'Category' }} />
      <Stack.Screen name="shortcut" options={{ title: 'Shortcut & Back Tap' }} />
    </Stack>
  );
}

import { SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, useFonts } from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { openAppDatabase } from '@/db/expo-adapter';
import { styles } from '@/shared/styles/root.styles';
import { ToastHost } from '@/shared/toast/toast.component';

// Open and migrate the database once, before any screen reads from it.
openAppDatabase();
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold });
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="entry"
          options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true, sheetCornerRadius: 28 }}
        />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="record" />
      </Stack>
      <ToastHost />
    </GestureHandlerRootView>
  );
}

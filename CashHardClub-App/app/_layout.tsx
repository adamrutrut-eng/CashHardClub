import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Cinzel_600SemiBold, Cinzel_700Bold, useFonts } from '@expo-google-fonts/cinzel';
import { Inter_300Light, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { colors } from '@/theme/tokens';
import { ContentProvider, useContent } from '@/data/ContentProvider';
import { addPushClickListener, initPush } from '@/lib/push';

// Keep the native splash up until fonts are ready (no flash of unstyled text).
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 350, fade: true });
SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});

// Deep links (cashhardclub://product/x, notification taps) open on top of the tabs, so "back" always works.
export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ContentProvider>
          <PushBootstrap />
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="event/[id]" />
            <Stack.Screen name="saved" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ContentProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Starts OneSignal (no permission prompt here) and routes notification taps to native screens. */
function PushBootstrap() {
  const { openUrl } = useContent();
  const router = useRouter();
  useEffect(() => {
    initPush();
    return addPushClickListener((url) => {
      if (url) openUrl(url);
      else router.navigate('/alerts');
    });
  }, [openUrl, router]);
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { addPushClickListener, initPush, loadPushPref } from '@/lib/push';
import { acceptTerms, getAcceptedTermsVersion, TERMS_VERSION, TermsContext, type TermsState } from '@/lib/terms';

// Keep the native splash up until fonts are ready and the stored Terms acceptance is read (no flash).
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

  // null = not read yet. The welcome (Terms) screen shows until the current TERMS_VERSION is accepted.
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [prevVersion, setPrevVersion] = useState<string | null>(null);
  useEffect(() => {
    // loadPushPref: the stored alerts choice must be known before initPush (consent before initialize).
    Promise.all([getAcceptedTermsVersion(), loadPushPref()]).then(([v]) => {
      setPrevVersion(v);
      setAccepted(v === TERMS_VERSION);
    });
  }, []);
  const terms = useMemo<TermsState>(
    () => ({
      accepted: accepted === true,
      previousVersion: prevVersion,
      accept: async () => {
        await acceptTerms(); // never throws; the app opens even if storage failed
        setAccepted(true);
      },
    }),
    [accepted, prevVersion],
  );

  const fontsReady = fontsLoaded || !!fontError;
  useEffect(() => {
    if (fontsReady && accepted !== null) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady, accepted]);

  if (!fontsReady || accepted === null) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <TermsContext.Provider value={terms}>
          <ContentProvider>
            <PushBootstrap accepted={accepted === true} />
            <StatusBar style="light" />
            {/* Deep links and notification taps can't reach a protected screen until the Terms are accepted;
                once they are, the welcome screen drops out of the stack and the app lands on the tabs. */}
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Protected guard={accepted === true}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="event/[id]" />
                <Stack.Screen name="saved" />
              </Stack.Protected>
              <Stack.Protected guard={accepted !== true}>
                <Stack.Screen name="welcome" options={{ gestureEnabled: false, animation: 'fade' }} />
              </Stack.Protected>
              <Stack.Screen name="+not-found" />
            </Stack>
          </ContentProvider>
        </TermsContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Starts OneSignal (no permission prompt here; nothing reaches OneSignal before the user turns alerts on)
 * and routes notification taps to native screens. Taps before the Terms are accepted just open the app.
 */
function PushBootstrap({ accepted }: { accepted: boolean }) {
  const { openUrl } = useContent();
  const router = useRouter();
  const acceptedRef = useRef(accepted);
  acceptedRef.current = accepted;
  useEffect(() => {
    initPush();
    return addPushClickListener((url) => {
      if (!acceptedRef.current) return;
      if (url) openUrl(url);
      else router.navigate('/alerts');
    });
  }, [openUrl, router]);
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});

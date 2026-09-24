import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';
import { colors } from '@/theme/tokens';

let opening = false;

/**
 * Opens a URL in the platform's in-app browser sheet:
 * SFSafariViewController on iOS, Chrome Custom Tabs on Android (Apple guideline-friendly checkout:
 * the user sees the real store URL, Safari cookies/Apple Pay work, and the app never sees card data).
 * HTTPS only — anything else is ignored.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  if (!/^https:\/\//i.test(url) || opening) return;
  opening = true;
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      toolbarColor: colors.bg,
      secondaryToolbarColor: colors.bg,
      controlsColor: colors.accent,
      dismissButtonStyle: 'close',
      enableBarCollapsing: true,
      showTitle: true,
      createTask: false,
    });
  } catch {
    // Custom Tabs unavailable (rare, e.g. no browser installed) → hand off to the system.
    try {
      await Linking.openURL(url);
    } catch {
      /* nothing sensible left to do */
    }
  } finally {
    opening = false;
  }
}

/** Android: pre-warm Chrome Custom Tabs so checkout opens instantly. No-op on iOS. */
export function warmBrowser() {
  if (Platform.OS === 'android') WebBrowser.warmUpAsync().catch(() => {});
}

export function coolBrowser() {
  if (Platform.OS === 'android') WebBrowser.coolDownAsync().catch(() => {});
}

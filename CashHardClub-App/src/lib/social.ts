import { Linking, Platform, Share } from 'react-native';
import { openInAppBrowser } from './browser';

export async function openInstagram(handle: string) {
  const app = `instagram://user?username=${handle}`;
  const web = `https://www.instagram.com/${handle}/`;
  try {
    if (await Linking.canOpenURL(app)) {
      await Linking.openURL(app);
      return;
    }
  } catch {
    /* fall through to the web profile */
  }
  await openInAppBrowser(web);
}

export function openEmail(to: string, subject?: string) {
  const url = `mailto:${to}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  Linking.openURL(url).catch(() => {});
}

/** Opens the platform maps app with a place search (no location permission needed). */
export function openDirections(query: string) {
  const q = encodeURIComponent(query);
  const native = Platform.select({ ios: `maps://?q=${q}`, android: `geo:0,0?q=${q}` });
  const web = `https://www.google.com/maps/search/?api=1&query=${q}`;
  if (!native) {
    openInAppBrowser(web);
    return;
  }
  Linking.openURL(native).catch(() => openInAppBrowser(web));
}

export async function shareLink(title: string, url: string) {
  try {
    await Share.share(Platform.OS === 'ios' ? { message: title, url } : { message: `${title}\n${url}` }, { dialogTitle: title, subject: title });
  } catch {
    /* user dismissed */
  }
}

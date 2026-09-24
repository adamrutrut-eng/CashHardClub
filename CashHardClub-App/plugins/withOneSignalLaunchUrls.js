// Expo config plugin: stop the OneSignal SDK from opening a notification's "Launch URL"
// in its own browser on Android. The app handles the URL itself (see src/lib/links.ts) so a
// push that carries a product link opens the native product screen instead of a web page.
// The iOS equivalent is the `OneSignal_suppress_launch_urls` Info.plist key in app.json.
const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

module.exports = function withOneSignalLaunchUrls(config) {
  return withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(app, 'com.onesignal.suppressLaunchURLs', 'true');
    return mod;
  });
};

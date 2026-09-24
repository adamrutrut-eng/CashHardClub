# 06 — Pre-submission checklist (tick every line before you hit Submit)

## Build & configuration — verified in the project

- [x] **HTTPS only.** `NSAppTransportSecurity → NSAllowsArbitraryLoads = false` is set in app.json and confirmed in the generated Info.plist. Every URL the app calls is `https://` (see `src/data/content.ts`); `fetchJson` and the in-app browser refuse anything else. Android uses the platform default (cleartext blocked).
- [x] **No secrets in the bundle.** The only identifier shipped is the OneSignal *App ID* (public by design). The OneSignal REST key, APNs `.p8`, and Firebase / Play service-account JSON files live only in `secrets/`, which is git-ignored along with `*.p8`, `*.p12`, `*.jks`, `*.key`, `*.pem`, `*.mobileprovision` and every `.env*` file except `.env.example`. Note that `.json` files are **not** ignored by pattern — a credential JSON is protected only because it sits inside `secrets/`, so never keep one anywhere else. Before each release run `git grep -nI --untracked -E "BEGIN (RSA |EC )?PRIVATE KEY|\"private_key\"|[Aa][Pp][Ii][_-]?[Kk][Ee][Yy][\"' ]*[:=]" -- . ':!node_modules' ':!package-lock.json'` — it should print nothing. (A plain grep for the word "secret" also matches these docs and `eas.json`'s `serviceAccountKeyPath`; that output is expected and is not a leak.)
- [x] **`npm audit`: 16 moderate, all transitive, none shipped-and-reachable, accepted with reason.** Three root causes.
  (1) `xcode@3.0.1 → uuid@7.0.3` (advisory for `uuid <11.1.1`, missing buffer bounds check in v3/v5/v6). `xcode` is pulled in by `@expo/config-plugins` and runs only during `npx expo prebuild` on the build machine. It is not in the app bundle. Most of the 16 rows are just the `@expo/*` chain re-reporting this one advisory.
  (2) `@expo/ngrok → uuid` — the same `uuid` advisory. `@expo/ngrok` is a **devDependency** used only by `npx expo start --tunnel` on a developer machine; it is never installed by EAS Build and never in the bundle.
  (3) `expo-router → query-string@7.1.3 → decode-uri-component@0.2.2` (GHSA-vcc3-ghjq-m6fr, DoS via exponential decoding of malformed percent-encoded input). The vulnerable code **is** bundled but is never invoked: `decode-uri-component` is referenced only by query-string's private `decode()`, reached only from `parse()` (`stringify()` never touches it). The one live `queryString.parse` call sits in `expo-router/build/react-navigation/core/getStateFromPath.js`, which is only a *default-parameter fallback* — expo-router always supplies its own `getStateFromPath` (`getLinkingConfig.js` → `fork/getStateFromPath.js`), and the fork parses query strings with `URLSearchParams`. No deep link the app handles reaches the vulnerable decoder.
  **Do not "fix" this with an `overrides` entry.** The advisory range is `<=0.4.2`, so the only clean version is `0.5.0`, which is ESM-only (`"type": "module"`, no CommonJS entry) while query-string@7 loads it with `require()`. Under Metro's interop `decodeComponent(value)` would throw `TypeError: decodeComponent is not a function` — a guaranteed crash on every deep link and every `router.push` with params, traded for a DoS that is never invoked. This clears only when expo-router bumps query-string to v8+. Re-verify at each Expo SDK bump.
- [x] **Secure storage.** v1 stores nothing sensitive. `src/lib/secure.ts` (Keychain / Keystore via expo-secure-store) is the only place tokens may go in v1.1.
- [x] **Push dashboard protected.** Sending requires a OneSignal login with 2FA enabled on every account. Team roles are set per doc 04 §7 — confirm before launch that nobody who does not need the REST API key holds an Admin role. Content is edited only via the website repo.
- [x] **Privacy manifest.** `PrivacyInfo.xcprivacy` generated with UserDefaults CA92.1, FileTimestamp C617.1, SystemBootTime 35F9.1, DiskSpace E174.1, collected data types Device ID + Product Interaction, tracking = false. React Native and Expo libraries ship their own manifests; Apple's post-upload email (if any) will name a missing reason — add it to `ios.privacyManifests` and rebuild.
- [x] **Push done Apple's way (4.5.4).** Permission requested only from the Alerts switch after consent copy; in-app opt-out switch; nothing requires notifications.
- [x] **In-app browser** uses SFSafariViewController / Chrome Custom Tabs (`expo-web-browser`), not a WebView.
- [x] **Export compliance.** `ITSAppUsesNonExemptEncryption = NO` in Info.plist (only standard HTTPS) — App Store Connect will not ask on each upload.
- [x] **Orientation:** portrait locked (app.json `orientation: portrait` → `android:screenOrientation="portrait"` in the manifest); iPhone-only on iOS (device family 1, runs in compatibility mode on iPad); on Android 16+ large screens the system ignores the lock (targetSdk 36), so the layout re-flows there — **Android 15 and older tablets stay portrait**. Test landscape and split-screen on a tablet (doc 03 §6, device 8).
- [x] **Android:** targetSdk 36 (Expo SDK 57 default), 64-bit (`arm64-v8a` included), `.aab` output, Play App Signing (EAS keeps only the upload key), storage/overlay permissions blocked, `allowBackup=false`.
- [x] **Accessibility:** Dynamic Type honored with caps; touch targets ≥ 44 pt; labels on icon buttons.
- [ ] `npm run typecheck` and `npm run doctor` pass on your machine.
- [ ] `npm run sync:content` run right before the production build.
- [ ] `extra.oneSignalAppId` (or `EXPO_PUBLIC_ONESIGNAL_APP_ID`) set; a test push received on the **production** build via TestFlight and on the Play internal build.
- [ ] The build you submit is the one you tested (check the build number in Club → footer).

## Content & completeness (Apple 2.1, 4.2)

- [ ] **Website branch merged and deployed.** `https://cashhardclub.com/privacy` and `https://cashhardclub.com/support` load **on your phone** (not just your PC), with **no trailing slash** — that is the exact string in `src/data/content.ts` and the form both stores will receive. `https://cashhardclub.com/events.json` returns valid JSON with real events (or a real past drop and no empty promises). Confirm `https://cashhardclub.com/CashHardClub-App/docs/07-SUBMIT-APPLE.md` returns **404** (the `_redirects` rule keeps the app source off the public site), and spot-check `https://cashhardclub.com/previous/` still renders. All three URLs are **404 today** — this is a hard gate, not a formality.
- [ ] No "coming soon", "beta", "test", placeholder images or dead links anywhere in the app. (Members/loyalty is **not** mentioned in v1.)
- [ ] Every product opens and its Buy button reaches a Squarespace product page; at least one product's full checkout reached (cart → checkout form).
- [ ] Alerts tab reads clearly and the permission prompt appears only from the switch.
- [ ] Club tab links: Instagram, store, website, support, privacy, both emails — all work.
- [ ] Crash-free pass of the test script (doc 03 §7) on your iPhone + Pixel 9 + tablet emulator.

## Store metadata

- [ ] App name `Cash Hard Club` confirmed available in App Store Connect; bundle ID `com.cashhardclub.app`; SKU `cashhardclub-app`.
- [ ] Screenshots: 6.9" set uploaded (1290×2796), ≥ 3 images showing the app in use, no alpha. Google: ≥ 2 phone screenshots (1080×1920), 512×512 icon, 1024×500 feature graphic.
- [ ] Description, subtitle/short description, keywords, category, copyright, support URL, marketing URL, privacy URL entered exactly as in doc 05.
- [ ] Age rating questionnaire completed (expected 4+ / Everyone).
- [ ] Apple App Privacy: Device ID + Product Interaction, not linked, no tracking. Google Data safety: same two types, encrypted in transit, deletion via email.
- [ ] App Review notes pasted (doc 05 §F) with your real phone number; *Sign-in required* = No.
- [ ] Version release set to **Manually release this version** (so approval doesn't publish at 3 AM before you've checked).
- [ ] Pricing: Free; availability: all territories.
- [ ] Google: all *App content* sections green; internal testing release already live; closed-testing track created with 12 tester emails.

## The last five minutes

- [ ] Re-open the app from a cold start on your iPhone one more time.
- [ ] Take a screenshot of the App Store Connect summary page for your records.
- [ ] Submit in the **morning, Pacific time, Monday–Thursday** — fastest turnaround.

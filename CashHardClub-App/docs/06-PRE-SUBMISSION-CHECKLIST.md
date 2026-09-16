# 06 — Pre-submission checklist (tick every line before you hit Submit)

## Build & configuration — verified in the project

- [x] **HTTPS only.** `NSAppTransportSecurity → NSAllowsArbitraryLoads = false` is set in app.json and confirmed in the generated Info.plist. Every URL the app calls is `https://` (see `src/data/content.ts`); `fetchJson` and the in-app browser refuse anything else. Android uses the platform default (cleartext blocked).
- [x] **No secrets in the bundle.** The only identifier shipped is the OneSignal *App ID* (public by design). The OneSignal REST key, APNs `.p8`, Firebase and Play service-account JSON files are never in the repo (`secrets/`, `*.p8`, `*.json` credentials are git-ignored). Run `git grep -i -E "api_key|apikey|secret|BEGIN PRIVATE" -- ':!node_modules'` before each release — it should find nothing.
- [x] **Secure storage.** v1 stores nothing sensitive. `src/lib/secure.ts` (Keychain / Keystore via expo-secure-store) is the only place tokens may go in v1.1.
- [x] **Push dashboard protected.** Sending requires a OneSignal login (owners with the Marketer role, 2FA). Content is edited only via the website repo.
- [x] **Privacy manifest.** `PrivacyInfo.xcprivacy` generated with UserDefaults CA92.1, FileTimestamp C617.1, SystemBootTime 35F9.1, DiskSpace E174.1, collected data types Device ID + Product Interaction, tracking = false. React Native and Expo libraries ship their own manifests; Apple's post-upload email (if any) will name a missing reason — add it to `ios.privacyManifests` and rebuild.
- [x] **Push done Apple's way (4.5.4).** Permission requested only from the Alerts switch after consent copy; in-app opt-out switch; nothing requires notifications.
- [x] **In-app browser** uses SFSafariViewController / Chrome Custom Tabs (`expo-web-browser`), not a WebView.
- [x] **Export compliance.** `ITSAppUsesNonExemptEncryption = NO` in Info.plist (only standard HTTPS) — App Store Connect will not ask on each upload.
- [x] **Orientation:** portrait locked on phones; iPhone-only on iOS (device family 1, runs in compatibility mode on iPad); Android tablets re-flow in landscape.
- [x] **Android:** targetSdk 36 (Expo SDK 57 default), 64-bit (`arm64-v8a` included), `.aab` output, Play App Signing (EAS keeps only the upload key), storage/overlay permissions blocked, `allowBackup=false`.
- [x] **Accessibility:** Dynamic Type honored with caps; touch targets ≥ 44 pt; labels on icon buttons.
- [ ] `npm run typecheck` and `npm run doctor` pass on your machine.
- [ ] `npm run sync:content` run right before the production build.
- [ ] `extra.oneSignalAppId` (or `EXPO_PUBLIC_ONESIGNAL_APP_ID`) set; a test push received on the **production** build via TestFlight and on the Play internal build.
- [ ] The build you submit is the one you tested (check the build number in Club → footer).

## Content & completeness (Apple 2.1, 4.2)

- [ ] `https://cashhardclub.com/privacy` and `/support` load on your phone (not just your PC). `events.json` returns valid JSON with real events (or a real past drop and no empty promises).
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

# 03 — Build, run and test (from Windows, no Mac)

## 1. Run the app right now (no build, no accounts)

```powershell
cd CashHardClub-App
npm install
npx expo start
```

- **Android emulator:** open Android Studio → *More Actions → Virtual Device Manager* → ▶ on your Pixel 9 → back in the terminal press **`a`**.
- **Your iPhone:** open **Expo Go**, scan the QR code in the terminal (phone and PC on the same Wi-Fi). If it can't connect, restart with `npx expo start --tunnel`.

Everything works here except push notifications (Expo Go has no OneSignal module — the Alerts tab tells you so).

## 2. One-time EAS setup (Day 1)

```powershell
eas login                 # your Expo account
eas init                  # creates the EAS project and writes extra.eas.projectId into app.json
eas update:configure      # adds updates.url + runtimeVersion (over-the-air JS updates, doc 09)
git add -A; git commit -m "Configure EAS"
```

## 3. Development build — real push, hot reload (Day 1–2)

**Android (emulator):**

```powershell
eas build --profile development --platform android
```

When it finishes, open the build page link → **Download** the `.apk` → drag it onto the running emulator window (or `adb install <file>.apk`). Then:

```powershell
npx expo start --dev-client      # press a
```

**iOS (optional — TestFlight is simpler for iOS):**

```powershell
eas device:create                # prints a link; open it on your iPhone, install the profile (registers the phone)
eas build --profile development --platform ios
```

Install from the link/QR EAS shows when the build finishes, then `npx expo start --dev-client` and scan the QR with the iPhone camera.

## 4. Store builds

```powershell
npm run sync:content                                # refresh bundled catalog/events snapshots
eas build --profile production --platform ios       # .ipa for TestFlight / App Store
eas build --profile production --platform android   # .aab for Google Play
```

First iOS run, answer the prompts:
- *Log in to your Apple account?* **Yes** → Apple ID, password, 2FA code (works on Windows).
- *Generate a new Apple Distribution Certificate?* **Yes**.
- *Generate a new Apple Provisioning Profile?* **Yes**.
- *Set up Push Notifications?* **No** — OneSignal delivers with its own APNs key (doc 04). If the build then fails mentioning the push capability, run again and answer **Yes** (harmless).
EAS registers the bundle ID `com.cashhardclub.app` on your Apple account and enables the Push Notifications capability from the entitlement in the build.

First Android run: *Generate a new Android Keystore?* **Yes**. EAS stores it. Back it up once: `eas credentials --platform android` → *Keystore: Download*, keep it outside the repo. (Google Play uses Play App Signing; this is only your *upload* key.)

Build numbers are managed remotely (`appVersionSource: remote`, `autoIncrement`) — you never edit them by hand. Bump `version` in app.json only for a new marketing version (1.0.1, 1.1.0).

## 5. Getting builds onto phones

**TestFlight (iOS):**

```powershell
eas submit --platform ios --latest
```

Answer with your Apple ID; let EAS create/link the App Store Connect app. Then in App Store Connect → your app → **TestFlight** tab: the build shows "Processing" for 5–30 min → **Internal Testing** → **+** → group "Owners", tick *Enable automatic distribution* → **Create** → **Invite Testers** → pick Dan and Kalen (they must first be added under *Users and Access* with the **Marketing** role, and accept the email invite) → they install the **TestFlight** app and the build appears. Internal testers need **no Beta App Review** — this is why we use internal, not external, testing.

**Android internal testing:** first upload is done in the Play Console (doc 08, section 4); later uploads: `eas submit --platform android --latest` once the service-account key exists.

## 6. Device test matrix

| # | Device | How | Why it's in the list |
|---|---|---|---|
| 1 | **Your iPhone** (physical) | TestFlight build | Real push, real safe areas (notch / Dynamic Island), Face ID-era gestures |
| 2 | **iPhone SE (3rd gen)**, 4.7", 375×667 | Appetize.io: `eas build --profile simulator --platform ios` → upload the `.app`/`.tar.gz` | Smallest current iPhone — tightest layout, home-button bottom (no bottom inset) |
| 3 | **iPhone 17 Pro Max**, 6.9" | Appetize.io | Largest phone; the required screenshot size |
| 4 | **iPad** (any, e.g. iPad Pro 13") | Appetize.io | The reviewer may open it here. iPhone-only apps run letterboxed in compatibility mode — must not crash |
| 5 | **Pixel 9** (API 36, Google Play image) | Android Studio emulator | Reference Android phone; push works (Play services) |
| 6 | **Pixel 9 Pro XL** (API 36) | Android Studio | Tall 20:9 screen, large text |
| 7 | **Small Phone** (Android Studio's "Small Phone" definition, API 35/36) | Android Studio | Narrow 720-px class — 2-column grid at its tightest |
| 8 | **Pixel Tablet** (API 36) | Android Studio | Android 16 ignores our portrait lock on large screens → test **landscape** and split-screen |
| 9 | **Pixel Fold** (API 36, optional) | Android Studio | Folding between phone and tablet widths while the app is open |

Create emulators: Android Studio → *Virtual Device Manager* → **Create device** → pick the hardware → **system image** (download the API 36 "Google Play" image once; reuse) → Finish. Start with ▶.

If you can't use Appetize, the SE and Pro Max cases are covered by the responsive layout plus the Small Phone / Pixel 9 Pro XL emulators — the risk is low, and TestFlight on your own iPhone is the mandatory one.

## 7. Test script — run on every device in the matrix

Tick each line. Anything that fails gets fixed before submission.

**Launch**
- [ ] Cold start: black splash with monogram → Shop. No white flash, no blank screen, status bar text is light.
- [ ] Airplane mode on → force-quit → relaunch: the vault still shows (bundled/cached catalog) with the "last saved catalog" note. Airplane off → pull to refresh works.

**Shop**
- [ ] Grid is 2 columns on phones, 3–4 on tablets/landscape; cards align, images load, prices and "was" prices right, badges (1 of 1 / Limited / Sale / Sold out) correct.
- [ ] Tap a piece → detail opens with back chevron; swipe through photos (dots move); the *motion* page plays a muted loop.
- [ ] **Buy on the official store** → in-app browser sheet (Safari-style on iOS, Chrome tab on Android) shows the Squarespace product page; add to cart → checkout reachable → close returns to the app on the same screen.
- [ ] Save / unsave (heart) on card and detail; count on the Shop heart; Saved screen lists them; survives an app restart.
- [ ] Share sends the product link.

**Events**
- [ ] Upcoming and Past sections; empty state reads well; event detail shows date/time in local time, venue, tickets button → in-app browser; **Directions** opens Maps; share works.

**Alerts**
- [ ] Switch ON → the **system permission prompt appears only now** → Allow → switch stays on, status "On".
- [ ] Send a test push from OneSignal (doc 04) with a product Launch URL → tap it → the product screen opens (not a browser).
- [ ] Switch OFF → status "Off"; a new push from OneSignal is **not** delivered.
- [ ] Deny the prompt (fresh install) → the "turned off in Settings" card with **Open settings** appears and works.

**Club**
- [ ] Instagram opens the app or the profile; Official store/Website/Support/Privacy open in the in-app browser; email rows open Mail; version line shows the build number.

**Layout & accessibility**
- [ ] Rotate tablets (Android) — nothing overlaps; grid re-flows; detail stays readable.
- [ ] iOS *Settings → Accessibility → Display & Text Size → Larger Text* at max, Android *Font size* at max: text scales, nothing clipped, buttons still tappable.
- [ ] iPad compatibility mode (letterboxed): no crash, tabs reachable.
- [ ] Android back button/gesture: detail → shop; from Shop it exits the app (no loops).
- [ ] Nothing shows placeholder text, "coming soon", "beta", or a broken link.

**Deep links**
- [ ] Android: `npx uri-scheme open "cashhardclub://product/hoodie" --android` opens the hoodie.
- [ ] iPhone: type `cashhardclub://product/hoodie` in Notes and tap it.
- [ ] `cashhardclub://nothing-here` shows the "Not in the vault" screen with a working back button.

**Crash-free**
- [ ] Use every screen for 5 minutes on your iPhone and Pixel 9 with no crash. (If a crash happens, the EAS build logs and `adb logcat` on Android show it; fix, rebuild, retest.)

## 8. Screenshots

Take them on your iPhone (TestFlight build) and the Pixel 9 Pro XL emulator (camera icon in the emulator toolbar). Suggested set, in order: Shop grid, product detail, checkout sheet, events, alerts, club. Save as `store/screenshots/raw/01-shop.png` … then:

```powershell
npm run screenshots
```

Outputs `store/screenshots/apple-6.9/` (1290×2796, the required App Store set), `apple-6.5/` (optional) and `play-phone/` (1080×1920). Screenshots must show the real app in use (Apple 2.3.3) — no mock-ups.

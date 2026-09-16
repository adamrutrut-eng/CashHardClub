# 01 — Setup checklist: accounts, software, files

Tick each line. Costs are as of September 2026; links are the official pages.

## A. Software on your Windows PC (all free)

| # | Install | Where | What it's for | Notes |
|---|---|---|---|---|
| A1 | **Node.js LTS** (24.x) | https://nodejs.org → "LTS" Windows Installer (.msi) → Next through defaults | Runs Expo tooling | Expo SDK 57 needs Node 20.19.4+, 22.13+, or 24.3+. Check: `node -v` |
| A2 | **Git for Windows** | https://git-scm.com/download/win → defaults ("Git from the command line", "Checkout as-is, commit Unix-style" is fine) | Version control, pushing to GitHub | Check: `git --version` |
| A3 | **VS Code** | https://code.visualstudio.com | Editor; Claude Code runs in its terminal | Optional extension: "Expo Tools" |
| A4 | **Android Studio** | https://developer.android.com/studio → Windows installer → keep "Android Virtual Device" ticked | The Android emulator (your only Android device) | 2–4 GB download. Then: **More Actions → SDK Manager** → tick *Android 16.0 (API 36)* SDK Platform, *Android SDK Build-Tools*, *Android Emulator*, *Android SDK Platform-Tools* → Apply. **More Actions → Virtual Device Manager → Create device → Pixel 9 → system image "Android 16 (API 36)" with the Play Store icon** (Play services are required for push). If the emulator won't start, turn on **Windows Hypervisor Platform** in *Turn Windows features on or off* and reboot. |
| A5 | **EAS CLI** | PowerShell: `npm install -g eas-cli` | Cloud builds + store submission from Windows | Check: `eas --version` |
| A6 | **Environment variable** | Windows *Edit the system environment variables* → New user variable `ANDROID_HOME` = `C:\Users\<you>\AppData\Local\Android\Sdk`; add `%ANDROID_HOME%\platform-tools` to `Path` | Lets Expo find `adb` and the emulator | Reopen PowerShell afterwards. Check: `adb --version` |
| A7 | **Inkscape** (optional) | https://inkscape.org | Free vectorizing of the monogram (Path → Trace Bitmap) | Alternative: https://vectorizer.ai (paid download) or Adobe Express (free vectorize) |

## B. Apps on your iPhone (free)

| # | App | For |
|---|---|---|
| B1 | **Apple Developer** (App Store) | Fastest way to enroll in the Apple Developer Program (ID scan + payment in-app) |
| B2 | **Expo Go** | Running the app on your iPhone during development, over Wi-Fi, no build needed (push won't work in it) |
| B3 | **TestFlight** | Installing real builds (and what Dan & Kalen will use) |

## C. Accounts

| # | Account | Cost | Link | Purpose | Gotchas |
|---|---|---|---|---|---|
| C1 | **Apple Developer Program** (Individual) | **$99/year** (auto-renews) | On your iPhone: Apple Developer app → Account → Enroll Now | Required to put anything on TestFlight or the App Store | Needs an Apple Account with **two-factor authentication on** and your **legal name** (no nickname). Government photo ID scan. Approval is usually 24–48 h, sometimes longer — **do this first, tonight**. After approval, open https://appstoreconnect.apple.com once and accept the license agreement if prompted (EAS fails silently until you do). |
| C2 | **Google Play Console** (Personal) | **$25 one-time** | https://play.google.com/console/signup | Publishing to Google Play | Identity verification (photo ID, address, phone) — usually hours to 2 business days. Your **legal name and country are shown publicly** on your listings for a personal account. New personal accounts must run a **closed test with 12 testers for 14 days** before public release (see doc 08). |
| C3 | **Expo (EAS)** | Free tier: 15 iOS + 15 Android builds/month, low-priority queue, 45-min build limit. **Starter $19/month** recommended for launch month: priority queue and more builds (cancel after) | https://expo.dev/signup | Cloud iOS/Android builds from Windows, TestFlight/Play submission, over-the-air JS updates | Free-tier queues can be 30–90 min at busy times; $19 buys you time during the 10 days. |
| C4 | **OneSignal** | Free plan (up to ~1,000 monthly active users; unlimited mobile push); Growth from $19/month beyond that — check https://onesignal.com/pricing | https://onesignal.com | Push notifications with a dashboard the owners can use themselves | Add Dan and Kalen as team members with a limited role. Turn on 2FA for every login. |
| C5 | **Firebase** (Google) | Free | https://console.firebase.google.com → Add project ("Cash Hard Club") | Android push delivery (FCM). OneSignal needs a Firebase service-account key. | No Firebase code in the app; it only supplies push credentials. |
| C6 | **GitHub** | Free (have it) | https://github.com/new → `CashHardClub-App`, Private | Code hosting for the app | See README for moving the folder in. |
| C7 | **Appetize.io** (optional) | Free tier with limited minutes | https://appetize.io | Runs an iOS *simulator* build in your browser — your only way to see iPhone SE / Pro Max / iPad from Windows | Upload an EAS simulator build (`eas build -p ios --profile simulator` is optional; see doc 03). |

Already in place: Squarespace store, cashhardclub.com on Netlify, brand email addresses.

## D. Files you need

| # | File | Status / where |
|---|---|---|
| D1 | **CHC monogram** as a transparent PNG, 1024×1024 or larger (vectorize the JPG/PNG first, export at 2048 px) | **You provide.** Save as `assets/source/monogram.png` then run `npm run assets` — every icon, splash, notification icon, Play icon and feature graphic regenerates. A stand-in gold ₵ monogram is in place so nothing is broken meanwhile. |
| D2 | App icon 1024×1024 no transparency (Apple) | Generated: `assets/icon.png` |
| D3 | Android adaptive icon (foreground + monochrome) | Generated: `assets/adaptive-icon*.png` |
| D4 | Splash | Generated: `assets/splash-icon.png` (black background from app.json) |
| D5 | Google Play icon 512×512 and feature graphic 1024×500 | Generated: `store/play-icon-512.png`, `store/feature-graphic.png` |
| D6 | Screenshots: iPhone 6.9" (1290×2796) and Play phone (1080×1920) | Take them on your iPhone and the emulator, drop into `store/screenshots/raw/`, run `npm run screenshots` (doc 03) |
| D7 | Privacy policy page | Done: `https://cashhardclub.com/privacy` once the website branch is merged |
| D8 | Support page | Done: `https://cashhardclub.com/support` once merged |
| D9 | `events.json` with real upcoming events | Skeleton added to the website repo — **fill in real events** (doc 00 explains the fields) |
| D10 | APNs key (.p8) from the Apple Developer portal | Doc 04 — created after enrollment; upload to OneSignal, keep the file somewhere safe (never in the repo) |
| D11 | Firebase service-account JSON | Doc 04 — upload to OneSignal only |
| D12 | Google Play service-account JSON (optional, for `eas submit`) | Doc 08 — store in `secrets/` (git-ignored) |
| D13 | Store copy (name, subtitle, description, keywords) | Drafted in doc 05 — approve or edit |
| D14 | Demo account for reviewers | **Not needed** — the app has no login |

## E. Money summary

| Item | Amount |
|---|---|
| Apple Developer Program | $99 / year |
| Google Play Console | $25 once |
| Expo Starter (optional, launch month) | $19 / month |
| OneSignal, Firebase, GitHub, Expo free tier | $0 |
| **Total to launch** | **$124 (or $143 with Expo Starter)** |

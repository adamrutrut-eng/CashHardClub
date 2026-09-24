# 02 — Day-by-day plan (start: Wednesday September 16, 2026)

Deadline: **live on the App Store by Saturday September 26** (10 calendar days). Google Play public release is *not* on this deadline and cannot be — see the bottom of this page for why.

## The plan

| Day | Date | Do | Expected outcome |
|---|---|---|---|
| **0** | Wed Sep 16 (tonight) | **Enroll in the Apple Developer Program on your iPhone** (Apple Developer app → Account → Enroll Now, ID scan, pay $99). Sign up for Google Play Console ($25) and start identity verification. Create Expo, OneSignal and Firebase accounts. Install Node, Git, VS Code, Android Studio (+ Pixel 9 API 36 emulator). Create the `CashHardClub-App` GitHub repo and move the folder (README). `npm install`, `npx expo start`, run in Expo Go on your iPhone and in the emulator. Answer the open questions; send the monogram file. | App running on your phone and emulator the same evening. Apple and Google verifications ticking. |
| **1** | Thu Sep 17 | Vectorize the monogram → `assets/source/monogram.png` → `npm run assets`. Fill `events.json` with real events; approve the store copy (doc 05). Merge the website branch so `/privacy`, `/support`, `/events.json` are live. `eas login` → `eas init` → `eas update:configure`. OneSignal: create app, Firebase key (Android side). `eas build --profile development --platform android` → install the APK in the emulator → send yourself a test push from OneSignal. | Android push working end to end. Content real. |
| **2** | Fri Sep 18 | **Apple approval expected.** Register the bundle ID + create the APNs key (doc 04) → OneSignal iOS. `eas build --profile production --platform ios` (first run signs you into Apple and creates certificates; 20–40 min build). Create the App Store Connect app record and **check the name "Cash Hard Club" is available**. `eas submit --platform ios --latest` → TestFlight → add Dan and Kalen as internal testers. `eas build --profile production --platform android` → Play Console: create app → Internal testing → upload the AAB → invite the owners by email → share the opt-in link. | **TestFlight on the owners' iPhones (Fri Sep 18 evening)**. **Android internal-testing link (Fri Sep 18, if Google verified you; otherwise the day verification lands).** |
| **3** | Sat Sep 19 | Run the device test matrix (doc 03) on your iPhone + 4 emulators (+ Appetize for SE/Pro Max if you can). Fix what you find. Take screenshots → `npm run screenshots`. | Bug-free on every size; screenshot sets ready. |
| **4** | Sun Sep 20 | Fill App Store Connect: screenshots, description, keywords, support/privacy URLs, category, age rating, App Privacy, review notes (doc 05/07). Fill Play Console: listing, content rating, data safety, target audience (doc 08). Walk the pre-submission checklist (doc 06). | Everything entered; nothing placeholder. |
| **5** | Mon Sep 21 | `npm run sync:content`, final `eas build --profile production` for both platforms, `eas submit` both. **Submit for App Review in the morning (US time).** Play: create the **closed testing** release and invite the 12 testers — the 14-day clock starts when they opt in. | **App Store submission: Mon Sep 21.** **Play Store closed-testing submission: Mon Sep 21.** |
| **6** | Tue Sep 22 | App Review typically answers within 24–48 h. If rejected: doc 09, fix the same day, rebuild (30–60 min), resubmit. | Approved, or resubmitted. |
| **7** | Wed Sep 23 | Second-round buffer. | |
| **8–9** | Thu–Fri Sep 24–25 | Approval → in App Store Connect click **Release this version** → live within a few hours (Apple says up to 24 h to appear everywhere). | **App Store live: realistically Sep 23–25.** |
| **10** | Sat Sep 26 | Deadline. Buffer for a second rejection. | |
| — | Oct 5 (earliest) | 14 days after 12 testers opted in → **Apply for production** in Play Console. Google answers in "usually 7 days or less". | |
| — | Oct 6–17 | Production access granted → create the production release (the same AAB) → Play review (hours to ~7 days for a new app). | **Play Store public: realistically Oct 8–17.** Owners have had the app since Sep 18 via the testing link. |

## Honest list of what you do not control

1. **Apple Developer enrollment approval** — usually 24–48 h; can take a week if ID verification is flagged. Nothing on iOS (not even TestFlight) can start before it. Mitigation: enroll tonight; work on Android meanwhile.
2. **App Review time and outcome** — Apple states 90% of submissions are reviewed within 24 h; a first-ever app from a new account sometimes gets a closer look. The plan holds one full rejection round; a second still fits before Sep 26.
3. **Google Play identity verification** — hours to 2 business days, sometimes longer.
4. **Google's 14-day closed test with 12 opted-in testers** — a hard rule for personal accounts created after Nov 13, 2023. Testers must stay opted in for the whole 14 days. Then Google reviews your production-access application (up to 7 days). This is why Play public release is 3+ weeks out no matter what.
5. **EAS build queue** — free tier is low priority (30–90 min waits at peak). $19 Expo Starter for the launch month removes most of that risk.
6. **The app name** — if "Cash Hard Club" is already taken on the App Store you'll see it when creating the record; fallbacks: "CASH HARD CLUB" (Apple treats case-only differences as the same name, so this likely won't work), "Cash Hard Club Official", "CHC — Cash Hard Club".
7. **Your testers** — 12 people with Android phones who install and keep the app for 14 days.

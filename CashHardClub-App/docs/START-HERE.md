# START HERE — the short version

**Goal:** people open the app, browse the pieces, tap Buy, and pay on the Squarespace store. That already works in the code. Everything below is only about getting it onto the App Store.

## The only things you need for the App Store (in order)

| # | Thing | What it is, in one line | Cost | Time |
|---|---|---|---|---|
| 1 | **Apple Developer Program** | Apple's permission slip to publish. Enroll from the **Apple Developer** app on your iPhone (Account → Enroll Now, scan your ID, pay). | $99/yr | 15 min, then wait 1–2 days for approval |
| 2 | **Node.js** | The engine the app's tools run on. Download the LTS installer from nodejs.org, click Next until done. | free | 5 min |
| 3 | **Git** | Saves versions and talks to GitHub. You likely have it already (run `git --version`). If not: git-scm.com, click Next. | free | 5 min |
| 4 | **Expo account + EAS CLI** | Expo is the company whose cloud builds the iPhone app for you (you have no Mac). Sign up at expo.dev, then run `npm install -g eas-cli` once. | free | 5 min |
| 5 | **Expo Go** on your iPhone | Free App Store app that shows the app on your phone while you work, no build needed. | free | 2 min |
| 6 | **OneSignal account** | The website where the owners type a message and hit Send to push "new drop" alerts. | free | 10 min, Day 2 |
| 7 | **TestFlight** on your iPhone | Apple's app for installing test versions before the store. | free | 2 min |

That's it for Apple. Total: **$99** and about an hour of clicking, plus Apple's approval wait.

## Things you can skip for now

- **Android Studio** — only needed to run an Android emulator. Apple is the deadline; do Android after the App Store submission, or just test on the owners' Android phones via the Play testing link.
- **Google Play Console ($25)** — sign up whenever you have 20 minutes; nothing on the Apple timeline depends on it.
- **Firebase** — only for Android push. Skip until Android.
- **VS Code, Inkscape, Appetize** — optional tools. You already use Claude Code; the logo is done as vector art.

## Decisions made so you're not blocked (change any of them later)

- Logo: recreated as vector art from the two-C mark (`assets/source/monogram.svg`); every icon is generated from it.
- Gold: the website's `#c8a04a`.
- Age rating: 4+ (no alcohol references in app copy).
- Events tab: shows the Nov 2025 Halloween hoodie drop as a past item and an honest "nothing announced yet" state. Add a real event later by editing `events.json` on the website.
- Club tab brand line: "A streetwear and club brand in black, white and gold. Limited pieces, real nights." Edit in `app/(tabs)/club.tsx` if the owners object.
- Expo plan: free tier (upgrade to $19 only if builds queue for more than an hour).
- Android: internal testing link for the owners after the App Store submission; public Play release in October.

## Your exact order of operations

1. Tonight: enroll with Apple (row 1). Install rows 2–5.
2. Create the GitHub repo `CashHardClub-App` and move this folder (README, "Moving this folder").
3. In the folder: `npm install`, then `npx expo start`, scan the QR with Expo Go. You'll see the app.
4. When Apple approves: follow `03-BUILD-AND-TEST.md` section 4 (one command builds the iPhone app in Expo's cloud) and section 5 (TestFlight).
5. Then `04-PUSH-ONESIGNAL.md` (alerts), `05` + `07` (the store listing, click by click).

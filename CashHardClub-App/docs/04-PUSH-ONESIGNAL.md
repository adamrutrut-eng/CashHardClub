# 04 — Drop alerts: OneSignal setup and the owners' sending guide

Why OneSignal: the owners get a real dashboard (log in → write → send) with no code and no server of ours; iOS + Android in one place; free at this scale; the app never contains a secret (the OneSignal *App ID* in the app is a public identifier — the *REST API key* that can actually send stays in the dashboard).

## 1. Create the OneSignal app (Day 1, 10 minutes)

1. https://onesignal.com → **Sign up** (your email, strong password) → **Settings → Security → enable two-factor authentication**.
2. **New App/Website** → name **Cash Hard Club** → platform **Google Android (FCM)** first (iOS needs the Apple account) → Next.

## 2. Android push credentials (Firebase, Day 1)

1. https://console.firebase.google.com → **Add project** → name "Cash Hard Club" → disable Google Analytics (not needed) → Create.
2. Project **⚙ Settings → Service accounts → Generate new private key** → a JSON file downloads. (Also note the **Project ID** on the *General* tab.)
3. Back in OneSignal → **Settings → Push & In-App → Google Android (FCM) → Upload the JSON file** → Save.
4. (No Firebase code goes into the app. Keep the JSON out of the repo.)

## 3. iOS push credentials (APNs key, Day 2 — after Apple approves you)

1. https://developer.apple.com/account → **Certificates, Identifiers & Profiles → Keys → +**.
2. Key name `CHC OneSignal APNs` → tick **Apple Push Notifications service (APNs)** → Continue → Register → **Download** the `.p8` (**one chance only** — store it in a password manager) → note the **Key ID** on that page. Your **Team ID** is under *Membership details*.
3. OneSignal → **Settings → Push & In-App → Apple iOS (APNs) → Token (.p8)** → upload the file, enter Key ID, Team ID, **Bundle ID `com.cashhardclub.app`** → Save. One key serves both sandbox and production.

(If the bundle ID doesn't exist yet: *Identifiers → + → App IDs → App → Explicit `com.cashhardclub.app` → tick Push Notifications → Register*. EAS does this automatically on the first iOS build anyway.)

## 4. Put the App ID in the app

OneSignal → **Settings → Keys & IDs → OneSignal App ID** (a UUID). Either:

- `app.json` → `"extra": { "oneSignalAppId": "<paste>" }`, **or**
- create `.env` from `.env.example` with `EXPO_PUBLIC_ONESIGNAL_APP_ID=<paste>` (Expo inlines `EXPO_PUBLIC_*` at build time; add the same variable in expo.dev → project → *Environment variables* for cloud builds).

Rebuild (development or production). Pushes never work in Expo Go.

## 5. Test it (Day 1 Android, Day 2 iOS)

1. Install a development/TestFlight build, open **Alerts**, switch on, allow.
2. OneSignal → **Audience → Subscriptions**: your device appears as *Subscribed*.
3. **Messages → Push → New Message** → title `Test drop` → body `It works.` → **Launch URL** = `https://cashhardclub.com/store-MFHja/p/1-1-exclusive-halloween-hoodie` → **Send to test device** or send to all → the phone shows it → tapping opens the hoodie **inside the app** (the app suppresses OneSignal's own browser and routes store links to native screens; anything else opens in the in-app browser).

## 6. Segments the app creates (for targeting)

The app tags every subscription: `alerts=on|off`, `drops=on|off`, `events=on|off`. In OneSignal → **Audience → Segments → New Segment** create:
- **Alerts on** — tag `alerts` is `on` (use this as the default audience)
- **Wants drops** — `drops` is `on`
- **Wants events** — `events` is `on`

## 7. Give Dan and Kalen access — without giving them the keys

OneSignal → **Organization settings → Members → Invite** → their emails → role **Marketer** (can create and send messages, cannot see API keys or delete the app). Ask them to enable 2FA on first login. Never share your own login.

## 8. Owners' guide: sending a drop alert (give this to Dan and Kalen)

1. Go to **onesignal.com** → **Log in**.
2. Left menu **Messages** → **Push** → blue **New Message** button.
3. **Audience:** choose the segment **Alerts on** (or *Wants drops* / *Wants events*).
4. **Message:**
   - *Title* — short and loud, e.g. `NEW DROP: Bella Ciao Tee`
   - *Message* — one line, e.g. `Live now on the official store. Limited run.`
   - *Launch URL* — paste the product or ticket link from the store (e.g. `https://cashhardclub.com/store-MFHja/p/…`). The app opens that piece directly; people without the app get the web page.
   - (Optional) *Image* — shows on Android; iOS shows the text (rich images on iOS come with a later update).
5. **Delivery:** *Immediately*, or *Schedule* a date/time (use this for a drop that goes live at 8 PM).
6. **Review → Send Message**. Done — the *Delivery* tab shows sent/received/clicked counts.

Rules of the road (this is what Apple checks under guideline 4.5.4): only people who switched alerts **on** receive anything; every message is about a drop, restock or event; nobody is ever required to accept alerts to use the app.

## 9. Security notes

- The **REST API key** (Settings → Keys & IDs) is the one secret. It lives only in OneSignal; the app never contains it, so nobody can extract it from the app bundle.
- Sending requires a OneSignal login with the right role. Content the app shows (catalog/events) is edited only through the GitHub repo/Netlify, which nobody else has write access to.
- Notification data OneSignal stores is described in `https://cashhardclub.com/privacy` and declared in both stores' privacy forms (doc 05).

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
2. OneSignal → **Audience → Subscriptions**: your device appears as *Subscribed*. (Before you flip the switch there is no record at all: the app sends nothing to OneSignal until the in-app opt-in.)
3. **Messages → Push → New Message** → title `Test drop` → body `It works.` → **Launch URL** = `https://cashhardclub.com/store-MFHja/p/general-admission-sglwa-w7saf-nk3e4-xd6ay` → **Send to test device** → the phone shows it → tapping opens the Bella Ciao tee **inside the app** (the app suppresses OneSignal's own browser and routes store links to native screens). Only cashhardclub.com store links work in the app; links to other sites are ignored.

## 6. Segments the app creates (for targeting)

The app tags a subscription only after its user taps the switch in the Alerts tab: `alerts=on|off`, `drops=on|off`, `events=on|off`. Only devices that tapped Turn on/off carry the `alerts` tag. In OneSignal → **Audience → Segments → New Segment** create:
- **Alerts on** — tag `alerts` is `on` (use this as the default audience)
- **Wants drops** — `drops` is `on` AND `alerts` is `on`
- **Wants events** — `events` is `on` AND `alerts` is `on`

Never send to **Subscribed Users**, **Total Subscriptions** or **All**: on Android 12 and older, phones get notification permission at install, so those built-in segments can include people who never opted in. Optionally delete or rename the default *Subscribed Users* segment so nobody picks it by mistake.

## 7. Give Dan and Kalen access — without giving them the keys

OneSignal → **Settings (gear, bottom-left) → Organization settings → Organization members → Invite to Organization** → their emails → role **Editor** (OneSignal's own description: "Best for Marketers, PMs" — full messaging workflow: build segments, create and send messages; cannot change app settings or see API keys).

**Plan note:** the Editor role requires OneSignal's **Professional plan or higher**. On the **Free plan** the only roles are **Admin** (full access — *including the REST API key under Settings → Keys & IDs*) and **Team Member** (can see the org and app list, but has no permission to send anything). So on Free you must choose one of: (a) upgrade the plan before handing sending over to Dan and Kalen, (b) keep sending with the owner account only and have Dan/Kalen request drops through you, or (c) accept that giving them Admin also gives them the REST API key. Do **not** default to Admin without making that trade-off deliberately. Ask them to enable 2FA on first login. Never share your own login.

## 8. Owners' guide: sending a drop alert (give this to Dan and Kalen)

1. Go to **onesignal.com** → **Log in**.
2. Left menu **Messages** → **Push** → blue **New Message** button.
3. **Audience:** choose the segment **Alerts on** (or *Wants drops* / *Wants events*). Never *Subscribed Users*, *Total Subscriptions* or *All*.
4. **Message:**
   - *Title* — short and loud, e.g. `NEW DROP: Bella Ciao Tee`
   - *Message* — one line, e.g. `Live now on the official store.`
   - *Launch URL* — paste the product or ticket link from the store (e.g. `https://cashhardclub.com/store-MFHja/p/…`). The app opens that piece directly; people without the app get the web page. Only cashhardclub.com store links work in the app; links to other sites are ignored.
   - (Optional) *Image* — shows on Android; iOS shows the text (rich images on iOS come with a later update).
5. **Delivery:** *Immediately*, or *Schedule* a date/time (use this for a drop that goes live at 8 PM).
6. Run the **Before you hit Send** checklist below.
7. **Review → Send Message**. Done — the *Delivery* tab shows sent/received/clicked counts.

### Before you hit Send

1. Every deadline ("ends tonight") is real.
2. "1 of 1", "Limited" and "Only N left" match actual stock.
3. A "was" price is one the item was genuinely offered at, openly and in good faith, for a real stretch of time recently.
4. No performer or venue named without written confirmation.
5. The link is an official store link (others are ignored by the app).
6. No drink specials, open bar or alcohol brands; at most "21+ with valid ID".
7. Adam is told before any new ticketing site is used.

Rules of the road (this is what Apple checks under guideline 4.5.4): only people who switched alerts **on** receive anything; every message is about a drop, restock or event; nobody is ever required to accept alerts to use the app.

## 9. Security notes

- The **REST API key** (Settings → Keys & IDs) is the one secret. It lives only in OneSignal; the app never contains it, so nobody can extract it from the app bundle.
- Sending requires a OneSignal login with the right role. Content the app shows (catalog/events) is edited only through the GitHub repo/Netlify, which nobody else has write access to.
- Notification data OneSignal stores is described in `https://cashhardclub.com/privacy` and declared in both stores' privacy forms (doc 05).

# 08 — Google Play Console, click by click

Prerequisites: Play Console account paid and **identity verified** (doc 01 C2); `.aab` from `eas build --profile production --platform android` downloaded from the EAS build page; website pages live; doc 05 answers.

## 1. The rule that sets the timeline

Personal accounts created after November 13, 2023 must run a **closed test with at least 12 testers opted in continuously for 14 days** before they can apply for production access. Google reviews the application ("usually seven days or less"), and only then can you publish to everyone. Testers who drop out before 14 days don't count. **Internal testing has no such rule** — that's how the owners get the app on Day 2.

Where to find 12 testers: Dan, Kalen, you (if you borrow an Android), friends/family/customers with Android phones. Each needs a Google account email; they must tap the opt-in link, install, and keep the app installed for 14 days (opening it a few times helps). Fallback communities exist (search "Google Play 12 testers community") but real fans are better.

## 2. Create the app (Day 2)

1. https://play.google.com/console → **Create app** → App name `Cash Hard Club`, Default language English (United States), **App**, **Free**, tick the two declarations → **Create app**.
2. Dashboard → **Set up your app** — go through every item (answers in doc 05 §D/E): *Set privacy policy*, *App access*, *Ads*, *Content rating* (start questionnaire → email → category → answers → Save → Submit), *Target audience*, *News apps*, *COVID-19*, *Data safety*, *Government apps*, *Financial features*, *Health*, *Store settings*. Each turns green.
3. **Grow → Store presence → Main store listing**: short description, full description (doc 05), **App icon** `store/play-icon-512.png`, **Feature graphic** `store/feature-graphic.png`, **Phone screenshots** from `store/screenshots/play-phone/` (2–8). Tablet screenshots optional (the layout is adaptive; add them later if you like) → **Save**.

## 3. First upload = Internal testing (Day 2) — the owners' link

1. **Test and release → Testing → Internal testing → Create new release**.
2. *App integrity*: **Use Google-generated app signing key** (Play App Signing) → Continue.
3. **Upload** the `.aab` → Release name auto-fills → Release notes: paste doc 05 §G → **Next** → **Save** → **Go to publishing overview** → **Send changes for review** (internal tracks publish within minutes; no review wait).
4. **Testers** tab → **Create email list** → name `Owners` → add Dan's and Kalen's Gmail addresses (+ yours) → Save → tick the list → Save. Copy the **opt-in URL** and send it to them: they open it on the phone → *Become a tester* → *Download it on Google Play*.

Later uploads without the console: create a service account (Play Console → **Users and permissions → Invite new users** is for people; for EAS follow https://expo.fyi/creating-google-service-account, download the JSON to `secrets/google-play-service-account.json`, grant it *Release manager* on the app) then `eas submit --platform android --latest`.

## 4. Closed testing (Day 5) — start the 14-day clock

1. **Testing → Closed testing → Create track** (name `Alpha`) → **Create new release** → **Add from library** (the same `.aab`) → release notes → Next → Save.
2. **Testers** tab → create list `Closed testers` with the **12+ emails** → Save → copy the opt-in URL → send it with clear instructions ("open on your Android phone, tap Become a tester, install, keep it for two weeks").
3. **Review release → Start rollout to Closed testing**. Google may review this release briefly (hours–days).
4. Dashboard shows a tester counter; it needs **12 opted-in for 14 continuous days**.

## 5. Apply for production (about October 5)

Dashboard → **Apply for production** → answer the three sections (about the closed test, the app, readiness — write full sentences; say the testers were real customers/friends, what feedback you got, what you fixed). Google emails a decision, usually within 7 days.

## 6. Production release (after approval)

**Test and release → Production → Create new release** → add the tested `.aab` (or a newer production build) → release notes → **Next → Save → Go to publishing overview → Send changes for review**. Review for a new app takes hours to a few days (occasionally up to 7). Then the listing is public: `https://play.google.com/store/apps/details?id=com.cashhardclub.app`.

## 7. Keep in mind

- Target API 36 is required for new apps from Aug 31, 2026 — the build already targets it.
- Your legal name and country show on the listing (personal account).
- Data safety must match reality (doc 05 §E); Google spot-checks with automated scans.
- Every new `.aab` for Play must have a higher version code — EAS auto-increments.

# 09 — When a reviewer rejects something (the 2 AM plan)

Read this before you submit so nothing surprises you.

## 0. Don't panic: the loop is short

Rejection → read the message in **App Store Connect → App Review** (Resolution Center) → decide: **fix** or **explain** → reply or resubmit → new decision usually within 24–48 h. Most first-app rejections are metadata or a misunderstanding, not code.

Rebuilding costs ~30–60 min: fix → `npm run typecheck` → `eas build -p ios --profile production` → `eas submit -p ios --latest` → wait for *Processing* → in the version page **remove the old build, add the new one** → **Submit to App Review**. If nothing in the binary changed (metadata only), just edit and resubmit — no new build.

Reply in the Resolution Center, not by email. Be brief, factual, friendly, and specific (screen names, guideline numbers). Reviewers are people on a clock.

## 1. Likely rejection reasons for this app, and the exact response

| Reviewer says | What it usually means | Do this |
|---|---|---|
| **Guideline 3.1.1 – In-App Purchase** ("your app unlocks/sells content without IAP") | They saw "Buy" and assumed digital goods | Reply (no rebuild): "All items sold are physical merchandise (apparel, hats) and tickets to real-world events, purchased on our web store per **Guideline 3.1.3(e)** *Goods and Services Outside of the App*. The app sells no digital content or features." Point to the product pages. Almost always cleared on reply. |
| **Guideline 4.2 – Minimum Functionality** ("app is a repackaged website / limited") | Reviewer felt it's a wrapper | Reply listing native features: native catalog with offline cache, saved pieces, live sold-out status, opt-in drop alerts with deep links to products, events with directions, native share; checkout intentionally uses the platform browser (SFSafariViewController) per 3.1.3(e). If they insist, add one more native feature (e.g. size guide, countdown to next drop) and rebuild. |
| **Guideline 2.1 – Performance: App Completeness** (crash, bug, "unable to review") | Something broke on their device (often iPad) | Ask which device/iOS in your reply if unclear; reproduce on the Appetize iPad + your iPhone; fix; rebuild; resubmit with a note describing the fix. If they couldn't load content: check that cashhardclub.com/products.json and events.json are live and valid. |
| **Guideline 2.1 – Information Needed** (questions about the app) | They want clarification | Answer every question in one reply; attach screenshots if useful. |
| **Guideline 4.5.4 – Push Notifications** | Marketing pushes without opt-in | Reply with screenshots of the Alerts tab: consent text, the switch, opt-out; note that no push is sent unless the user opts in. |
| **Guideline 5.1.1 – Privacy: Data Collection and Storage** | Privacy policy link broken, or labels don't match | Verify https://cashhardclub.com/privacy on a phone; fix App Privacy labels to Device ID + Product Interaction; resubmit. |
| **Guideline 5.1.2 – Data Use and Sharing** / **App Privacy label mismatch** | Labels vs. SDK behavior | Same as above; OneSignal collects only the two declared types. |
| **Guideline 2.3.3 / 2.3.10 – Accurate Metadata** | Screenshots not from the app, or "Android" mentioned | Replace screenshots with real captures (`npm run screenshots`); remove platform mentions; resubmit (metadata only). |
| **Guideline 1.5 – Developer Information** | Support URL not working | Make sure `/support` is merged and live; resubmit. |
| **Guideline 2.5.4 / background modes** | `remote-notification` background mode questioned | Reply: used only for OneSignal push delivery. |
| **ITMS-91053 Missing API declaration** (email after upload, not a rejection) | A library uses a required-reason API not declared | Add the named category + reason to `ios.privacyManifests` in app.json, rebuild, re-upload. |
| **Guideline 4.0 – Design** (e.g. iPad layout) | Something looked broken on iPad | The app is iPhone-only; on iPad it runs in compatibility mode — say so and confirm it doesn't crash; fix any real issue. |
| **Guideline 4.8 / 5.1.1(v)** | Only if a login exists | Not applicable in v1 — reply that the app has no accounts. (v1.1 plan handles both.) |

## 2. If the decision is wrong

Reply once with the facts and the guideline text. If the same rejection repeats, use **Appeal** (link in the rejection message) — the App Review Board answers in a few days. Keep the tone respectful; the person you're writing to didn't write the rules.

## 3. Deadline lever: expedited review

For a genuine time-critical reason (a contract launch date qualifies as an event with a fixed date), request an expedited review **after** you've resubmitted: https://developer.apple.com/contact/app-store/?topic=expedite — one paragraph, state the date and why. Use it at most once.

## 4. After launch: fixing fast without a review

JavaScript-only fixes (copy, layout, a bug in a screen) can be published over the air:

```powershell
eas update --channel production --message "Fix events date formatting"
```

Installed apps pick it up on the next launch. Not allowed: changing what the app fundamentally does (Apple 2.3.1). Anything native (a new library, permissions, icons) needs a new store build.

## 5. Google Play rejections

They arrive by email and under **Policy → Policy status**. Common ones: *Data safety mismatch* (fix the form), *Privacy policy* (link must be reachable and mention the app), *Metadata* (screenshots/description), *Target API* (already 36). Fix → new release on the same track → *Send changes for review*. For an appeal use the link in the email.

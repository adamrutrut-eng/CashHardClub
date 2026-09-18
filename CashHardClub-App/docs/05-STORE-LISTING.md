# 05 — Store listing: copy, answers, review notes

Everything below is ready to paste. Edit the voice if you like, but keep it honest: reviewers compare the listing with the app.

## A. Names and copy (both stores)

| Field | Value | Limit |
|---|---|---|
| App name | `Cash Hard Club` | Apple 30 / Google 30 |
| Subtitle (Apple) | `Streetwear drops & events` | 30 |
| Short description (Google) | `Official Cash Hard Club app: the vault, drop alerts, events and tickets.` | 80 |
| Promotional text (Apple, editable without a new build) | `New pieces land in the vault first here. Turn on Drop Alerts and never miss a drop, restock or event.` | 170 |
| Keywords (Apple) | `streetwear,clothing,hoodie,tee,snapback,drops,merch,club,events,tickets,fashion,nightlife` | 100 |
| Category | Apple: **Shopping** (primary), **Lifestyle** (secondary). Google: **Shopping** | |
| Copyright | `2026 Cash Hard Club` | |
| Support URL | `https://cashhardclub.com/support` | must be live |
| Marketing URL | `https://cashhardclub.com` | optional |
| Privacy Policy URL | `https://cashhardclub.com/privacy` | must be live |
| Price | Free, all territories (App Store) / all countries (Play) | |
| Contact (Apple review) | your name, phone, email | |

**Description (Apple ≤ 4000, Google ≤ 4000):**

```
CASH HARD CLUB — the official app.

Browse the vault, get drop alerts, and grab tickets to the next night — all in one place, in black, white and gold.

THE VAULT
Every piece from the collection with photos, prices and sizes. Save the pieces you want and come back when they drop. Checkout is quick and secure on the official Cash Hard Club store.

DROP ALERTS
Turn on alerts and hear first when a new piece lands, a sold-out piece returns, or tickets go on sale. Alerts are opt-in and you can switch them off any time in the app.

EVENTS & TICKETS
See what's coming, get the details and directions, and buy tickets to Cash Hard Club events through the official store.

THE CLUB
Follow @cashhardclub, reach the founders, and find support in one tap.

Everything sold is physical merchandise or tickets to real-world events. Est. MMXXIV.
```

Do **not** mention Android in the Apple listing or iPhone in the Google listing (Apple 2.3.10).

## B. Apple age rating (App Information → Age Rating → Edit)

Answer **None / No** to every content question (violence, sexual content, profanity, horror, gambling, contests, alcohol/tobacco/drugs, medical, etc.), **No** to *Unrestricted Web Access* (the app opens specific store pages in an in-app browser, not a general browser), **No** to loot boxes, messaging, user-generated content, advertising, parental controls, age assurance. Expected rating: **4+**. If an event's copy in the app references alcohol or bar events, answer *Alcohol, Tobacco, or Drug Use or References: Infrequent/Mild* instead (rating becomes 12+/13+ under the current scale) — simplest is to keep event copy free of alcohol references.

## C. Apple App Privacy (App Privacy → Get Started)

*Do you or your third-party partners collect data from this app?* **Yes.**

| Data type | Collected? | Used for | Linked to the user's identity? | Used for tracking? |
|---|---|---|---|---|
| Identifiers → **Device ID** (push token / OneSignal subscription id) | Yes | App Functionality | No | No |
| Usage Data → **Product Interaction** (app opens, notification received/clicked, via OneSignal) | Yes | Analytics, App Functionality | No | No |

Everything else (name, email, purchases, location, contacts, photos, crash data, advertising data): **not collected**. Purchases happen on the Squarespace website in the in-app browser, outside the app's data collection. Result on the store: "Data Not Linked to You: Identifiers, Usage Data". This matches the app's `PrivacyInfo.xcprivacy` (device ID + product interaction, tracking = false).

## D. Google Play — App content answers

| Section | Answer |
|---|---|
| Privacy policy | `https://cashhardclub.com/privacy` |
| App access | *All functionality is available without special access* |
| Ads | *No, my app does not contain ads* |
| Content rating (IARC) | Category *Utility, Productivity, Communication, or Other*; answer **No** to everything → **Everyone** |
| Target audience and content | Age groups: **18 and over** only (simplest; avoids "designed for families" rules). *Not* appealing to children. |
| News apps | No |
| COVID-19 contact tracing / status | No |
| Data safety | see E |
| Government apps | No |
| Financial features | *My app doesn't provide any financial features* |
| Health | *My app does not have any health features* |
| Store settings | App; category **Shopping**; contact email `danielwhite@cashhardclub.com`; website `https://cashhardclub.com` |

## E. Google Play Data safety form

- *Does your app collect or share any of the required user data types?* **Yes**
- *Is all of the user data collected by your app encrypted in transit?* **Yes**
- *Do you provide a way for users to request that their data is deleted?* **Yes** (users email us — privacy policy section 6; turning alerts off unsubscribes)

| Data type | Collected | Shared | Ephemeral | Required or optional | Purpose |
|---|---|---|---|---|---|
| Device or other IDs → **Device or other IDs** | Yes | No (OneSignal is a service provider processing on our behalf) | No | **Required** (the anonymous device record is created at first launch so alerts can be delivered; notifications are sent only if the user turns alerts on) | App functionality |
| App activity → **App interactions** | Yes | No | No | Optional | Analytics, App functionality |

Everything else: not collected. No account, so no "account creation" data-deletion URL is required.

## F. Apple App Review notes (paste into *App Review Information → Notes*)

```
Cash Hard Club is the official app of the streetwear/club brand CASH HARD CLUB (cashhardclub.com, Instagram @cashhardclub).

WHAT TO TEST
1) Shop tab: native catalog. Tap any piece for photos, sizes, colors. "Buy on the official store" opens our Squarespace store in SFSafariViewController to complete checkout.
2) Events tab: the club calendar. Events and drops that have not happened yet appear under "Upcoming"; finished ones under "Past". Tap any entry for date, venue, details and a link to that piece or ticket page, which opens on our store in SFSafariViewController. When tickets are on sale the event screen shows a ticket button.
3) Alerts tab: opt-in push notifications for new drops and events. The system permission prompt is shown only when the user turns the switch on; the same switch turns alerts off. The app is fully usable with alerts off.
4) Club tab: Instagram, store, support, privacy policy, contact.

PURCHASES
Everything sold is physical merchandise (apparel, hats) or tickets to real-world events. Per App Review Guideline 3.1.3(e) (Goods and Services Outside of the App), payment is collected outside In-App Purchase on our web store. The app sells no digital content and offers no unlockable features.

ACCOUNTS
No login or account exists in this version, so no demo account is needed. Nothing is gated.

PRIVACY
Privacy policy: https://cashhardclub.com/privacy. The app collects only a push token / device identifier and notification-delivery analytics through OneSignal. The anonymous device record is created when the app first launches so that delivery works; no notification is sent unless the user turns the Alerts switch on, and the same switch turns them off. No tracking, no ads, no third-party login.

CONTACT
[Your name], [phone], [email]. Happy to answer quickly.
```

*Sign-in required:* **No**. Attachment: none needed.

## G. Google Play — release notes for the first release

```
The official Cash Hard Club app: browse the vault, save pieces, check out on the official store, see events and tickets, and turn on drop alerts.
```

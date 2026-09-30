# The Cash Hard Club app — guide for Dan and Kalen

**What the app does.** People browse the vault natively (real photos, prices, sizes), tap **Buy** and check out on our Squarespace store inside the app, see events and drops, and buy tickets when they are on sale, and — if they switch it on — get a push notification the moment something drops. iOS first (App Store, target late September), Google Play a few weeks later (Google makes new publishers run a 14-day test first).

**Installing early.** iPhone: you'll get an email from TestFlight — install the TestFlight app, accept, install. Android: you'll get a link — open it, tap *Become a tester*, then install from Google Play.

## Sending a drop alert (5 minutes)

1. **onesignal.com → Log in** (you'll get an invite; turn on two-factor when asked).
2. **Messages → Push → New Message.**
3. **Audience:** *Alerts on* (or *Wants drops* / *Wants events*). Never *Subscribed Users*, *Total Subscriptions* or *All* — on older Android phones those include people who never opted in.
4. **Title:** e.g. `NEW DROP: Doberman Collar Tee`. **Message:** e.g. `Live now. M–XXL, black and off white.`
5. **Launch URL:** paste the piece's link from the store. When someone taps the alert, the app opens that piece.
6. Run the checklist below, then **Send** (or *Schedule* for a set time). Watch received/clicked counts on the Delivery tab.

Send only when there is a drop, a restock or an event — that's what people opted in for, and it's what keeps us inside Apple's rules.

## Before you hit Send — every push, email, flyer, and every products.json / events.json edit

1. Every deadline ("ends tonight") is real.
2. "1 of 1", "Limited" and "Only N left" match actual stock.
3. A "was" price is one the item was genuinely offered at, openly and in good faith, for a real stretch of time recently.
4. No performer or venue named without written confirmation.
5. The link is an official store link (others are ignored by the app).
6. No drink specials, open bar or alcohol brands; at most "21+ with valid ID".
7. Adam is told before any new ticketing site is used.

What the data fields do in the app and on the site:
- `was` (products.json) turns on a strikethrough price and the **Sale** badge wherever it is shown. The app currently hides both whatever the file says; keep `was` at `null` unless rule 3 is met and you have the records to prove it.
- The `bay` text controls the **1 of 1** badge ("1 of 1" in the bay) and the **Limited** badge ("Limited" in the bay, or `limited: true`). Use them only when true: "1 of 1" = one unit ever made; "Limited" = a stated or capped run that is never restocked.
- Event `status` can be `on-sale`, `free`, `announced`, `sold-out`, `postponed`, `cancelled` or `past`. If an event is postponed or cancelled, change it **the same day** (the ticket button disappears), disable the ticket product on the store, and refund.
- Event `price` = the exact per-ticket amount the buyer pays at checkout before tax, including every mandatory fee; leave it out if unsure. `age` = exactly what the venue requires (e.g. `21+`). `access` = only facts the venue confirmed in writing. Every fact printed on a flyer (date, time, venue, age limit, price) also goes in the text fields.

## Adding an event or a drop to the calendar

Send Adam (or whoever maintains the website) these details and it appears in the app within minutes — no app update needed:

- Name · Date and start time (and end, if any) · Venue and address · City
- Ticket link on the store (Event Tickets category) and price, or "free", or "announced — tickets soon"
- One photo (landscape works best) · Age limit if any · 1–3 sentences of copy

Behind the scenes it goes into `cashhardclub.com/events.json`.

## Changing pieces, prices, photos

The app reads the same `products.json` that powers the website, plus live stock from Squarespace — when a piece sells out on Squarespace, the app shows **Sold out** automatically. New pieces: add to Squarespace as usual, then have the website's `products.json` updated.

## Support

Questions from customers about orders go to the store's order emails and to danielwhite@ / kalencole@cashhardclub.com. The app's Support page is cashhardclub.com/support.

## Deletion requests (runbook)

People ask through the app (Alerts tab → **Delete my alert data**, which emails the device's IDs) or by email.

1. OneSignal → **Audience → Users & subscriptions** → search by the **Subscription ID** or **OneSignal ID** from the email → open the user → **Delete User** (this removes its subscriptions and tags). Developers can do the same with `DELETE /apps/{app_id}/users/by/onesignal_id/{id}`.
2. Reply within **30 days** confirming it is done.
3. Log only: date received, the ID, date deleted. Nothing else.
4. Store customers: delete their Squarespace customer account and contact on request, and explain that order records stay for tax, returns and chargebacks.

**Under 13:** if you are told a user is under 13, delete that device's alert record and any store data about them promptly.

## House rules (free, and they keep us out of trouble)

- No Meta, TikTok, Google Ads or Pinterest pixels, chat widgets or session replay on the store without first telling Adam, updating the privacy policy and store labels, and using opt-in blocking. Simplest rule: none.
- Never sell, trade or swap customer, subscriber or ticket-buyer lists, including "sponsor gets our list" deals.
- No SMS marketing without consent language reviewed by a lawyer. No raffles or "enter to win" drops without a lawyer (a purchase-required raffle can be an illegal lottery in Alabama).
- Never run your own ID scanner or collect ID photos; the venue checks IDs. Never take card numbers by phone or DM.
- Add alt text (a short written description) to every new product image on Squarespace.
- Put every flyer fact (date, time, venue, age limit, price) in text too, not only in the image.
- Publish venue accessibility information only when the venue has confirmed it in writing.
- Check every new AI render against the real garment before it goes live, and watch every new video at full brightness for strobe or rapid flicker. Keep "no model, no person" in Higgsfield prompts.

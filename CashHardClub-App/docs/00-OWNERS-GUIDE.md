# The Cash Hard Club app — guide for Dan and Kalen

**What the app does.** People browse the vault natively (real photos, prices, sizes), tap **Buy** and check out on our Squarespace store inside the app, see upcoming events and buy tickets, and — if they switch it on — get a push notification the moment something drops. iOS first (App Store, target late September), Google Play a few weeks later (Google makes new publishers run a 14-day test first).

**Installing early.** iPhone: you'll get an email from TestFlight — install the TestFlight app, accept, install. Android: you'll get a link — open it, tap *Become a tester*, then install from Google Play.

## Sending a drop alert (5 minutes)

1. **onesignal.com → Log in** (you'll get an invite; turn on two-factor when asked).
2. **Messages → Push → New Message.**
3. **Audience:** *Alerts on*.
4. **Title:** e.g. `NEW DROP: Doberman Collar Tee`. **Message:** e.g. `Live now. M–XXL, black and off white.`
5. **Launch URL:** paste the piece's link from the store. When someone taps the alert, the app opens that piece.
6. **Send** (or *Schedule* for a set time). Watch received/clicked counts on the Delivery tab.

Send only when there is a drop, a restock or an event — that's what people opted in for, and it's what keeps us inside Apple's rules.

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

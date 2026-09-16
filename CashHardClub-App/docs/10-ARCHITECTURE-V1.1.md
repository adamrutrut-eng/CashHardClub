# 10 — v1.1 Members & loyalty: architecture that bolts onto v1

Goal: accounts, member perks and early access within 30 days of launch, without touching what v1 already does. v1 was built so that nothing here requires rewriting a screen.

## What stays exactly the same
- Catalog and events keep coming from the website JSON + Squarespace live stock (`ContentProvider`).
- Checkout stays on Squarespace in the in-app browser (3.1.3(e) still applies to merch and tickets).
- OneSignal keeps sending alerts; v1.1 adds `OneSignal.login(userId)` so members can be targeted (early-access segment).

## Backend: Supabase (recommended)
Free tier; Postgres + Auth + Row Level Security + Edge Functions; first-class **Sign in with Apple** and email magic links; JS client works in Expo. Alternatives considered: Firebase Auth/Firestore (fine, but rules are easier to get wrong; and we'd rather not add Firebase code just for auth), a custom server (no — nobody to run it).

**Tables** (all with RLS on):
- `profiles` (id = auth.users.id, display_name, instagram, city, created_at, deleted_at)
- `membership` (user_id, tier `member|inner_chamber`, points int, joined_at)
- `perks` (id, title, body, starts_at, ends_at, tier_required, product_url) — owners edit in Supabase Studio (simple table UI), or later a tiny admin page
- `early_access` (product_slug, opens_at_for_members, opens_at_public)
- `orders_claimed` (user_id, squarespace_order_number, claimed_at, points_awarded) — points from purchases, claimed by order number and verified by hand or via Squarespace Commerce API later

**RLS**: users read/write only their own `profiles`/`membership` rows; `perks` and `early_access` are readable by authenticated users only; only a `service_role` key (never in the app) can write them.

**Edge Functions**: `delete-account` (deletes auth user + rows; called by the in-app *Delete account* button — Apple 5.1.1(v)), `claim-order` (validates an order number).

## Auth in the app (Apple rules built in)
- Offer **Sign in with Apple** (`expo-apple-authentication`) and **email magic link** (Supabase). If Google sign-in is ever added, Sign in with Apple stays mandatory (4.8) — it's already there.
- Membership is optional: every v1 feature keeps working without an account (5.1.1(v): "let people use it without a login").
- **Account deletion** inside the app: Club → Account → *Delete account* → confirm → calls `delete-account` → signs out. Also a support-email path stays in the privacy policy.
- **Session storage**: Supabase sessions exceed SecureStore's 2 KB limit, so use the standard pattern: generate an AES key stored in `expo-secure-store` (`src/lib/secure.ts`), encrypt the session blob, store the ciphertext in AsyncStorage (`aes-js` + `expo-crypto`). Never store tokens in plain AsyncStorage.
- Keychain accessibility `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` (already set in `secure.ts`).

## Screens to add (Expo Router)
- `app/(tabs)/club.tsx` gains a *Members* card (sign in / your membership).
- `app/account/index.tsx` (profile, tier, points, perks list), `app/account/sign-in.tsx`, `app/account/delete.tsx`.
- Product detail: an *Early access* banner when `early_access` says members can buy before the public date (the Buy button opens the store as usual — Squarespace handles the sale; we only show the link early).

## Store metadata changes for v1.1 (so it isn't a surprise)
- Apple App Privacy: add **Email Address** and **Name** (linked to user, App Functionality); Purchase History if `orders_claimed` ships. Data safety: add *Personal info → Email address, Name*, *Purchases* (optional), plus the **account-deletion web link** Google requires for apps with account creation (add `https://cashhardclub.com/delete-account` page describing the in-app + email paths).
- Privacy policy: new "Membership" section (data, retention, deletion).
- Review notes: provide a demo member account.

## Deep links / universal links (nice for v1.1)
- iOS: `ios.associatedDomains: ["applinks:cashhardclub.com"]` + `/.well-known/apple-app-site-association` on the website (needs your Team ID).
- Android: `android.intentFilters` with `autoVerify` + `/.well-known/assetlinks.json` (needs the Play App Signing SHA-256 from Play Console → App integrity).
- Then a shared store link opens the native product screen.

## Effort estimate
Supabase project + tables + RLS: half a day. Auth screens + secure session: 1 day. Perks/early access UI: 1 day. Delete account + policy/metadata updates: half a day. Testing + submission: 1 day. ≈ 4 working days, fits well inside 30 days.

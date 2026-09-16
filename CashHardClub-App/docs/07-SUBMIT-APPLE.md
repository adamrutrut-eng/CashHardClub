# 07 — Apple: App Store Connect, click by click

Prerequisites: Apple Developer Program approved (doc 01 C1); a production build uploaded with `eas submit --platform ios --latest` (doc 03 §5) or ready to upload; website pages live; doc 05 answers at hand.

## 1. Create the app record and check the name (Day 2)

1. https://appstoreconnect.apple.com → sign in → **Apps** → blue **+** (top left) → **New App**.
2. Platforms: **iOS**. Name: **Cash Hard Club** — if it says *"The App Name you entered is already being used"*, the name is taken; try `Cash Hard Club Official` and tell the owners. Primary Language: **English (U.S.)**. Bundle ID: pick **com.cashhardclub.app** (appears after EAS's first iOS build registered it; if the list is empty, register it at developer.apple.com → Identifiers first). SKU: `cashhardclub-app`. User Access: Full Access → **Create**.
3. Left sidebar **App Information**: Subtitle `Streetwear drops & events`; Category Primary **Shopping**, Secondary **Lifestyle**; Content Rights: *does not contain, show, or access third-party content* → Save. **Age Rating → Edit** → answer per doc 05 §B → Done → Save.
4. **Pricing and Availability**: Price **Free (USD 0)** → Save; availability all countries (default).
5. **App Privacy**: Privacy Policy URL `https://cashhardclub.com/privacy` → **Get Started** → *Yes, we collect data* → tick **Device ID** (under Identifiers) and **Product Interaction** (under Usage Data) → Next → for each: usage = as in doc 05 §C, *No* not linked, *No* not used for tracking → **Publish**.

## 2. TestFlight for the owners (Day 2)

1. **Users and Access → +** → first/last name, email (their Apple Account email), role **Marketing** → Invite. They accept from email.
2. **TestFlight** tab → under *Internal Testing* click **+** → name `Owners`, tick *Enable automatic distribution* → Create → **Invite Testers** → tick Dan and Kalen → Add.
3. When the uploaded build finishes *Processing*, it appears under the group. Testers get an email → install **TestFlight** → tap *Install*. (Missing Compliance? It won't ask, because the encryption flag is in the build.)

## 3. Prepare the 1.0 version for review (Day 4)

Left sidebar → **iOS App 1.0 Prepare for Submission**:

1. **Previews and Screenshots**: iPhone 6.9" Display → drag the files from `store/screenshots/apple-6.9/` (3–10 images). Other sizes are optional.
2. **Promotional Text**, **Description**, **Keywords**, **Support URL**, **Marketing URL** — paste from doc 05 §A.
3. **Version** `1.0.0`; **Copyright** `2026 Cash Hard Club`.
4. **Build** → **Add Build** (or the **+** next to Build) → choose the latest processed build → Done.
5. **App Review Information**: *Sign-in required* unticked; Contact information (name, phone, email); **Notes** → paste doc 05 §F.
6. **Version Release**: **Manually release this version**.
7. Top right **Save**, then **Add for Review** → the summary page → **Submit to App Review**.

Status goes *Waiting for Review* → *In Review* → *Pending Developer Release* (approved, waiting for you) or *Rejected* (doc 09). You get emails at each step.

## 4. Release (Day 6–9)

App Store Connect → the version → **Release This Version**. It becomes *Ready for Distribution*; searchable on the App Store within roughly an hour to a day. Post the App Store link (`https://apps.apple.com/app/id<AppleID>` — the Apple ID number is on App Information).

## 5. Later updates

Bump `version` in app.json (e.g. 1.0.1) → `eas build -p ios --profile production` → `eas submit -p ios --latest` → App Store Connect → **+ Version or Platform** → 1.0.1 → *What's New* → add build → submit. JS-only fixes can also go out over the air (`eas update --channel production --message "..."`) without review, as long as they don't change the app's purpose (doc 09).

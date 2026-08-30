# CASHHARDCLUB — Hero film assets (generate in Higgsfield)

The landing page's hero is a scroll-scrubbed film. It currently plays the
vault-door film. To upgrade it to the garment-deconstruction hero, generate
these three assets in Higgsfield **in order** (each later asset uses the
earlier ones as references), then paste the final video URLs into the
`MEDIA` block at the top of the `<script>` in `index.html`.

All assets must sit on a **pure black background** with no floor plane and
no ambient reflections, so they blend seamlessly with the page (#000000).
The accent that should read in every asset is CASHHARDCLUB brass-gold
(#c8a04a) as rim light and print detail.

---

## Asset 1 — Base product image

Use the flagship hoodie cutout as the reference image
(`products.json → products[0].cut`).

> A studio-grade product photograph of the referenced heavyweight streetwear
> hoodie floating fully assembled in a pure black void, shown at a
> three-quarter angle revealing the chest print and the interior line of the
> hood. Pure black background with zero ambient light bleed, no floor plane,
> no reflections, no surface shadows. The garment holds a worn silhouette as
> if on an invisible form — sleeves relaxed, hood raised slightly. Lit like a
> high-end print campaign: one soft key light raking across the fabric grain,
> a brass-gold rim light tracing the silhouette edges. Clinical precision, no
> stylization, no mannequin, no model.

## Asset 2 — Exploded reference image (use Asset 1 as reference)

> Using the provided reference hoodie image: deconstruct the garment into a
> precise exploded-view diagram. Each component — hood, front panel, back
> panel, sleeves, cuffs, hem band, kangaroo pocket, drawstrings with metal
> tips, and the chest print floating as its own layer — separates from its
> assembled position along its natural seam lines, with uniform spacing
> between parts. The arrangement is deliberate and symmetrical, like a
> technical illustration or a luxury brand's campaign visual. Pure black
> background. Every panel keeps its true fabric texture, stitching, and
> print detail. No labels, no lines, no graphic overlays.

## Asset 3 — Hero video (use Assets 1 and 2 as references)

Generate **two aspect ratios**: 16:9 (desktop) and 9:16 (mobile).

> A heavyweight streetwear hoodie floats fully assembled in a pure black
> void — no environment, no ground plane, no reflections. The camera begins
> at a front-right three-quarter angle and slowly orbits clockwise in one
> smooth, uninterrupted arc. As the camera reaches the direct front-facing
> position — about halfway through the shot — the garment begins a seamless
> deconstruction: the hood lifts away, the drawstrings slide free, the
> sleeves peel outward from the shoulder seams, the front panel separates
> from the back, the kangaroo pocket floats forward, and the chest print
> detaches and hangs as its own golden layer. Every piece drifts apart along
> its seam lines with slow, weighted momentum — deliberate, never chaotic.
> The shot ends with all panels suspended in a balanced exploded arrangement
> against the black void, edges kissed by a brass-gold rim light.

Also export a **poster still** from the first frame of each orientation.

---

## Wiring the new film into the page

In `index.html`, find the `MEDIA` block at the top of the `<script>` and
replace the four URLs:

```js
const media = {
  landscape:{ mp4:"<16:9 video URL>", poster:"<16:9 poster URL>" },
  portrait:{  mp4:"<9:16 video URL>", poster:"<9:16 poster URL>" }
};
```

Nothing else needs to change — the scrub engine measures the film's
duration at runtime, pre-decodes it into frames in the background, and
holds the final exploded arrangement on screen before the page releases
to the sections below (`FILM_END` controls where the hold begins).

---

## Generated — 2026-08-23

All three assets were generated with Seedance 2.5 / Nano Banana Pro and are
wired into `index.html`:

- Asset 1 (base, 16:9): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_035350_6f840a6c-e8d9-42ca-8da1-1720b7ac2a22.png
- Asset 1b (base, 9:16): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_035445_8fe74218-7ece-4409-b1b4-e3b718ef8b26.png
- Asset 2 (exploded, 16:9): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_035444_f3cd1c20-9eae-4ef5-9010-f2ba93ba61c8.png
- Asset 3 (hero film, 16:9, 10s 720p): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_035648_d0660840-c309-4416-a954-b1b7d239d0d4.mp4
- Asset 3 (hero film, 9:16, 10s 720p): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_035634_7dc43f6a-b32b-4490-b424-e6315accdd34.mp4

The films start on the assembled hoodie (start_image) and resolve into the
exploded arrangement; the base stills double as the reduced-motion /
fallback posters. To re-generate, rerun the prompts above and swap the
URLs in the MEDIA block again.

- Ambient background film (9:16, 6s 720p, gold dust — interim until the club
  scene is generated): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_053844_9eb3b1e5-476e-434e-8e2e-2389151a01d6.mp4

Planned swap: a club-scene ambient (crowd, apparel, money rain, flashing
lights — ~39 credits at 6s/720p per orientation) replaces the dust film in
the `#ambient` element's data-src once credits are topped up.

- B&W rave photograph (16:9 2K, behind Club Bulletins): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_055430_f526e86f-a249-4f3f-a133-89b45b175105.png

Bay presentation note: the per-product loop videos (products.json `loop`)
show an empty bay — hanger and spotlights, no garment. The page now floats
each product's cutout (`cut`) over its playing loop, so the footage is the
backdrop and the real piece hangs in front. Regenerating the 8 loops with
the garment in-shot (~39 credits each at 6s/720p, cutout as reference) is
the eventual upgrade.

- B&W rave film (16:9 6s 720p, animated from the rave still; behind Club
  Bulletins): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_055849_b8392e10-7241-4c18-8c66-5f1f74ba20fb.mp4
- Money-rain film (16:9 6s 720p, B&W matching the rave footage: young man,
  hood up, making it rain over the crowd; behind the closing CTA): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_061208_c94c8aad-1b44-4f83-92a3-3e5e0ef4ec61.mp4
  (an earlier color take at hf_20260823_060407_e262da52 was rejected — wrong subject)

## Hero replaced — 2026-08-23

The hoodie-deconstruction hero is retired (URLs above remain for reference).
The hero is now a B&W club push-through: the camera weaves through the
dancing crowd until it parts, revealing a figure in the hoodie under a
hard spotlight. Both fallback posters and og:image now use the rave still.

- Hero film 9:16 (8s 720p, phones): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_062128_ba580671-5dad-45fa-97bb-51a42bd33625.mp4
- Hero film 16:9 (6s 720p, desktop): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_062128_e0bf1f7f-b353-4f48-b49d-f81f1f0c1215.mp4

## Hero reveal updated — the owner in the white Doberman tee

Same push-through film; only the revealed figure changed: the brand owner
(likeness from two supplied reference photos) wearing the white Doberman
Collar Tee, face visible under the spotlight.

- Hero film 9:16 (8s 720p, phones): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_185223_f37d5345-98fc-4995-95ef-25b98820fb0b.mp4
- Hero film 16:9 (6s 720p, desktop): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260823_185224_38c952b9-1a8d-4ccc-92be-d8632e1eff23.mp4

## Hero reveal updated — Kalen and Dan, side by side

Same push-through film; the crowd now parts on both of them shoulder to
shoulder, mean-mugging the camera — Kalen (bearded, white Doberman tee)
and Dan (likeness from two supplied reference photos, plain white tee).

- Hero film 9:16 (8s 720p, phones): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260824_090125_c0536e7f-c219-46e9-9490-1560ef3c7afc.mp4
- Hero film 16:9 (6s 720p, desktop): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260824_090126_d34b7999-afc0-415e-afb3-e55dee029d4f.mp4

## Dan's notes pass — 2026-08-29

- Wordmark now reads CASH HARD CLUB (spaced); Est. MMXXIV everywhere;
  ledger row renamed Instagram; contacts are danielwhite@ and
  kalencole@cashhardclub.com (event inquiries -> danielwhite@).
- Money Club tee bay cutout regenerated SHORT-SLEEVE from the real
  product photo + background removal: https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_044121_cff2fc2c-bab0-4135-b01c-4962b0f99a5d.png
- Hero rebuilt for matched end frames on desktop and mobile: one
  canonical B&W reveal still of Kalen (white Doberman tee) and Dan
  (white oversized tee, gold-rim glasses, CASH chain, per his new
  reference photo) was generated in 9:16 and recomposed to 16:9; both
  film cuts drive to their matching still via end_image, and the stills
  are now also the fallback posters and og:image.
  - Still 9:16: https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_044008_6b4f57b7-8dae-4957-a6e2-5527a6c52ad8.png
  - Still 16:9: https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_044117_744709c6-38e0-4ac7-9f14-a268a5627dfd.png
  - Hero film 9:16 (8s): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_044217_8ead61f5-241d-4d2f-abbf-e29fe72deeed.mp4
  - Hero film 16:9 (6s): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_044217_746e6cf7-2700-4408-969b-354b98b3a620.mp4
- Closing CTA background swapped from money-rain to the club entrance
  line (two-way door traffic, per Dan's idea):
  https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_044217_c8c72b0a-2865-4c56-b559-52936789b0f5.mp4

## Hero restored via video edit — 2026-08-29

The Aug-24 hero films (the take whose Kalen the owners preferred) were
edited in place with Seedance video_edit: only the man on the right (Dan)
was updated — gold-rim glasses, silver CASH-pendant chain, plain white
oversized tee per his new reference photo. Kalen, the crowd, camera, and
grade are untouched. The Aug-29 end-frame versions are retired. The
floating hoodie was removed from the closing CTA; fallback posters and
og:image reverted to the rave still.

- Hero film 9:16 (8s): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_062849_41692d95-29a5-49b1-8f98-cb6cc791f2cb.mp4
- Hero film 16:9 (6s): https://d8j0ntlcm91z4.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/hf_20260829_062850_74b68d17-5846-4f25-add7-0dc5b55a2b14.mp4

## Hero desaturated to full B&W — 2026-08-29

Dan came out of the video edit in color against the B&W film. Fixed for
zero credits: both hero cuts were run through ffmpeg (hue=s=0, crf 18,
faststart, audio stripped) in the Higgsfield sandbox — pixel-identical
wherever the frame was already B&W, so Kalen/crowd/grade are untouched.
Uploaded via media_upload to the d2ol7oe51mr4n9 CDN (new preconnect host
in index.html). The 062849/062850 color-Dan cuts are retired.

- Hero film 9:16 (8s, 720x1280): https://d2ol7oe51mr4n9.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/abb272fb-e062-448d-8846-3de09d5491c6.mp4
- Hero film 16:9 (6s, 1280x720): https://d2ol7oe51mr4n9.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/c39009b6-ad7c-49e5-8dcd-d8779e7b1186.mp4

## Collar fix — 2026-08-30

Dan flagged that the tee's collar read "Doberman club" instead of CASH
HARD CLUB. Per the owners: the DO'ERMAN neckline lettering and all
chains/pendants stay untouched — only the collar carries the fix. Both
hero cuts were video-edited to add a printed dog-collar band on the
Doberman tee graphic reading "CASH HARD CLUB" (landscape: band above the
dog's head; portrait: studded banner below it), then desaturated with
ffmpeg (hue=s=0) as B&W insurance and re-hosted. Retired intermediates:
c074c423 (portrait — erased the neckline/pendant, rejected), 6fed4126
(portrait — no visible change), 37617af1 (landscape necklace edit,
ordered before the owners said to leave the necklace alone — unused).

- Hero film 9:16 (8s, 720x1280): https://d2ol7oe51mr4n9.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/50bb3388-698b-4ecf-a195-de3765d90322.mp4
- Hero film 16:9 (6s, 1280x720): https://d2ol7oe51mr4n9.cloudfront.net/user_3Bk0VmEE1F1oHhl3J1J9LrV5LNO/91732f7e-5e81-4b97-b733-e5507abb0edb.mp4

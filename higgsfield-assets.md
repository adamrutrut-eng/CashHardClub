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

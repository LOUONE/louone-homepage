# Rehearsal: hq-phone-demo

Built with Stageshow 1.1.1 (`benjitaylor/skills`), kit vendored unmodified in
`components/stageshow-kit/` apart from its per-component CSS imports, which
moved to `all.css` (Next.js pages router only takes global CSS from `_app`).

- **Gold copied:** `phone-touch` (a card that opens into its screen and folds
  back), with the kit's `Notification banner`, `Collapse` and `Expand face`.
- **Changed:** HQ's look (night-blue glass over the painted hills, gold action,
  violet for done, Outfit and Inter Tight); story is notification → row lands in
  "À décider" → tap opens the project → Fusionner → Fusionnée held 2 s → close
  folds back, the resolved row leaves, the next notification starts the loop.
- **Gate:** filmed alone with `scripts/film.mjs --gate` at 1280 and 390. Fixed:
  settle snap (a snap cut the collapse, then a card gap, then the host page's
  reveal transform), lopsided pill, half-pixel glyphs, banner entering past the
  stage edge, row landing on a transform, face/row handoff shift (the row now
  highlights instead of scaling, so `Expand` measures its true rect), tight lines
  (the list behind the opaque screen now fades out), small text at 390.
- **Left on the gate, not faults:** six `kit override` lines. The detector finds
  kit stylesheets by a `/kit/` path, as Vite serves them; Next bundles all CSS
  into one file, so the kit's own phone rules read as the host's. No host rule
  targets `.ss-phone__*`.
- **Not checked:** Safari and Firefox by film (Chromium only); the film run is
  "inconclusive" on sampling gaps under load, as on any page of this size.

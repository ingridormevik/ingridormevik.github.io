# Trail Mix — overworld expansion: audit and plan

*Status: planning document only. No code changed to produce this — the brief's
own Phase 1 asks for an audit and a plan before any rewriting, and that's
what this is. Written 2026-08-22.*

## What this responds to

Ingrid sent a 30-section brief proposing to evolve Trail Mix into a large,
Heroes-of-Might-and-Magic-inspired explorable Bergen overworld: a big
illustrated map with fog-of-knowledge reveal, seamless zoom transitions into
the existing side-scrolling scenes, dynamic weather/time, a multi-layer sound
mixer, NPCs joining and leaving the group, chunked world loading, and an
automatic quality manager — while explicitly preserving everything that
already works (canvas renderer, sprites, archive, sound, Accessibility Hub,
mobile support) and never rewriting Trail Mix from scratch. Her own words:
*"extend Trail Mix, do not replace Trail Mix"* and *"don't break anything and
don't change anything unless it makes it better."*

This document is the ten-point deliverable the brief itself asks for as its
first task, grounded in what's actually in the repository today rather than
assumed.

## 1. What must stay untouched

- The chapter-driven state machine: `S.phase` (`load → title → card → walk →
  story → end`), `CH[]` (now 7 chapters), `STOP_IDS`, `resolve()`.
- The procedural canvas renderer — parallax mountains/trees are generated at
  boot from RNG seeds (`buildLayers()`, `mountainLayer()`, `treeLayer()`),
  not painted assets. This is the entire visual language of the walk today.
- `BEINGS` — the generic folklore-casting engine now running Munken, Mare,
  Nisse, Huldra and Troll off one shared piece of code.
- `ARCH` and the rule-18 gate (`entryListHtml()`, `archRender()`) — no
  historical or folklore claim renders without a verified source, enforced
  in code and tested by `tools/verify-trail.py`.
- `AU` (procedural WebAudio kick/hat/bass/lead) and the separate theme
  `<audio>` element with beat detection.
- The Accessibility Hub (`SET`, `setApply()`) — High Contrast, Reduce
  Motion, Large Text, Read Aloud, Mute All, all localStorage-persisted.
- `localStorage` (`trailmix.archive.v1`, `trailmix.settings.v1`), the
  service worker offline trail, touch/keyboard input, mobile layout.
- The physical trail pipeline (`tools/build-trail.py`,
  `tools/verify-trail.py`, `trail/*.html`) that mirrors the game's own data.

None of this needs to be replaced to build toward the brief. It needs to be
extended.

## 2. Existing code we can actually build on

The brief describes several systems as if from scratch that already exist
here in a smaller form:

- **"Enter a location from an overview"** — already built. `#rmMap` (a
  schematic progress map of all 7 stops) and `#rmScene` (opens one stop as
  its own backdrop-and-history "room") were shipped this session. They're a
  real seed for the brief's overworld → scene transition — not a cinematic
  camera zoom yet, but the same idea: a summary view, a location that opens
  into detail, a way back.
- **Fog of knowledge** — `ARCH`'s existing rule-18 gate already renders
  three states per fact (not yet found / RESEARCH REQUIRED / shown with
  source), and `BEINGS`' stillness-based alpha rise already makes noticing
  something a function of attention, not proximity. The brief's "fog of
  knowledge" is a generalization of a pattern that's already load-bearing
  here, not a new concept.
- **Reduce Motion → alternate treatment, not removal** — already the
  pattern (`reduceMotion` gates dozens of render call sites; the Huldra
  sway/pre-glow work this session specifically checks it and swaps to a
  static state). Extending this convention to new effects is consistent
  with how the file already works.
- **Per-stop content already keyed by id** (`MAP_ART`, `STOP_IDS`,
  `data/route.json`'s `stops[]`) — a real, if small, precedent for the
  brief's "chunk" idea (§22). Each stop already carries its own art
  reference, folklore being, and history entries.

## 3. Existing assets we can reuse

- `assets/locations/*.png` — 7 location banners (Sandviksbatteriet has none;
  its only concept panel was quarantined for an invented cannon).
- `assets/folklore/*.png` — 8 being portraits, now genuinely alpha-cut
  (fixed this session).
- `assets/sprites-pack/` — the blocky, flat-color pixel-art Jack/Ingrid
  walk-cycle actually used in the canvas today. This is the correct style
  reference for anything meant to render *inside* the walk.
- `assets/hero/trail-mix-hero.jpg` — painterly, used only for the title
  screen, a different (also legitimate, but distinct) register from the
  in-canvas sprites.
- `assets/pack-v2/` (15 source concept sheets) and `assets/quarantine/` —
  the existing cut-and-quarantine pipeline (`tools/build-pack-v2.py`),
  which already embodies exactly the "never invent a building, never
  invent a claim" discipline the brief asks for in §3 and §12.
- `data/assets.json` is worth reading before commissioning anything new —
  it is **already** a full wishlist of NPCs, weather effects, moving
  background elements and collectible types, with `asset: null` almost
  everywhere. Large parts of this brief's ambition are already written
  down there, unbuilt for lack of art, not lack of a plan.

## 4. How an overworld fits the current state machine

`S.phase` would need a new value (e.g. `'world'`) sitting alongside
`walk`/`story`, with its own render path and its own input handling (pan/tap
instead of hold-to-walk). This is additive — the existing phases don't need
to change shape — but it is not a small addition: it's a second rendering
mode next to the existing one, with its own camera, its own hit-testing, and
its own asset needs. Realistically this is the single largest piece of new
engineering in the brief, independent of any art question.

## 5. How to transition into the existing scenes

`#rmScene`'s current open/close (an overlay fading in over a static
backdrop) is the right *conceptual* seed but not yet the *visual* one the
brief describes (camera push, trees enlarging, fog separating into depth
layers). Getting from here to there is a real animation-engineering task:
interpolating a virtual camera between "world view" and "walk view" over the
same canvas, not just toggling an overlay. Buildable, but it's genuinely new
code, not a restyle of what exists.

## 6. What needs refactoring first

Less than you'd expect, and less than the file's size might suggest. The
codebase is already cleanly separated (`BEINGS`, `ARCH`, `S`, the render
pipeline, the Accessibility Hub each own their own state). The real
prerequisite isn't refactoring — **it's art.** There is currently zero
top-down or overworld-scale artwork anywhere in this project. Every
procedural render that exists today draws a side-on walking scene, not a
map. Building "a large explorable illustrated Bergen mountain map" (§1)
needs that art commissioned or generated before any renderer can draw it —
no amount of code reorganization substitutes for it.

## 7. Performance risks worth naming honestly

Trail Mix today is a small, cheap canvas render — a handful of procedural
parallax layers and a couple of animated sprites. Sections 21–24 of the
brief (camera culling, object pools, a quality manager with three tiers) are
real concerns *for a genuinely large tile/sprite-heavy overworld* — but that
class of problem doesn't exist in this codebase yet because that scale of
world doesn't exist yet. If an overworld is built, these become real and
worth doing properly; building the quality-manager infrastructure before
there's anything expensive to manage would be solving a problem that
doesn't exist yet.

## 8–9. Files

**Modified**, in any first real step: `trail-mix.html` (new phase, new
render path — this is a substantial addition, not a small diff),
`data/route.json` (if per-stop "chunk" metadata is wanted).

**New**, likely: an `assets/overworld/` concept-art source (analogous to
`assets/pack-v2/`) once art exists to cut, and a matching build script if
the pack-v2 pattern is followed. The project has deliberately stayed
single-file so far; a genuinely large new render mode is the first thing
in this project's history that would make splitting `trail-mix.html`'s
script into modules worth reconsidering — flagged, not decided here.

## 10. A realistic staged plan

The brief's own 18 phases assume art and systems that don't exist yet. Here
is a smaller, honest sequence that only commits to what's actually buildable
next, without inventing a timeline for work that depends on art no one has
made:

1. **Decide the provenance-system question directly** — see below. This
   brief's §3 asks for a 7-state system (`DOCUMENTED / LOCAL LEGEND /
   HISTORICAL BELIEF / OBSERVED / ARTISTIC INTERPRETATION / RESEARCH
   PENDING / UNKNOWN`), which contradicts the explicit choice made in the
   previous session turn to keep the existing 3-tier `kind`/`status` model
   (using `coerced:true` for testimony-like cases, as already done for
   Anne Pedersdotter). Both can't stand — pick one before anything else in
   this brief gets built on top of it.
2. **Grow `#rmMap` toward "fog of knowledge" incrementally** — e.g. locked
   nodes could show a genuinely vaguer label than the current "NOT YET
   WALKED" (matching §2's `?` → `STRUCTURE` → named progression), using
   data that already exists, no new art required. Cheap, real, ships fast.
3. **Only then, and only with real art in hand**, take on the actual
   overworld render mode (§1, §4) as its own scoped project — not folded
   into a single pass with everything else.

Everything past that (weather/time, the multi-layer sound mixer, NPCs
joining the group, chunk loading, the quality manager) depends on the
overworld existing first and should be scoped when it does, not promised
now.

## The one direct conflict to resolve

This brief's provenance system (§3) is incompatible with the explicit
decision made one turn earlier in this project (build on the existing
`kind: documented/observed/imagined` × `status: verified/unverified` model
rather than a new tiered rewrite, specifically so the Fløyen witch-trial
material could reuse Anne Pedersdotter's `coerced:true` pattern). Since both
came from Ingrid, in immediate succession, this needs an explicit answer
rather than silently picking one.

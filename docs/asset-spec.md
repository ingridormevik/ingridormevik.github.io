# Trail Mix — world implementation spec

Mount Media × Preem Cast
Route: Sandviken sykehus → Sandviksbatteriet → Sandvikspilen → Fløyen → Fløibanen

This is the normative document. The asset registry it describes lives as data in
`data/assets.json`; the knowledge tiers live in `data/history.json`,
`data/folklore.json` and `data/sources.json`.

---

## Core rule

This is a real Bergen cultural-tourism game, not a generic Norwegian fantasy game.

**Never fabricate:** Bergen history · buildings · monuments · military structures ·
trail geography · viewpoints · flora and fauna · folklore tied to a specific location ·
dates · historical events · quotations.

**Rule 18 — if you do not know, do not invent.** Write
`{"status": "unverified", "research_required": true}` and leave the educational text
blank. Fantasy may be imaginative. History may not.

Rule 18 is enforced by the renderer, not by discipline. `tools/build-trail.py` refuses
to display `educational_text_*` unless the entry is `status: "verified"` **and** names a
source that is itself `verified: true` in `data/sources.json`. Plausible text pasted
into an unverified entry does not reach the page — this is tested.

---

## The two fields

The original brief used one axis, `VERIFIED | INTERPRETATION | UNVERIFIED`. That
conflates two different questions, so it is split:

```json
{ "kind": "documented | observed | imagined",
  "status": "verified | unverified",
  "source": "id from data/sources.json" }
```

`kind` is **what sort of knowledge this is** — the three truth states, driving the
colour, icon and label the player sees:

| kind | what it covers |
|---|---|
| **DOCUMENTED** | history, archive, infrastructure, landscape record |
| **OBSERVED** | plants, animals, weather, contemporary Bergen — checkable by eye |
| **IMAGINED** | folklore and Mount Media interpretation |

`status` is **how well sourced it is**, and applies to all three kinds independently. A
folklore card drawn from a citable collection is `imagined + verified`; one Mount Media
invented is `imagined + unverified` and says so. That distinction is the difference
between a folklore archive and a fantasy game.

One further flag the three states cannot express: **`coerced: true`**, for trial
testimony. Anne Pedersdotter's flying and sabbath are *documented* — it is a matter of
record that the words were written down — and false, and extracted under duress. Not
`imagined`, because nobody imagined them freely; not plainly `documented`, because
rendering them as fact repeats the prosecution's work.

---

## Folklore has provenance too

A being makes two separable claims, so it carries two source fields:

- `tradition_source` — where the being is documented as a tradition
- `local_attestation` — whether it is documented **at this place**, or `null`

When `local_attestation` is `null` the card prints, generated from the data and
impossible to omit:

> **Not attested at this location — Mount Media interpretation.**

Folklore does not mean these beings historically lived on this route. Do not claim a
creature inhabited a Trail Mix location unless a source establishes that local tradition.

**Folklore is never an enemy.** No combat, anywhere. Interactions are: observe, listen,
follow briefly, unlock a card, compare interpretations, hear a story, watch it
disappear. Folklore is cultural imagination, not monster hunting.

**Folklore permission is per stop.** `route.json` carries `folklore_permitted` on each
stop. Casting a being at a stop set to `false` is a **build error**, not a review
comment — `tools/build-trail.py` exits non-zero. Two stops are closed:

- **Sandviken sykehus** — the chapter is MEMORY and institutional history. No horror
  asylum tropes, no ghost patients, no straitjackets, no screaming ambience, no
  mental-illness monsters. The chapter is about care, language, stigma and changing
  understandings of mental health. The documented name changes — and what they were
  *for* — are a stronger chapter than any ghost.
- **Fløibanen** — the closing chapter is documented infrastructure. Keep the ending
  factual.

On this route only **Huldra** is cast, in the forest. Pesta belongs to the harbour at
Vågen, which is not on this route; she stays archive-only rather than being relocated to
fit.

---

## Chapters and stops

**Eight chapters, six physical stops.** Two chapters are transitions rather than places
and get scenery but no QR code and no archive stop.

| # | chapter | theme | stop |
|---|---|---|---|
| 1 | Sandviken sykehus | MEMORY | ✓ |
| 2 | The City Releases You | TRANSITION | — |
| 3 | Sandviksbatteriet | HISTORY | ✓ |
| 4 | The Climb | EFFORT | — |
| 5 | Sandvikspilen | PERSPECTIVE | ✓ |
| 6 | The Forest Remembers | ATTENTION | ✓ |
| 7 | Fløyen | TOGETHERNESS | ✓ |
| 8 | Fløibanen | CONNECTION | ✓ |

No health bar. The meters are PACE, PRESENCE, CURIOSITY and CARE, and they are never
shown as numbers. Moving slowly reveals things speed misses.

---

## Visual system

AAA-quality 2D pixel art. Modern pixel art, not retro parody. Mount Media darkness plus
Trail Mix warmth. Bergen stays recognisable.

Layers, back to front: sky · distant mountains · Bergen/fjord skyline · distant
vegetation · architecture · middle vegetation · trail · characters · interactive objects
· foreground vegetation · weather · particles · UI. All environmental layers support
parallax; the coefficients live in `route.json`.

---

## The history lens

At Sandviken sykehus and Sandviksbatteriet the player can reveal archival layers over
the present landscape. This should feel like encountering layers of the same place, not
entering a separate history level.

---

## Narrative principle

The goal is not *get to Fløyen*. The goal is **learn to notice Bergen**.

Jack provides movement and music. Ingrid carries and mediates sound and story. The
player follows — until the player begins noticing things without either of them
pointing. That is the progression.

---

## Verification status, honestly

Two anchors are verified with citations:

- **Sandviken sykehus** — opened 1891 as Neevengården sinnssykeasyl; renamed
  Neevengården sykehus 1927; Sandviken sykehus 1978. (SNL)
- **Fløibanen** — idea 1895; A/S Fløibanen 1912; construction 1914; opened 15 January
  1918; fifth-generation cars 1 April 2022, named Rødhette and Blåmann. (Fløibanen AS)

Everything else is in `sources.json → research_queue`. Sandviksbatteriet is the
instructive case: web search returns confident, specific, internally consistent claims —
built 1895–1902, or 1895–1905; German bunkers; not manned in April 1940 — sourced to
hiking sites and a hash-house-harriers page, with the construction dates already
disagreeing. It is exactly the material rule 18 exists to stop. It ships blank.

`snl.no`, `no.wikipedia.org`, `api.floyen.no` and `kulturminnesok.no` are all blocked by
the build environment's network proxy, so this research has to be done by a human with
access to Bergen Byarkiv, Riksantikvaren and Bergen byleksikon.

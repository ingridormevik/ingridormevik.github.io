# Me, Myself and AI — CDN Equinox Autumn 2026

Presentation deck for the *Haunting of the Author* panel, 23 September 2026,
Litteraturhuset, Bergen. Forked from the working deck so the original stays intact.

## Running it

Open `me-myself-and-ai.html` directly — it needs no server.

The six portraits and the Case 01 images are **not in the repo**; they live in the
same folder as the HTML on the presenting laptop. Copy them in beside this file
before rehearsing. Filenames the deck expects are listed in `FACES` and in
`defaultFrameMap` inside the file.

## Controls

| Key | Does |
|---|---|
| → ↓ space | advance — *within* a slide if it has stages, otherwise to the next slide |
| ← ↑ | back, unwinding stages the same way |
| `N` | speaker notes |
| `P` | presenter window (notes + clock, over BroadcastChannel) |
| `F` | fullscreen |
| `L` | **on the reveal slide:** switch between demo numbers and live server data |

Two slides advance internally rather than jumping: the reveal (3 stages) and
bergtatt (3 stages). Sixteen advances carry the whole deck end to end.

## The reveal slide and its data

`DEMO_VOTES` in the script is **rehearsal data and is labelled as such on screen**
— the corner flag reads "Demo numbers — not real data" whenever it is showing.
Replace it with real counts, or press `L` for live once the classifier server exists.
The flag is deliberately impossible to miss so demo figures can never be mistaken
for the room's actual answer.

## Timing

Budgets total **7:30**, leaving reserve inside an 8-minute slot. The pace clock in
the top right tracks against them. Rehearse against it — the reveal is the beat
most likely to overrun.

## Borrowed from elsewhere in this repo

- Beat/pulse watchdog — `trail-mix-v2.html` (`BEAT`, `beatUpdate`)
- Ridge renderer — `bergtatt-visuals.html` (`buildRidge`, `fillRidge`)
- Phrases — `fjordtatt-visuals.html` (`DIGITAL_NARRATIVE`)

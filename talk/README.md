# Me, Myself and AI — CDN Equinox Autumn 2026

Presentation deck for the *Haunting of the Author* panel, 23 September 2026,
Litteraturhuset, Bergen. Forked from the working deck so the original stays intact.

## Running it

Open `me-myself-and-ai.html` directly — it needs no server.

The portraits and the audio track are **not in the repo** — they live on the
presenting laptop. Put them in any one of these places and the deck will find them:

- beside this file, in `talk/`
- in the folder above it (the repo root, where they already are)
- in a `media/` folder in either location

Each file is probed against those bases and the first hit wins, so moving the deck
does not break it. **Press `M` for a report of anything that did not resolve** —
do that once before going on stage.

## Controls

| Key | Does |
|---|---|
| → ↓ space | advance — *within* a slide if it has stages, otherwise to the next slide |
| ← ↑ | back, unwinding stages the same way |
| `N` | speaker notes |
| `P` | presenter window (notes + clock, over BroadcastChannel) |
| `F` | fullscreen |
| `L` | **on the reveal slide:** switch between demo numbers and live server data |
| `M` | media check — lists any file that could not be found |

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

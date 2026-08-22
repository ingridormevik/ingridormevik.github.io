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

Three slides advance internally rather than jumping: the reveal (3 beats),
bergtatt (3 beats) and the closing (4 beats). Eighteen advances carry the whole
deck end to end.

On those slides the counter reads `08 / 12 · beat 2 of 3`, so a press always
shows it registered even when the change on screen is only a line fading in.

## The reveal slide and its data

`DEMO_VOTES` in the script is **rehearsal data and is labelled as such on screen**
— the corner flag reads "Demo numbers — not real data" whenever it is showing.
Replace it with real counts, or press `L` for live once the classifier server exists.
The flag is deliberately impossible to miss so demo figures can never be mistaken
for the room's actual answer.

## Timing

Budgets total **7:45**, leaving reserve inside an 8-minute slot. The pace clock in
the top right tracks against them. Rehearse against it — the reveal is the beat
most likely to overrun.

## The argument

The machine is not the antagonist. It is the evidence. Society classified her
long before any of this was computational; AI did not invent the categories,
it returned them with computational confidence. So the question is not *how
does the machine see me* but **what has society made available for the machine
to see** — and the reveal slide proves it by having the room do the sorting.

The closing states it in four beats, one per click, ending on *"It was a test
of us."* Earlier beats dim rather than disappear, so the whole argument is
standing on screen through Q&A.

Slide 12, Manifestations / Blom, was cut to make room. Blom survives in the
Q&A notes on the end card.

## Borrowed from elsewhere in this repo

- Beat/pulse watchdog — `trail-mix-v2.html` (`BEAT`, `beatUpdate`)
- Ridge renderer — `bergtatt-visuals.html` (`buildRidge`, `fillRidge`)
- Phrases — `fjordtatt-visuals.html` (`DIGITAL_NARRATIVE`)

---

## The Classifier — the audience test

The room votes on six portraits from their phones; the deck shows the tally
live; then the reveal that every portrait is the same person.

### Running it

```
node talk/classifier/server.js --images /path/to/the/portraits
```

It prints the URL the room should open. Then make the QR:

```
python3 tools/make-classifier-qr.py --url http://<that address>
```

Open the deck. If the server is on a different address than the default
`localhost:8080`, point the deck at it:

```
talk/me-myself-and-ai.html?server=http://192.168.1.42:8080
```

### Three states, and no fourth

The flag in the corner of the reveal slide always says which one is showing:

| Flag | Means |
|---|---|
| `Waiting for the room` | nobody has answered yet — bars sit at zero |
| `Live — N responses` | the server, updating as people tap |
| `Counted by hand` | a show of hands, typed in with `H` |

**No number ever appears on that screen that did not come from real people.**
There is no demo mode and no sample data. If the server dies mid-talk the deck
drops back to `Waiting for the room` and zeroes the bars rather than leaving
stale figures up.

`H` on the reveal slide opens the hand-count entry — six lines, `woman man unsure`.
`L` switches between live and hand-counted when both exist.

### What is recorded

One line per vote in `talk/classifier/votes.jsonl`: timestamp, a random
per-phone id, the face, the choice. The id exists only to stop one phone voting
twice on the same face. No names, no accounts, no device details, no IP. The
phone screen says this before anyone taps.

`votes.jsonl` is gitignored — the room's answers stay on the laptop.

### If the network fails

The count survives a restart: the server replays `votes.jsonl` on start, so
killing and relaunching mid-talk rebuilds the tally rather than resetting it.
If there is no network at all, use `H` and count hands.

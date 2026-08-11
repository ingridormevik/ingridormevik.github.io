#!/usr/bin/env python3
"""
Cut the separated concept pack into usable production assets.

    python3 tools/build-pack-v2.py

Reads   assets/pack-v2/*.png          (the uploaded concept pack, source of truth)
Writes  assets/locations/*.png        location banners cleared for use
        assets/folklore/*.png         being portraits
        assets/quarantine/*.png       art that fails the project's own core rule
        data/pack-v2.json             registry of what was cut and what was refused

QUARANTINE

The pack's own README states a no-hallucination rule. Two of its panels break it,
so they are cut to assets/quarantine/ rather than into the live set. Quarantined
art is kept, not deleted — it is good art and it may be reshot from a photograph.
It simply may never carry a factual claim.

Everything cut here is concept art. Nothing in this file makes a factual claim on
its own; the claims live in data/history.json behind the rule 18 gate.
"""

import json
import pathlib
import sys

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Pillow is required:  pip install pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
PACK = ROOT / "assets" / "pack-v2"

# Panel grid measured from 05_route_landscapes.png (729x287) by gap detection.
LAND_COLS = [(10, 193), (193, 376), (376, 560), (566, 729)]
LAND_ROWS = [(8, 107), (125, 224)]

LANDSCAPES = [
    # (row, col, output name, stop id or None, quarantine reason or None)
    (0, 0, "sandviken-sykehus", "sandviken-sykehus", None),
    (0, 1, "city-edge", "city-releases-you", None),
    (0, 2, "trail-forest", "forest-transition", None),
    (0, 3, "sandviksbatteriet", "sandviksbatteriet",
     "Depicts a naval cannon on a stone emplacement. The world spec for this stop "
     "says 'no invented cannons or dates'. The armament at Sandviksbatteriet is "
     "research_queue/sandviksbatteriet_history and is unresolved, so this gun is "
     "invented. Reshoot from a photograph of the real site."),
    (1, 0, "sandvikspilen", "sandvikspilen", None),
    (1, 1, "floyen", "floyen", None),
    (1, 2, "floibanen-top", "floibanen", None),
    (1, 3, "floibanen-bottom", None, None),
]

# Folklore portraits are cut from 00_master_sheet.png rather than 11_folklore.png:
# the separated crop clips Huldra at the left edge and bleeds the history strip in
# on the right. Columns measured by variance detection on the master sheet.
FOLK_ROW = (710, 826)
FOLK_COLS = [(491, 543), (560, 609), (624, 702), (713, 776),
             (786, 845), (859, 914), (930, 959), (976, 1030)]
FOLK_NAMES = ["huldra", "nokken", "troll", "fossegrimen",
              "draugen", "mare", "nisse", "underjordiske"]

QUARANTINE_SHEETS = [
    ("12_history_archive.png",
     "Fabricated archival photographs carrying hallucinated captions and dates — "
     "readable as 'Neevengardrent 1591', 'Slojtbaroe 1178' and similar. These are "
     "not photographs of the real buildings and the dates are invented. The core "
     "rule forbids fabricating buildings, dates and historical events. May be reused "
     "ONLY as paper and frame texture with every caption painted out; never as an "
     "archival image, and never behind a history-lens overlay."),
]


def autotrim(im, max_shave=12, flat=12.0):
    """Shave near-uniform edge lines — the painted frame and any sliver of the
    neighbouring panel. Measured rather than guessed, so a re-cut of a differently
    laid-out sheet still lands on the picture."""
    import numpy as np
    a = np.array(im.convert("L")).astype(float)
    l, r, t, b = 0, a.shape[1], 0, a.shape[0]
    while l < max_shave and a[:, l].std() < flat:
        l += 1
    while r > a.shape[1] - max_shave and a[:, r - 1].std() < flat:
        r -= 1
    while t < max_shave and a[t, :].std() < flat:
        t += 1
    while b > a.shape[0] - max_shave and a[b - 1, :].std() < flat:
        b -= 1
    return im.crop((l, t, r, b))


# The concept panels are painterly renders about 176px wide. Upscaling a painting
# gives mush. Quantising to a small palette gives crisp, deliberate pixels — the
# same treatment the game's canvas already gets via image-rendering: pixelated.
PIXEL_COLOURS = 32


# Colours held out of quantisation and written into the palette by hand.
#
# Seeding them into the sheet and hoping median cut keeps them does not work — it
# allocates by colour distribution, so a colour covering a few hundred pixels gets
# merged away. Measured: gold came back 44 units off, and every saturated red was
# dropped, which turned the Fløibanen cars brown. They are named Rødhette and
# Blåmann. Red is not a stylistic preference there, it is the subject.
RESERVED = [
    (0xc7, 0x4a, 0x3c),  # rm-red — Fløibanen's cars, and the UI's warning colour
    (0xd4, 0xa7, 0x58),  # rm-gold — headings, and warm window light
    (0xe8, 0xdc, 0xc0),  # rm-cream — body text, and painted render
    (0x4a, 0x3a, 0x2a),  # rm-edge — panel borders, and bare timber
    (0x0d, 0x0a, 0x12),  # rm-ink — the background everything sits on
]


def build_shared_palette(images, colours=PIXEL_COLOURS):
    """One palette for every panel in the game.

    Quantising each image on its own gives each panel its own private colours —
    which is exactly why AI art cut into a game reads as a pile of stock images
    rather than as one world. Real pixel art commits to a fixed palette and makes
    every scene live inside it. So: tile all the art into one sheet, quantise that
    once, and map every image through the result.

    The art gets colours - len(RESERVED) slots by median cut; the reserved colours
    take the remainder verbatim, so the interface and the artwork are literally
    drawn from the same box of pencils.
    """
    tile = max(im.width for im in images), max(im.height for im in images)
    sheet = Image.new("RGB", (tile[0] * len(images), tile[1]))
    for i, im in enumerate(images):
        sheet.paste(im.convert("RGB").resize(tile, Image.BOX), (tile[0] * i, 0))

    # MEDIANCUT, not MAXCOVERAGE. On a single small panel MAXCOVERAGE is fine, but
    # across the concatenated sheet it degenerates into near-primaries (#ffffff,
    # #f1171d, #6eeefc) that appear nowhere in the art. MEDIANCUT splits the actual
    # colour distribution and returns the greys, ochres and blues of the paintings.
    art = sheet.quantize(colors=colours - len(RESERVED),
                         method=Image.MEDIANCUT, dither=Image.NONE)

    flat = art.getpalette()[:(colours - len(RESERVED)) * 3]
    for c in RESERVED:
        flat += list(c)
    flat += [0] * (768 - len(flat))

    pal = Image.new("P", (1, 1))
    pal.putpalette(flat)
    return pal


def to_palette(im, palette):
    """Map one image onto the shared palette."""
    rgb = im.convert("RGB").filter(ImageFilter.MedianFilter(3))
    return rgb.quantize(palette=palette, dither=Image.NONE)


def pixelate(im, colours=PIXEL_COLOURS):
    """Return a palette-mode image at its native pixel grid.

    No upscaling is baked in. The page sets image-rendering:pixelated, so the
    browser does the nearest-neighbour scaling at whatever size it renders — the
    result on screen is identical to a pre-scaled file, and the file is about six
    times smaller (5 KB against 29 KB for the forest panel). On a trail with bad
    signal that difference is the whole point.
    """
    # Median first. Quantising painterly foliage straight off turns high-frequency
    # brushwork into speckle that reads as noise, not as pixels; a 3px median
    # collapses it into flat shapes the palette can hold. Halving the resolution
    # instead was tried and loses too much definition on these small panels.
    rgb = im.convert("RGB").filter(ImageFilter.MedianFilter(3))
    # Adaptive palette keeps each scene readable; MAXCOVERAGE favours the broad
    # areas (sky, foliage, stone) over stray highlights.
    return rgb.quantize(colors=colours, method=Image.MAXCOVERAGE, dither=Image.NONE)


def cut(im, box, out, trim=False, pixel=False):
    out.parent.mkdir(parents=True, exist_ok=True)
    c = im.crop(box)
    if trim:
        c = autotrim(c)
    if pixel:
        c = pixelate(c)
    c.save(out, optimize=True)
    return out.relative_to(ROOT).as_posix()


def main():
    if not PACK.exists():
        sys.exit(f"missing {PACK} — unpack the concept pack there first")

    reg = {"_comment": "What tools/build-pack-v2.py cut from the concept pack, and "
                       "what it refused. Source art stays in assets/pack-v2/.",
           "locations": [], "folklore": [], "quarantined": []}

    # Pass one: cut every crop, in memory. Pass two: derive one palette from all
    # of them together, then write. The palette cannot be built until every crop
    # exists, and no crop may be written until the palette exists.
    crops = []  # (image, destination, kind, name, stop, reason)

    land = Image.open(PACK / "05_route_landscapes.png").convert("RGBA")
    for row, col, name, stop, reason in LANDSCAPES:
        # Inset past the painted frame so a neighbouring panel cannot bleed in.
        x0, x1 = LAND_COLS[col]
        y0, y1 = LAND_ROWS[row]
        c = autotrim(land.crop((x0 + 7, y0 + 3, x1 - 3, y1 - 3)))
        folder = "quarantine" if reason else "locations"
        crops.append((c, ROOT / "assets" / folder / f"{name}.png",
                      "quarantined" if reason else "location", name, stop, reason))

    folk = Image.open(PACK / "00_master_sheet.png").convert("RGBA")
    y0, y1 = FOLK_ROW
    for name, (x0, x1) in zip(FOLK_NAMES, FOLK_COLS):
        crops.append((folk.crop((x0, y0, x1, y1)),
                      ROOT / "assets" / "folklore" / f"{name}.png",
                      "folklore", name, None, None))

    palette = build_shared_palette([c[0] for c in crops])

    for img, dest, kind, name, stop, reason in crops:
        dest.parent.mkdir(parents=True, exist_ok=True)
        to_palette(img, palette).save(dest, optimize=True)
        p = dest.relative_to(ROOT).as_posix()
        if kind == "quarantined":
            reg["quarantined"].append(
                {"asset": p, "stop": stop, "reason": reason, "usable_as": None})
        elif kind == "location":
            reg["locations"].append({"id": name, "stop": stop, "asset": p,
                                     "kind": "concept_art", "status": "unverified",
                                     "note": "Painted interpretation, not a photograph. "
                                             "Carries no factual claim."})
        else:
            reg["folklore"].append({"id": name, "asset": p, "kind": "imagined",
                                    "status": "unverified",
                                    "label": "ARTISTIC INTERPRETATION — INSPIRED BY "
                                             "NORWEGIAN FOLKLORE"})

    reg["palette"] = {
        "_comment": "One palette for every panel, seeded with the game's UI colours "
                    "so the art and the interface cannot drift apart.",
        "colours": PIXEL_COLOURS,
        "hex": ["#%02x%02x%02x" % tuple(palette.getpalette()[i * 3:i * 3 + 3])
                for i in range(PIXEL_COLOURS)]}

    for fname, reason in QUARANTINE_SHEETS:
        src = PACK / fname
        if src.exists():
            dst = ROOT / "assets" / "quarantine" / fname
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_bytes(src.read_bytes())
            reg["quarantined"].append(
                {"asset": dst.relative_to(ROOT).as_posix(), "stop": None,
                 "reason": reason,
                 "usable_as": "paper/frame texture only, all captions removed"})

    (ROOT / "assets" / "quarantine" / "README.md").write_text(
        "# Quarantine\n\n"
        "Art that fails the project's core rule. Kept, not deleted — it is good art "
        "and can be redrawn from a photograph. It may never carry a factual claim, "
        "sit behind a history lens, or be referenced from `data/history.json`.\n\n"
        + "\n".join(f"- **{q['asset'].split('/')[-1]}** — {q['reason']}\n"
                    for q in reg["quarantined"]), encoding="utf-8")

    (ROOT / "data" / "pack-v2.json").write_text(
        json.dumps(reg, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"locations cleared: {len(reg['locations'])}")
    print(f"folklore portraits: {len(reg['folklore'])}")
    print(f"QUARANTINED: {len(reg['quarantined'])} — see assets/quarantine/README.md")


if __name__ == "__main__":
    main()

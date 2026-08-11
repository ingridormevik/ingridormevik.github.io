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
    from PIL import Image
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


def cut(im, box, out, trim=False):
    out.parent.mkdir(parents=True, exist_ok=True)
    c = im.crop(box)
    if trim:
        c = autotrim(c)
    c.save(out)
    return out.relative_to(ROOT).as_posix()


def main():
    if not PACK.exists():
        sys.exit(f"missing {PACK} — unpack the concept pack there first")

    reg = {"_comment": "What tools/build-pack-v2.py cut from the concept pack, and "
                       "what it refused. Source art stays in assets/pack-v2/.",
           "locations": [], "folklore": [], "quarantined": []}

    land = Image.open(PACK / "05_route_landscapes.png").convert("RGBA")
    for row, col, name, stop, reason in LANDSCAPES:
        # Inset past the painted frame so a neighbouring panel cannot bleed in.
        x0, x1 = LAND_COLS[col]
        y0, y1 = LAND_ROWS[row]
        x0, x1, y0, y1 = x0 + 7, x1 - 3, y0 + 3, y1 - 3
        if reason:
            p = cut(land, (x0, y0, x1, y1),
                    ROOT / "assets" / "quarantine" / f"{name}.png", trim=True)
            reg["quarantined"].append(
                {"asset": p, "stop": stop, "reason": reason, "usable_as": None})
        else:
            p = cut(land, (x0, y0, x1, y1),
                    ROOT / "assets" / "locations" / f"{name}.png", trim=True)
            reg["locations"].append({"id": name, "stop": stop, "asset": p,
                                     "kind": "concept_art", "status": "unverified",
                                     "note": "Painted interpretation, not a photograph. "
                                             "Carries no factual claim."})

    folk = Image.open(PACK / "00_master_sheet.png").convert("RGBA")
    y0, y1 = FOLK_ROW
    for name, (x0, x1) in zip(FOLK_NAMES, FOLK_COLS):
        p = cut(folk, (x0, y0, x1, y1),
                ROOT / "assets" / "folklore" / f"{name}.png")
        reg["folklore"].append({"id": name, "asset": p, "kind": "imagined",
                                "status": "unverified",
                                "label": "ARTISTIC INTERPRETATION — INSPIRED BY "
                                         "NORWEGIAN FOLKLORE"})

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

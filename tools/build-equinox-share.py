#!/usr/bin/env python3
"""
Build the Open Graph share image for the fall equinox promotion.

    python3 tools/build-equinox-share.py

Reads   data/equinox.json, assets/locations/floyen.png (already cut and
        palette-matched by tools/build-pack-v2.py)
Writes  assets/share/equinox-2026.png (1200x630, the standard OG size)

Composites the already-built pixel-art Fløyen banner — no new art, no
upscaling, same reasoning as the rest of the pack pipeline — against the
game's own ink/gold/cream palette, with the date and tagline read from
data/equinox.json rather than hardcoded here.
"""

import json
import pathlib
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow is required: pip install pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H = 1200, 630
INK = "#0d0a12"
GOLD = "#d4a758"
CREAM = "#e8dcc0"
EDGE = "#4a3a2a"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def main():
    eqx = json.loads((ROOT / "data" / "equinox.json").read_text(encoding="utf-8"))
    banner_path = ROOT / "assets" / "locations" / "floyen.png"

    img = Image.new("RGB", (W, H), INK)

    if banner_path.exists():
        art = Image.open(banner_path).convert("RGB")
        # Nearest-neighbour only — this is already-pixelated art; any other
        # resample would blur the palette work done in build-pack-v2.py.
        scale = H / art.height
        art = art.resize((int(art.width * scale), H), Image.NEAREST)
        # Crop to width, anchored right so the treeline (not empty sky)
        # sits behind the text block on the left.
        x0 = max(0, art.width - W)
        art = art.crop((x0, 0, x0 + min(W, art.width), H))
        img.paste(art, (W - art.width, 0))
        # Ink gradient over the left two-thirds so text stays legible.
        grad = Image.new("L", (W, 1))
        for x in range(W):
            grad.putpixel((x, 0), 255 if x < W * 0.55 else max(0, int(255 - (x - W * 0.55) / (W * 0.35) * 255)))
        grad = grad.resize((W, H))
        dark = Image.new("RGB", (W, H), INK)
        img = Image.composite(dark, img, grad)

    d = ImageDraw.Draw(img)
    f_brand = ImageFont.truetype(FONT, 22)
    f_title = ImageFont.truetype(FONT, 64)
    f_date = ImageFont.truetype(FONT, 30)
    f_tag = ImageFont.truetype(FONT_R, 22)

    x = 64
    d.text((x, 70), "MOUNT MEDIA × PREEM CAST", font=f_brand, fill=GOLD)
    d.text((x, 110), "TRAIL MIX", font=f_title, fill=CREAM)
    d.rectangle([x, 200, x + 340, 203], fill=EDGE)
    d.text((x, 230), "SEPTEMBER EQUINOX WALK", font=f_date, fill=GOLD)
    d.text((x, 275), eqx["event_date_display"], font=f_date, fill=CREAM)

    cdn = eqx.get("cdn_tie_in", {})
    tag = eqx["tagline"]
    if cdn:
        tag += (f" The weekend after CDN's Autumn Equinox Open Research Day "
                f"({cdn['event_date_display'].split()[0]} {cdn['event_date_display'].split()[1]} Sep), "
                f"where I'm presenting.")
    words, line, y = tag.split(), "", 340
    for w in words:
        trial = (line + " " + w).strip()
        if d.textlength(trial, font=f_tag) > 460:
            d.text((x, y), line, font=f_tag, fill=CREAM)
            y += 30
            line = w
        else:
            line = trial
    if line:
        d.text((x, y), line, font=f_tag, fill=CREAM)

    d.text((x, H - 60), "ingridormevik.github.io/trail-mix-v2.html",
            font=f_tag, fill=GOLD)

    out = ROOT / "assets" / "share"
    out.mkdir(parents=True, exist_ok=True)
    img.save(out / "equinox-2026.png", optimize=True)
    print(f"wrote assets/share/equinox-2026.png ({W}x{H})")


if __name__ == "__main__":
    main()

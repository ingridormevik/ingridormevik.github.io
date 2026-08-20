#!/usr/bin/env python3
"""
Make the QR code the room scans to reach the Classifier.

Uses segno at error correction H, the same settings as build-trail.py, so the
code survives being photographed off a projector at an angle.

    node talk/classifier/server.js          # prints the URL
    python3 tools/make-classifier-qr.py --url http://192.168.1.42:8080

Writes assets/qr/classifier.svg and a PNG beside it for slide decks that
would rather have a raster.
"""

import argparse
import sys
from pathlib import Path

try:
    import segno
except ImportError:
    sys.exit("segno is not installed.  pip install segno")

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "qr"

# same as build-trail.py, so the trail codes and this one look like one family
QR_ERROR = "h"
QR_SCALE = 8
QR_BORDER = 4
DARK = "#1b1a17"
LIGHT = "#ffffff"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True,
                    help="the URL the server printed, e.g. http://192.168.1.42:8080")
    ap.add_argument("--name", default="classifier", help="output filename stem")
    ap.add_argument("--dark", default=DARK, help="module colour")
    ap.add_argument("--light", default=LIGHT,
                    help="background colour, or 'none' for transparent")
    args = ap.parse_args()

    if not args.url.startswith(("http://", "https://")):
        sys.exit("--url must start with http:// or https://")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    light = None if args.light.lower() == "none" else args.light

    qr = segno.make(args.url, error=QR_ERROR)

    svg = OUT_DIR / f"{args.name}.svg"
    qr.save(str(svg), scale=QR_SCALE, border=QR_BORDER, dark=args.dark, light=light)

    png = OUT_DIR / f"{args.name}.png"
    try:
        qr.save(str(png), scale=QR_SCALE * 2, border=QR_BORDER,
                dark=args.dark, light=light)
        png_note = f"\n  {png.relative_to(ROOT)}"
    except Exception:
        # PNG output needs an extra dependency; the SVG is the one that matters
        png_note = "\n  (PNG skipped: pip install 'segno[pil]' if you want one)"

    print(f"\n  QR for {args.url}"
          f"\n  version {qr.version}, error correction {QR_ERROR.upper()}"
          f"\n\n  {svg.relative_to(ROOT)}{png_note}\n")

    # A quick sanity read of what got encoded, so a typo is caught here and
    # not by a room full of people whose phones go nowhere.
    print("  encodes exactly:  " + args.url + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

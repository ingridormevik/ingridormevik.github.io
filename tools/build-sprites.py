#!/usr/bin/env python3
"""
Build game-ready sprite frames for Trail Mix.

The supplied sprite pack (assets/pack/) was cut from a single generated concept
sheet with a brightness threshold. That threshold is destructive for this art:
Ingrid's black shirt and shorts sit within a few levels of the sheet's near-black
background, so the pack's alpha punches holes straight through her clothing, and
through Jack's shorts and controller.

The pack's RGB survives underneath that alpha, so this script ignores the packed
alpha and rebuilds it:

  1. foreground  = RGB luminance above a low cutoff (keeps the darkest cloth)
  2. seal        = dilate by 1px, closing the hairline channels that let a flood
                   fill leak from the background into dark clothing
  3. background  = flood fill inwards from the frame border over the sealed mask
  4. de-halo     = drop the 1px rim the seal added back around the silhouette
  5. de-speckle  = keep the largest connected blob, discarding props and debris
                   that the pack's crops pulled in from neighbouring sheet rows

Frames are then sliced on the pack's own gaps, foot-aligned into a uniform box,
and written with a manifest. Output goes to assets/sprites-pack/ - the live
game's own set in assets/sprites/ is never touched. Re-run after replacing
anything in assets/pack/.

    python3 tools/build-sprites.py
"""

import json
import os
import collections

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.path.join(ROOT, 'assets', 'pack')
OUT = os.path.join(ROOT, 'assets', 'sprites-pack')

FRAME_W, FRAME_H = 128, 128
FOOT_Y = 120                 # baseline inside the frame box
LUMA_CUTOFF = 26             # background sums ~22, darkest clothing ~34
MIN_FRAME_W = 22             # narrower runs are debris, not a pose
MAX_CHAR_H = 100             # tallest real pose; anything above is row bleed
PINCH_W = 6                  # a row this narrow high up is a weld, not anatomy

# strip -> (animation name, fps). Order defines manifest order.
SOURCES = {
    'ingrid': [
        ('idle_strip.png',          'idle',          4),
        ('walk_right_strip.png',    'walk_right',    8),
        ('walk_left_strip.png',     'walk_left',     8),
        ('uphill_right_strip.png',  'uphill_right',  7),
        ('uphill_left_strip.png',   'uphill_left',   7),
        ('listen_rest_strip.png',   'listen_rest',   3),
        ('looking_out_strip.png',   'looking_out',   4),
        ('adjust_strap_strip.png',  'adjust_strap',  6),
        ('check_speaker_strip.png', 'check_speaker', 6),
        ('feel_the_beat_strip.png', 'feel_the_beat', 6),
    ],
    'jack': [
        ('idle_strip.png',           'idle',           4),
        ('walk_right_strip.png',     'walk_right',     8),
        ('walk_left_strip.png',      'walk_left',      8),
        ('walk_mix_strip.png',       'walk_mix',       8),
        ('adjust_control_strip.png', 'adjust_control', 6),
        ('check_track_strip.png',    'check_track',    6),
        ('signal_lead_strip.png',    'signal_lead',    6),
    ],
}


def dilate(mask, radius=1):
    out = mask.copy()
    for _ in range(radius):
        p = np.pad(out, 1, constant_values=False)
        out = (p[1:-1, 1:-1] | p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] |
               p[1:-1, 2:] | p[:-2, :-2] | p[:-2, 2:] | p[2:, :-2] | p[2:, 2:])
    return out


def flood_background(sealed):
    """True where the sheet background is reachable from the border."""
    h, w = sealed.shape
    bg = np.zeros((h, w), bool)
    q = collections.deque()

    def push(y, x):
        if not sealed[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.append((y, x))

    for x in range(w):
        push(0, x)
        push(h - 1, x)
    for y in range(h):
        push(y, 0)
        push(y, w - 1)
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w:
                push(ny, nx)
    return bg


def largest_blob(mask):
    h, w = mask.shape
    label = np.zeros((h, w), int)
    sizes = {}
    n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and label[y, x] == 0:
                n += 1
                count = 0
                q = collections.deque([(y, x)])
                label[y, x] = n
                while q:
                    cy, cx = q.popleft()
                    count += 1
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and label[ny, nx] == 0:
                            label[ny, nx] = n
                            q.append((ny, nx))
                sizes[n] = count
    if not sizes:
        return mask
    return label == max(sizes, key=sizes.get)


def blobs(mask):
    """Yield (label_array, {label: size})."""
    h, w = mask.shape
    label = np.zeros((h, w), int)
    sizes = {}
    n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and label[y, x] == 0:
                n += 1
                count = 0
                q = collections.deque([(y, x)])
                label[y, x] = n
                while q:
                    cy, cx = q.popleft()
                    count += 1
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and label[ny, nx] == 0:
                            label[ny, nx] = n
                            q.append((ny, nx))
                sizes[n] = count
    return label, sizes


def clamp_height(alpha, max_h=MAX_CHAR_H):
    """Keep only max_h rows measured up from the feet.

    The pack's crops clip the bottom of the sheet row above, leaving stray
    shoes floating over a character's head. The seal can weld those to the
    silhouette, so largest-blob will not shift them and there is no clean
    horizontal gap to cut on - but they always sit above the character's
    own height, so a clamp from the baseline removes them reliably.
    """
    profile = alpha.sum(axis=1)
    rows = np.where(profile > 0)[0]
    if not len(rows):
        return alpha
    alpha = alpha.copy()

    # backstop: nothing can be taller than a real pose
    top = rows.max() + 1 - max_h
    if top > 0:
        alpha[:top] = False
        profile = alpha.sum(axis=1)
        rows = np.where(profile > 0)[0]
        if not len(rows):
            return alpha

    # the bleed is usually welded to the head by a thin neck of pixels rather
    # than floating free, so cut on the narrowest pinch in the upper third
    total = alpha.sum()
    limit = rows.min() + int((rows.max() - rows.min()) * 0.42)
    for y in range(rows.min() + 2, limit):
        if profile[y] <= PINCH_W and alpha[:y].sum() < total * 0.35:
            alpha[:y + 1] = False
            break
    return alpha


def rebuild_alpha(rgb):
    """rgb: HxWx3 int array -> boolean alpha mask."""
    fg = rgb.sum(axis=2) > LUMA_CUTOFF
    bg = flood_background(dilate(fg, 1))
    alpha = ~bg
    alpha &= ~(alpha & ~fg & dilate(bg, 1))       # remove the seal's halo
    return alpha


def frame_spans(strip_path):
    """Column spans of each pose, taken from the pack's own alpha gaps."""
    a = np.asarray(Image.open(strip_path).convert('RGBA'))
    cols = (a[..., 3] > 20).sum(axis=0)
    runs = []
    start = None
    for x, v in enumerate(cols):
        if v > 0 and start is None:
            start = x
        elif v == 0 and start is not None:
            runs.append((start, x))
            start = None
    if start is not None:
        runs.append((start, len(cols)))

    # fold slivers (detached shoes, stray props) into the nearest real pose
    merged = []
    for span in runs:
        if span[1] - span[0] >= MIN_FRAME_W:
            merged.append(list(span))
        elif merged and span[0] - merged[-1][1] < 24:
            merged[-1][1] = span[1]
    return [tuple(m) for m in merged]


def build_animation(who, strip_file, anim, fps):
    strip_path = os.path.join(PACK, who, strip_file)
    if not os.path.exists(strip_path):
        return None

    src = np.asarray(Image.open(strip_path).convert('RGBA')).astype(int)
    spans = frame_spans(strip_path)
    out_dir = os.path.join(OUT, who)
    os.makedirs(out_dir, exist_ok=True)

    written = 0
    for index, (x0, x1) in enumerate(spans):
        pad = 6
        cx0, cx1 = max(x0 - pad, 0), min(x1 + pad, src.shape[1])
        chunk = src[:, cx0:cx1, :3]
        alpha = largest_blob(clamp_height(largest_blob(rebuild_alpha(chunk))))
        if alpha.sum() < 220:                      # nothing meaningful survived
            continue

        ys, xs = np.where(alpha)
        base = ys.max() + 1
        top = ys.min()
        # Anchor on the torso, NOT the feet. Aligning on the feet pins them to
        # the same spot in every frame, so the legs never appear to move and the
        # body wobbles around them instead - the walk reads as sliding.
        torso = alpha[top:top + max(4, int((base - top) * 0.42)), :]
        tx = np.where(torso.sum(axis=0) > 0)[0]
        centre = int(round(tx.mean())) if len(tx) else int(round(xs.mean()))

        frame = np.zeros((FRAME_H, FRAME_W, 4), np.uint8)
        for sy in range(alpha.shape[0]):
            ty = FOOT_Y - (base - sy)
            if not 0 <= ty < FRAME_H:
                continue
            for sx in range(alpha.shape[1]):
                tx = FRAME_W // 2 + (sx - centre)
                if 0 <= tx < FRAME_W and alpha[sy, sx]:
                    frame[ty, tx, :3] = chunk[sy, sx]
                    frame[ty, tx, 3] = 255

        Image.fromarray(frame, 'RGBA').save(
            os.path.join(out_dir, '%s_%02d.png' % (anim, written)))
        written += 1

    return {'frames': written, 'fps': fps} if written else None


def build_portrait(who):
    """Crop off the concept sheet's decorative frame and 'PORTRAIT' caption."""
    path = os.path.join(PACK, who, 'portrait.png')
    if not os.path.exists(path):
        return False
    raw = Image.open(path).convert('RGBA')
    w, h = raw.size
    raw = raw.crop((7, int(h * 0.15), w - 7, h - 7))
    src = np.asarray(raw).astype(int)
    alpha = largest_blob(rebuild_alpha(src[..., :3]))
    out = src.copy()
    out[..., 3] = np.where(alpha, 255, 0)
    Image.fromarray(out.astype('uint8'), 'RGBA').save(
        os.path.join(OUT, who, 'portrait.png'))
    return True


def main():
    manifest = {
        'frame': {'width': FRAME_W, 'height': FRAME_H, 'footY': FOOT_Y},
        'note': 'Generated by tools/build-sprites.py from assets/pack/. Do not hand-edit.',
        'characters': {},
    }

    for who, jobs in SOURCES.items():
        os.makedirs(os.path.join(OUT, who), exist_ok=True)
        anims = {}
        for strip_file, anim, fps in jobs:
            info = build_animation(who, strip_file, anim, fps)
            if info:
                anims[anim] = info
                print('%-7s %-15s %d frames @ %d fps' % (who, anim, info['frames'], info['fps']))
        entry = {'animations': anims}
        if build_portrait(who):
            entry['portrait'] = 'portrait.png'
        manifest['characters'][who] = entry

    with open(os.path.join(OUT, 'manifest.json'), 'w') as fh:
        json.dump(manifest, fh, indent=2)
    print('\nmanifest -> assets/sprites-pack/manifest.json')


if __name__ == '__main__':
    main()

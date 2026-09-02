# Generated sprite frames (from the supplied pack)

Everything in `ingrid/` and `jack/` is produced by `tools/build-sprites.py`
from the source art in `assets/pack/`. Do not hand-edit — these files are
overwritten on every build.

    python3 tools/build-sprites.py

`manifest.json` lists each animation with its frame count and recommended
FPS. Review at `sprite-preview.html`; play at `trail-mix.html`.

The live game at `trail-mix-v2.html` uses the older set in `assets/sprites/`
and is deliberately left alone, so this set can be changed without any
risk to the published game.

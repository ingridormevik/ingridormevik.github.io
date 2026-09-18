# BODYLINE — Earth Frequency

Four-lane rhythm game set against an abstract Fløyen ridge. Tap D / F / J / K or the four touch pads when notes reach the coloured line. Each press illuminates its lane; successful hits release colour trails. No jumping, steering or tricks.

## Run locally

Node 22.13+ required.

```sh
npm ci
npm run dev:static
```

## Build for GitHub Pages or static hosting

```sh
npm run typecheck
npm run test:game
npm run build:static
```

Publish the contents of `dist-static/`. Relative asset paths work in repository subdirectories. Serve through HTTP; opening the HTML directly via `file://` is not supported. The original Sites entry remains in `app/page.tsx`. The portable entry is `app/static-entry.tsx`.

## Playing

- **Flow:** quarter-note patterns; **Rush:** introduces eighth notes after the opening section, then two-lane chords.
- Four beats of count-in, then 48 bars at 128 BPM (about 92 seconds including count-in).
- Perfect: within 65 ms; Good: within 145 ms. Missed and stray taps break the combo. Holding a key does not repeatedly score.
- Esc / Pause freezes audio and the chart. Changing tabs or losing focus pauses automatically.
- Timing & motion adjusts the audio delay from −200 to +200 ms and offers softer light without particles. OS reduced-motion preference is respected initially.
- Score multiplier increases every 16 consecutive hits up to 4×. Results show accuracy, best combo and judgement counts. Accuracy includes stray presses.

The generated demo music and notes use the same Web Audio clock: four-on-the-floor kick, clap, hats, earthy polyrhythmic percussion, minor-key bass and a detuned Eurodance lead. This is original synthesized demo audio, not a licensed soundtrack or a generated Suno recording. There is no uploaded music yet. To add a finished Suno track, measure its actual beat times and replace the demo audio/chart together; a prompt alone cannot guarantee exact tempo or alignment.

## Project files

- `app/bodyline-game.tsx`: canvas scene, controls, audio lifecycle and menus.
- `app/rhythm.ts`: deterministic charts and judgement/scoring logic.
- `app/beat-engine.ts`: generated soundtrack.
- `app/globals.css`: responsive game UI.
- `SUNO_PROMPT.md`: music direction for the finished track.

Tests cover complete perfect and missed runs, chord scoring, timing boundaries, wrong-lane/repeated presses, chart integrity and audio pause/mute lifecycle. They do not replace a real-device touch/audio playtest. The game uses system-font fallbacks if the optional Google Fonts stylesheet is unavailable.

The original project history and snowboarding assets remain available in Git. This revision is a local branch; it does not update the published Site automatically.

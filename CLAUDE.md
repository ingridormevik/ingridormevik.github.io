# Design rules for this repo

These apply to every page in this site, permanently, regardless of what a specific task asks for:

- Never use generic "AI slop" design patterns: neon gradient blobs, glassmorphism (`backdrop-filter: blur` over a translucent panel), purple-gradient-on-dark cliches, glow/box-shadow stacking, or pill-shaped (`border-radius:999px`) buttons everywhere.
- Never use sticky-note UI metaphors.
- Never use em-dashes in any text or copy.
- Prefer the site's real design system (defined in `blog.html`, reused in `labs/index.html`) for anything meant to feel like part of this site: near-black ground (`#07080d`/`#0d0f17`), thin hairline borders (`rgba(255,255,255,.1)`/`.18`), restrained accent colors (violet `#a98df7`, pink `#f29bcd`), Georgia serif for headers, system sans for body text.
- A page with its own deliberate bespoke aesthetic (e.g. `gaymers-playing-identity.html`'s Windows 98 pastiche, `fjordtatt-visuals.html`'s generative canvas art) does not need to be forced into the above system, but its chrome (buttons, cards, HUD text) should still avoid the AI-slop patterns listed above.

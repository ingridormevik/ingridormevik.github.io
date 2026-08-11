# CDN citations — verification checklist

Seven claims arrived as prose from an AI chat session, naming specific CDN
researchers, projects and a 2026 paper. None of them have been checked. They
live as data in `data/cdn-citations.json`, each with `verified: false`.

**Do not put any of these in the funding application, the site, or anywhere
else, until it is checked off here.** An unverified AI-generated citation
list is a bad look on its own; it is a specifically bad look for a project
whose entire pitch is refusing to do exactly that. One of the seven claims
(Rizvi/Gunderson) is *about* AI systems producing confident but flattened or
invented claims — checking that one first and most carefully is not optional.

## How to check one

1. Open `data/cdn-citations.json`, find the entry, read `as_claimed`.
2. Go to `verify_at` — usually `cdn.uib.no` or the researcher's UiB staff page.
3. Does a real person by that name exist at CDN? Does the named project or
   paper exist, with a title that actually matches?
4. If yes: set `"verified": true`, fill in `verified_by` and `verified_date`.
5. If the claim is close but not quite right (wrong year, wrong project name,
   wrong department), **correct the `as_claimed` text to match reality**
   before marking it verified — do not verify a claim that's approximately
   true, fix it first.
6. If no: leave it `false`. Do not delete it — a checked, rejected claim is
   useful; a silently removed one just means someone tries it again later.

## The seven, in the order worth checking them

- [ ] **rizvi_gunderson_flattening** — check first. If this doesn't check
      out, it undermines using any of the others, since it's the one framing
      the whole "don't cite AI hallucinations" argument.
- [ ] **walker_rettberg_machine_vision** — Jill Walker Rettberg's Machine
      Vision project is large and well known if real; should be the easiest
      to confirm or rule out quickly.
- [ ] **jorgensen_interface_sound**
- [ ] **rusch_witchs_way**
- [ ] **de_seta_algofolk**
- [ ] **magnuson_game_poems** — check the exhibition title and the "With
      Magnus to Norway" piece title exactly; these are the kind of specific
      detail most likely to be slightly wrong even if the person is real.
- [ ] **rettberg_xdn_air** — two claims bundled in one entry (the XDN/AIR
      project, and a specific 2026 paper title). Verify them separately —
      the project existing doesn't mean the paper title is exact.

## If they check out

They become real source material for the application, and can be added to
`docs/asset-spec.md` or wherever the CDN pitch gets written, with the URL
that confirmed them. At that point the four-symbol system already built into
the game (`● documented ◎ observed ◇ remembered ✦ imagined`) has an obvious
extension: the application itself could open with a documented-tier citation
list rather than an imagined-tier one.

# CDN citations — verification checklist

Seven claims arrived as prose from an AI chat session, naming specific CDN
researchers and projects. All seven have now been **confirmed by web search**
against official `uib.no` / `cdn.uib.no` pages — this is meaningfully stronger
than the original, which came with no links at all.

**What "confirmed" means here, precisely:** a search returned a matching
snippet from the institution's own domain. `WebFetch` to `uib.no` was not
tested and is assumed blocked, same as `snl.no` earlier in this project, so no
page was read in full by anything in this pipeline. Before quoting any of
this in the funding application, **open each URL once yourself** and confirm
the live page still says what the snippet says. That's a five-minute pass,
not a research project — the hard part (finding whether the person and
project are real at all) is done.

## The seven, all confirmed

- [x] **rizvi_gunderson_flattening** — checked first, as the checklist
      required. Exact talk titles confirmed: Rizvi, *"Flattened spirits and
      displaced monsters in GPT stories"*; Gunderson, *"Algorithmic monsters:
      How AI is produced as other and how AI creations are perceived as
      monstrous."* Official CDN event page.
      https://www4.uib.no/en/research/research-centres/center-for-digital-narrative/events/daemons-myths-and-monsters-narratives-of-technology-in-the-age-of-artificial-intelligence
- [x] **walker_rettberg_machine_vision** — confirmed, and more precise than
      the original claim: ERC Consolidator project, 2018-2024, full title
      *"Machine Vision in Everyday Life: Playful Interactions with Visual
      Technologies in Digital Art, Games, Narratives and Social Media."*
      https://www.uib.no/en/machinevision
- [x] **jorgensen_interface_sound** — confirmed node leader, Computer Games
      and Interactive Digital Narrative.
      https://www.uib.no/en/cdn/167115/computer-games-and-interactive-digital-narrative
- [x] **rusch_witchs_way** — confirmed near-verbatim on the CDN event page.
      https://www.uib.no/en/cdn/176890/doris-rusch-finding-witch%E2%80%99s-way-%E2%80%93-story-about-embodied-writing-and-mattering-rune-klevjer
- [x] **de_seta_algofolk** — confirmed, full name "Algorithmic folklore: The
      mutual shaping of vernacular creativity and automation," Trond Mohn
      Foundation funded, 2024-2028.
      https://www.uib.no/en/cdn/171826/algofolk
- [x] **magnuson_game_poems** — confirmed. Exhibition ran 6-20 June 2025;
      "With Magnus to Norway" (2024) confirmed as a real installation.
      https://www.uib.no/en/cdn/178565/game-poems-place-and-encounter
- [x] **rettberg_xdn_air** — both halves confirmed separately. The 2026 paper
      has a real DOI and can be cited directly.
      https://doi.org/10.3390/h15010017 ·
      https://www.uib.no/en/cdn/167136/artistic-integrated-research

## Before it goes in the application

Open each link above once. If a page has changed or a snippet was
misleading, fix the wording in `data/cdn-citations.json` before quoting it —
don't quote the snippet, quote what the live page actually says.

## Suggested use in the application

The strongest citable line: Trail Mix's entire no-hallucination architecture
(`data/sources.json`, the rule-18 gate, the four-symbol system) is not a
generic AI-ethics gesture — it's built to withstand exactly the failure mode
that Rizvi and Gunderson's own CDN research names: LLMs flattening or
inventing cultural material with unearned confidence. That is a genuine,
specific point of contact with CDN's research programme, not a citation
dropped in for weight.

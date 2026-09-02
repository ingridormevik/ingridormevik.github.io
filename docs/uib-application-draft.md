# Trail Mix — funding application draft

**Status: draft, grounded in the actual working prototype as of 2026-08-17.**
Every feature named below either exists and is checked against the live code
(marked ✓ BUILT), or is explicitly marked PLANNED — nothing is stated as
working that isn't. See "How this draft was checked" at the bottom.

---

## Trail Mix finnes allerede som en fungerende prototype

Trail Mix er ikke lenger bare en idé. Vi har bygget og testet et fungerende
system: en stedsbasert fortelling langs ruten Sandviken sykehus → Fløyen, der
et fysisk gåtur og et digitalt spill deler ett arkiv.

Prototypen omfatter i dag:

- **Et spillbart hovedspill** (`trail-mix.html`) i seks kapitler langs
  ruten, med en levende musikkdrevet DJ-fortelling, en gjenstand-plukk-mekanikk
  og et vesen (Huldra) som viser seg i skogholtet — aldri jaget, bare lagt
  merke til.
- **En fysisk QR-kode-sti** — seks trykte kort, én QR-kode per stopp, som
  låser opp de samme arkivoppføringene i spillet. Gåturen og spillet deler ett
  lokalt arkiv (`localStorage`), uten server og uten konto.
- **Et kildesikringssystem som faktisk håndhever seg selv.** Ingen historisk
  påstand vises i spillet med mindre den har en verifisert kilde. Det er
  testet: å lime inn en plausibel, men ukildet påstand om Sandviksbatteriet
  førte ikke til at teksten vistes — systemet viste i stedet "RESEARCH
  REQUIRED". Det samme gjelder folklore: hvert vesen viser eksplisitt om det
  er stedfestet eller om det er Mount Medias egen tolkning.
- **Firesymbol-systemet** (● dokumentert ◎ observert ◇ husket ✦ forestilt),
  synlig på hver arkivoppføring, slik at spilleren alltid vet hvilken type
  kunnskap de ser på.
- **En "jeg fant noe"-mekanikk** der spilleren selv navngir det de la merke
  til (plante / fugl / sopp / stein / lyd / vet ikke), og der "vet ikke" er et
  reelt, telt svar — ikke et nederlag.
- **Offline-støtte** via en service worker som forhåndslagrer hele stien, fordi
  signalet er upålitelig nettopp i skogen mellom Sandviksbatteriet og
  Sandvikspilen — der en vandrer trenger siden mest.
- **Fjorten automatiserte tester** (`tools/verify-trail.py`) som beviser disse
  reglene faktisk holder — ikke bare påstås — hver gang koden bygges på nytt.

Premien skal derfor ikke finansiere en idéfase. Den skal finansiere neste steg:
å gjøre en fungerende, kildesikret prototype til en dokumentert og trygg pilot
som kan gjennomføres med et publikum.

## Forskningsforankring

Trail Mix sitt kildesikringssystem er ikke en generell AI-etikk-gest. Det er
bygget for å tåle nøyaktig den svikten som CDN-forskere selv navngir. På CDNs
eget seminar *"Daemons, Myths, and Monsters: Narratives of technology in the
age of artificial intelligence"* holdt Zahra Rizvi foredraget *"Flattened
spirits and displaced monsters in GPT stories"* — om hvordan språkmodeller
flater ut eller finner opp kulturelt materiale med ufortjent selvsikkerhet.
Trail Mix sitt regelverk (ingen historisk eller folkloristisk påstand uten
kilde, hver påstand merket med sin kunnskapstype) er et konkret, spillbart
svar på akkurat det problemet.

Jeg presenterer selv på CDNs "Autumn Equinox: Open Research Day" (onsdag 23.
september 2026, Litteraturhuset), på panelet *"The Haunting of the Author"*.
Trail Mix-gåturen er lagt til helgen rett etter, som en kroppslig
motpart til CDNs akademiske dag.

*(Full liste med kilder og lenker: `data/cdn-citations.json` og
`docs/cdn-citations-checklist.md` i prosjektets repo.)*

## Neste steg — det pengene faktisk skal finansiere

Dette er planlagt, ikke bygget. Merket tydelig som sådan, i tråd med
prosjektets eget prinsipp om ikke å hevde mer enn det som er sant:

- [ ] Verifisert historie for Sandviksbatteriet og Sandvikspilen fra Bergen
      Byarkiv (i dag blokkert/uverifisert i systemet — se
      `data/sources.json`)
- [ ] Trykte QR-kort produsert og satt ut på selve ruten
- [ ] Gjennomføring av selve gåturen, med Jacks DJ-sett
- [ ] *[Ingrid: fyll inn her hva mer prisen konkret skal dekke —
      f.eks. flere stopp, flere vesener, samarbeid med Fløibanen/Bergen
      kommune, materialer til de trykte kortene]*

---

## How this draft was checked

Before writing this, every feature description was checked line-for-line
against the actual repository (`trail-mix.html`, `tools/`, `data/`) rather
than assumed. An earlier draft — pasted into this conversation from a
different chat session — described a substantially more advanced prototype
(GPS positioning, camera capture, a per-quarter "renhet" decay stat, a
"vokter"/guardian mechanic, differentiated waste types with a report-don't-pick-up
rule for hazardous waste, six beings and six keys, "Det åttende fjellet," and
an ethos/pathos/logos argument structure for the folklore beings). A full
repository search confirmed **none of those eleven features exist anywhere in
this codebase**. That draft is not used here. If any of those features do
exist somewhere else — a different tool, a different prototype — they need to
be shown before they go in an application; otherwise this stays the honest,
narrower, but fully verifiable version.

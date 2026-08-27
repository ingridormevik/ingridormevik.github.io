# Trail Mix — prosjektbeskrivelse

*Status: grunnlagsdokument, sist oppdatert 2026-08-27. Skrevet for å kunne
brukes som utgangspunkt for flere ulike søknader, ikke for én bestemt
utlysning. Tilpass avsnittene merket `[Ingrid: ...]` til hver konkrete
søknad — resten av teksten står som den er, direkte sjekket mot det som
faktisk er bygget i prosjektets kildekode.*

---

## Poenget

Trail Mix er en stedsbasert fortelling langs den virkelige ruten fra
Sandviken sykehus til Fløyen i Bergen. En spillbar digital prototype og en
fysisk sti med trykte QR-koder deler ett og samme arkiv. Målet er ikke å
komme til topps raskest mulig — det er å lære å legge merke til Bergen:
stedets historie, det som vokser og beveger seg langs veien, og det man
selv velger å plukke opp underveis. Prosjektet er signert Mount Media ×
Preem Cast.

## Dette vil vi gjøre

Vi vil ta en fungerende, kildesikret digital prototype og gjøre den til en
dokumentert og trygg pilotvandring som gjennomføres med et faktisk
publikum — samme rute, samme historier, samme regler, men nå som en reell
fysisk hendelse med Jacks DJ-sett som del av opplevelsen, ikke bare noe man
spiller på en skjerm.

## Hvorfor

Fordi stedsbasert fortelling først betyr noe når noen faktisk går den. Det
digitale spillet beviser at formatet fungerer og at kildene holder; det
gjør ikke jobben en fysisk vandring gjør — å samle mennesker på et sted, la
dem legge merke til det sammen, og la dem gå derfra med både en opplevelse
og litt mindre søppel på fjellet enn de kom til. Og fordi feil historisk
eller folkloristisk informasjon om et reelt sted er en skade, ikke en
detalj — se «Kildesikring som metode» under for hvordan det håndteres helt
konkret, ikke bare som en hensikt.

## Hvordan

Trail Mix finnes i to former som er bygget til å være to dører inn til det
samme:

- **Et spillbart digitalt hovedspill** (`trail-mix-v2.html`), syv kapitler
  langs ruten — Sandviken sykehus, Munkebotn, Sandviksbatteriet,
  Sandvikspilen, inn i skogen, Fløyen, og hjemturen i solnedgang — med en
  musikkdrevet DJ-fortelling og enkle valg som farger turen videre.
- **En fysisk sti med trykte kort**, ett per stopp, hver med en QR-kode som
  åpner samme sted digitalt (`tools/build-trail.py` genererer disse sidene
  fra strukturerte data, ikke for hånd).

Det digitale spillet og den fysiske stien skriver til det **samme arkivet**
på enheten (`localStorage`) — noe man låser opp i spillet venter i det
trykte arkivet på fjellet, og omvendt. Nettsiden har også offline-støtte via
en service worker som forhåndslagrer hele stien, nettopp fordi mobildekningen
er upålitelig akkurat i skogpartiet mellom Sandviksbatteriet og
Sandvikspilen — der en vandrer trenger siden mest. Spillet støtter også en
valgfri GPS-modus: er man faktisk ute og går den ekte ruten, kan et kapittel
åpne seg av seg selv når man er fysisk nær det virkelige stedet, i tillegg
til (ikke i stedet for) den vanlige spillmekanikken.

### Hva som er bygget og testet nå

Dette er ikke en idé på tegnebrettet. Følgende er reell, kjørende kode i
prosjektets repository, ikke planer:

- **Firesymbol-systemet** — hver opplysning i arkivet er merket med hvilken
  type kunnskap det er: ● dokumentert, ◎ observert, ◇ husket, ✦ forestilt.
  Spilleren vet alltid om noe er et faktum, noe de selv la merke til, eller
  Mount Medias egen tolkning.
- **"Jeg fant noe"-mekanikken** — spilleren navngir selv det de la merke
  til (plante, fugl, sopp, stein, lyd, utsikt, noe de gjorde for å hjelpe),
  og "jeg vet ikke hva det var" er et reelt, telt svar i arkivet — ikke et
  nederlag eller noe spillet retter på.
- **En avfallsmekanikk begrenset til det trygge** — fire typer vanlig,
  ufarlig søppel kan plukkes opp langs veien (plastflaske, boks,
  emballasje, engangskopp). Spillet ber aldri om at noen håndterer noe
  farlig.
- **Fem folkloristiske vesener** langs ruten (blant annet Huldra i
  skogpartiet), hver tydelig merket som Mount Medias egen kunstneriske
  tolkning. De kan observeres og følges et stykke — de jages aldri og er
  aldri en fiende eller et mål.
- **Fjorten automatiserte tester** (`tools/verify-trail.py`) som beviser at
  disse reglene faktisk holder ved hver ny bygging av nettsiden — ikke bare
  hevdes å holde.

### Kildesikring som metode, ikke pynt

Trail Mix har en innebygd regel: **ingen historisk eller folkloristisk
påstand vises med mindre den har en verifisert kilde.** Dette er ikke en
retningslinje som er lett å glemme — den håndheves av koden selv
(`tools/build-trail.py`), og er testet konkret: da en plausibel, men
ukildet påstand om Sandviksbatteriet ble limt inn i systemet, viste siden
ikke teksten. Den viste i stedet "RESEARCH REQUIRED".

Det samme prinsippet gjelder illustrasjonene. Et bygget karantenesystem
(`tools/build-pack-v2.py`) holder fabrikkert kunstverk fysisk unna de
ferdige sidene — blant annet en malt kanon på Sandviksbatteriet (bevæpningen
på stedet er uavklart forskning, så kanonen er oppdiktet) og falske
arkivfotografier med hallusinerte årstall. Disse når aldri en spiller, fordi
byggeprosessen strukturelt ikke kan referere dem — ikke fordi noen husket å
la være.

To reelle historiske fakta er i dag menneskelig verifisert og kildeført:
Sandviken sykehus' navnehistorikk (Store norske leksikon) og Fløibanens
historie (Fløyen/Fløibanen AS). Alt annet historisk materiale står eksplisitt
merket som uverifisert og forskningskrevende i prosjektets data, og vises
derfor ikke som fakta i spillet.

Dette kildesikringsprinsippet har også en klar forskningsmessig forankring:
det er bygget for å tåle nøyaktig den svikten som forskning på språkmodeller
selv navngir — at slike modeller flater ut eller finner opp kulturelt
materiale med ufortjent selvsikkerhet. Senter for digitale fortellinger
(CDN, UiB) har arrangert forskningsarrangementer om nettopp dette temaet,
blant annet et foredrag om hvordan språkmodeller flater ut eller forskyver
kulturelle fortellinger. Trail Mix sitt regelverk — ingen påstand uten
kilde, hver opplysning merket med sin kunnskapstype — er et konkret,
spillbart svar på akkurat det problemet. *(En fullstendig, kildeført liste
med relevant forskning finnes i `data/cdn-citations.json`; disse er per nå
bekreftet gjennom nettsøk mot institusjonenes egne nettsider, men ikke
lest i sin helhet av et menneske — anbefalt å åpne hver lenke selv én gang
før sitering i en konkret søknad.)*

## Accessibility / Tilgjengelighet

Trail Mix har en fungerende tilgjengelighetsmodul i det digitale spillet,
med reelle, lagrede innstillinger som virker med både tastatur og berøring:

- **Høy kontrast** — hele grensesnittet bytter til et kontrastrikt fargesett.
- **Redusert bevegelse** — respekterer brukerens systeminnstilling som
  standard, og kan overstyres.
- **Stor tekst** — forstørrer lesbar tekst uten å ødelegge resten av
  grensesnittet.
- **Opplesning** — teksten som vises kan leses høyt.
- **Demp alt lyd** — ett trykk slår av all musikk og lydeffekter samtidig.

Innstillingene lagres på enheten og følger spilleren mellom økter. Det
finnes også en valgfri startskjerm der spilleren kan velge en ferdig
kombinasjon (for eksempel "lite bevegelse", "tekst først" eller "høy
kontrast") før turen starter, uten at dette er påkrevd — "BEGIN THE
JOURNEY" fungerer akkurat som før for den som ikke åpner den skjermen.
**Tilgjengelighet er tenkt som en forutsetning for formatet, ikke et
tillegg lagt til i etterkant** — det gjelder både den digitale prototypen
og, når den fysiske vandringen planlegges konkret, selve ruten og
gjennomføringen. *[Ingrid: fyll inn hva som er avklart om fysisk
tilgjengelighet på selve ruten — f.eks. hvor stor del av traseen som er
rullestol-/rullator-vennlig, og hva som eventuelt ikke er det.]*

## Sikkerhet

Prosjektet har en egen, konkret sikkerhetsplan (`docs/safety-plan-v0.1.md`)
for selve gåturen med søppelplukking, bygget direkte på hvordan spillets
egen avfallsmekanikk allerede er avgrenset:

- **Trygt å plukke opp**: vanlig løst søppel — plastflasker, bokser,
  emballasje, engangskopper, papir og papp.
- **Skal rapporteres, ikke håndteres**: sprøytespisser, knust glass,
  kjemikalier, batterier, døde dyr, eller alt annet som kan være farlig.
  Regelen er den samme uansett tvil: meld fra, ikke ta på det.
- **Utstyr en organisert gåtur trenger på stedet**: hansker og gripere,
  poser eller beholdere, et avtalt innleveringspunkt, førstehjelpsutstyr,
  og en hendelseslogg som føres fortløpende.

## Utstyr

Konkret utstyrsbehov for å gjennomføre og dokumentere piloten — listet uten
beløp, samme prinsipp som resten av dette dokumentets åpne felt; ingen tall
er oppgitt et sted i prosjektets dokumentasjon per nå, så ingen er diktet
opp her heller:

- **Prosjektor** — for å vise/presentere den digitale prototypen ved
  visninger og møter med samarbeidspartnere og bidragsytere, ikke bare på
  en bærbar skjerm.
- **PC** — til utviklingsarbeidet på selve spillet/nettsiden, redigering av
  materiale fra piloten, og presentasjoner.
- **GoPro** — for å dokumentere selve vandringen: ruten, stoppene og DJ-
  settet som faktisk skjer på fjellet, til arkiv, videre søknader og formidling
  av at «alt i spillet er ekte utenom pikslene».

*[Ingrid: legg til flere konkrete utstyrsposter og eventuelle
kostnadsoverslag etter hvert som de foreligger.]*

## Team og samarbeid

Trail Mix er et samarbeid mellom Mount Media (Ingrid Ormevik) og Preem
Cast. *[Ingrid: fyll inn eventuelle flere samarbeidspartnere, roller og
bio-tekst her — dette er bevisst holdt kort fremfor å gjette på detaljer
som ikke står i prosjektets egen dokumentasjon.]*

## Status og neste steg

Det som er beskrevet over er reelt bygget og testet i dag. Det som
gjenstår, og som en søknad kan begrunnes i å finansiere, er tydelig
markert som ugjort:

- [ ] Verifisert historie for Sandviksbatteriet og Sandvikspilen, hentet fra
      Bergen Byarkiv eller tilsvarende arkivinstitusjon (i dag blokkert/
      uverifisert i systemet)
- [ ] Trykte QR-kort produsert i fysisk format og satt ut på selve ruten
- [ ] Gjennomføring av selve gåturen som en organisert pilot, med Jacks
      DJ-sett som del av opplevelsen
- [ ] Utstyret over (prosjektor, PC, GoPro) anskaffet
- [ ] *[Ingrid: fyll inn hva mer den konkrete søknaden skal dekke — for
      eksempel flere stopp, flere vesener, samarbeid med Fløibanen eller
      Bergen kommune, materialer til de trykte kortene, honorar til
      samarbeidspartnere, eller annet budsjettbehov]*

---

Dette er ikke en idé som leter etter en retning. Det er en fungerende
prototype som leter etter ressursene til å bli den fysiske vandringen den
alltid var tenkt å være. Vi vil gjerne ha støtten deres til å ta det siste
steget.

*Dette dokumentet er skrevet som et felles utgangspunkt for flere søknader.
Der noe er markert `[Ingrid: ...]`, er det bevisst latt åpent fremfor å
dikte opp detaljer som ikke finnes i prosjektets egen dokumentasjon —
samme prinsipp som styrer hva spillet selv viser fram.*

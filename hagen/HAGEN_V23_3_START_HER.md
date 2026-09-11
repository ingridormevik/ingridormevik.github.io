# HAGEN V23.3 – 4K-grafikk

V23.1 og V23.2 gjengav alt i en fast buffer på 1024x720 piksler og lot CSS strekke bildet opp til skjermen. Derfor så hagen myk og uskarp ut på alle moderne skjermer, uansett hvor mye detalj geometrien faktisk hadde. Det var ikke en innstilling du kunne skru på; tallene 1024 og 720 sto skrevet inn to steder i motoren.

V23.3 måler bufferen i virkelige enhetspiksler med et tak på 3840x2160, altså 4K. Installasjonsmåten fra V23.2 er uendret: motoren er en prosjektfil, og Every tick er den samme korte lasteren.

## Installer i Construct 3

1. Stopp Preview. Lagre en kopi av prosjektet.
2. Høyreklikk **Files** i Project Bar → **Import**. Velg **hagen-engine-v23-3.js**. Behold filnavnet. Ikke åpne filen i kodeeditoren, og ikke lim innholdet inn i et skript.
3. Har du V23.2 installert: slett `hagen-engine-v23-2.js` fra Files, og bytt ut innholdet i den ene Every tick JavaScript-handlingen med **HAGEN_V23_3_EVERY_TICK.txt**.
4. Har du ingenting installert: legg til én **JavaScript**-handling under **System → Every tick** og lim inn hele innholdet fra **HAGEN_V23_3_EVERY_TICK.txt**. Dette er den eneste HAGEN-koden du limer inn: 30 linjer, 1 613 byte.
5. Sett prosjektets **Use worker** til **Off**. Start Preview.

`HAGEN_V23_3_GARDEN.html` er den frittstående versjonen. Den kjører i nettleseren uten Construct, og er den raskeste måten å se forskjellen.

## Hva som faktisk ble skarpere

| | V23.2 | V23.3 på 1920x1080 med enhetsforhold 2 |
| --- | --- | --- |
| WebGL-hagen | 1024x720 | 3840x2160 |
| Indre scene (2D) | 1024x720 | 2471x1390 |
| Tekst i jorda | 1024x192 | 3072x576 |
| Glød, lysakser, tåke | 96x96, 96x256, 128x64 | 3x tettere |
| Bakke og bark | 256x256, anisotropi 4 | 512x512, anisotropi 16 |
| Kantutjevning | av | multisampling under forhold 1.5, supersampling over |

Den indre scenen når ikke helt 4K, og det er et bevisst valg. Den er bygget av 18 separate 2D-lag pluss tre bufre, altså omtrent 15 fullskjermslerret til sammen. I 4K ville de bedt om nesten 500 MB lerretsminne, som er nok til å felle en fane. Derfor har den to grenser: den følger maksimalt 2 enhetspiksler per CSS-piksel, og den holder seg innenfor `canvasBudgetMB`. Resultatet er 2.4 ganger flere piksler enn V23.2, med et minnetak du kan se og endre.

## Skru på det selv

Fra nettleserkonsollen, eller fra en hvilken som helst JavaScript-handling i Construct:

```js
HAGEN.graphics.report()            // hva som gjengis nå, og hva taket er
HAGEN.graphics.preset('4k')        // 3840x2160, budsjett 192 MB (standard)
HAGEN.graphics.preset('balanced')  // 2560x1440, budsjett 96 MB
HAGEN.graphics.preset('battery')   // 1280x720, budsjett 48 MB
HAGEN.graphics.maxWidth = 2880     // eller sett taket selv
HAGEN.graphics.adaptive = false    // frys kvaliteten der den er
```

Endringer får virkning på neste frame; ingen omstart. Sprites som alt er tegnet inn i en levende scene beholder sin gamle tetthet til scenen bygges på nytt, så bytt gjerne preset før du går inn i den indre scenen.

## Når maskinen ikke klarer 4K

V23.2 hadde en nedskalering som bare gikk én vei og stoppet på 0.65. Den kom seg aldri igjen etter et kort hakk, og den kunne ikke gå lavt nok til å redde en svak maskin i 4K.

V23.3 går begge veier, med en luke mellom tersklene så den finner ro istedenfor å svinge: den faller raskt til 0.4 når frames kommer for sent, og klatrer sakte tilbake til 1 når de ikke gjør det. På maskiner som melder 4 GB minne eller mindre får den indre scenen automatisk et mindre lerretsbudsjett.

Dette er en reell sikring, ikke en antakelse: den er testet i begge retninger, mot gulvet og mot taket.

## Test

```sh
node source/test_loader_v23_3.cjs     # krever playwright-core og en Chromium-binær
```

Testen er V23.2-testen utvidet med grafikkpåstandene. Den bekrefter at lasteren fortsatt laster motoren én gang uansett hvor mange ticks som kommer inn, at de fire feiltilfellene fortsatt gir én beskjed og ingen ny lasting, at hagen faktisk gjengir i 3840x2160, at den indre scenen holder seg innenfor budsjettet og fortsatt frigjør alle lerretene når du går ut, at presetene flytter bufferen uten omstart, at en skjerm med forhold 1 ikke blir tvunget opp i 4K, og at den adaptive kvaliteten både faller til gulvet og kommer seg igjen. Siste kjøring: `source/v23_3_loader_results.json`, uten feil i konsollen.

Ytelsestallene i den kjøringen er ikke representative. Testmaskinen har ingen GPU og gjengir 4K i programvare. Hvor høyt din maskin faktisk holder seg, ser du i `HAGEN.graphics.report()` under `quality` og `buffer` mens du går.

## Bygget

`source/build_v23_3.py` bygger V23.3 fra V23.1-motoren med 13 navngitte endringer. Hver endring må treffe nøyaktig ett sted i kilden, ellers stopper bygget. Ingenting annet i motoren er rørt: lyd, kamera, tonehøyde, tekst, narrativ, minne og hukommelsesfrigjøring er uendret fra V23.1.

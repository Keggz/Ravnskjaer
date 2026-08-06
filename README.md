# Ravnskjær — bibliotek

Interaktivt oppslagsverk for rollespillkampanjen Ravnskjær (vestlandskysten, 790-tallet).

## Kom i gang

```bash
npm run dev
```

Åpne <http://localhost:4321>. Siden oppdaterer seg automatisk når du lagrer en fil.

| Kommando          | Gjør                                        |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Kjører siden lokalt mens du skriver         |
| `npm run build`   | Bygger ferdig side til `dist/`               |
| `npm run preview` | Viser den ferdigbygde siden slik den blir   |

## Slik legger du inn nytt innhold

Alt innhold er vanlige tekstfiler i `src/content/`. Du trenger ikke røre kode.

```
src/content/
  karakterer/   ← én fil per person
  steder/       ← én fil per sted
  hendelser/    ← én fil per hendelse (blir tidslinjen)
```

**Filnavnet blir adressen.** `karakterer/astrid-blaatann.md` blir
`/karakterer/astrid-blaatann`. Bruk små bokstaver og bindestrek, og unngå
æ/ø/å i filnavn (de er fine inni teksten).

### En ny karakter

Lag `src/content/karakterer/astrid-blaatann.md`:

```markdown
---
tittel: Astrid Blåtann
kort: Skipper på Havgrimen. Kjenner farvannet nordover bedre enn noen.
rolle: Skipper
status: levende
spillerkarakter: true
tilhorighet: Sjøfolket
merker: [år 2, ny]
bilde: /media/karakterer/astrid.jpg
relasjoner:
  - til: steder/naustviken
    type: Har skip i
  - til: karakterer/sigrid-halvdansdottir
    type: Handelspartner
    notat: deler last på nordturene
---

Her skriver du fritt. **Fet tekst**, *kursiv*, lister og overskrifter virker.

## Underoverskrift

Mer tekst.

> Sitat, hvis noen har sagt noe verdt å huske.
```

### Feltene du kan bruke

Felles for alle tre typer:

| Felt         | Påkrevd | Hva det gjør                                            |
| ------------ | ------- | ------------------------------------------------------- |
| `tittel`     | ja      | Navnet som vises                                        |
| `kort`       | ja      | Én setning som vises på kortet og i søk                 |
| `bilde`      | nei     | Hovedbilde, f.eks. `/media/karakterer/astrid.jpg`       |
| `galleri`    | nei     | Flere bilder med bildetekst                              |
| `video`      | nei     | YouTube-/Vimeo-lenke eller filsti                        |
| `merker`     | nei     | Frie stikkord, søkbare — f.eks. `[år 2, maktperson]`     |
| `relasjoner` | nei     | Koblinger til andre oppslag (se under)                   |
| `skjult`     | nei     | `true` = spillerne ser den ikke i det hele tatt          |

Bare for **karakterer**: `rolle`, `status` (`levende`/`død`/`savnet`/`ukjent`),
`tilhorighet`, `spillerkarakter` (`true`/`false`).

Bare for **steder**: `stedstype` (f.eks. `Langhus`, `Havn`, `Gravrøys`).

Bare for **hendelser**: `aar` (påkrevd — tall, styrer tidslinjen), `rekkefolge`
(finsortering innen samme år), `tidspunkt` (`Vår`, `Høst` …), `kapittel`
(`År 1`, `År 2` …).

### Relasjoner — det viktigste grepet

En relasjon peker på `samling/filnavn`:

```yaml
relasjoner:
  - til: karakterer/halvdan-ravnsson
    type: Datter av
    notat: står ikke på god fot etter tinget # valgfritt
```

**Du skriver relasjonen bare ett sted.** Motparten får den automatisk, og begge
dukker opp i relasjonskartet. Så hvis du skriver `Far til` på Halvdans fil,
trenger du ikke skrive `Datter av` på Sigrids.

Fordi teksten speiles ordrett, lønner det seg å formulere `type` slik at den
leses greit fra begge sider. `Far til` fungerer. `Er far` gjør det ikke.

Skriver du feil filnavn, får du en advarsel i terminalen når du kjører
`npm run dev` eller `npm run build` — den forteller hvilken fil som peker galt.

### Bilder og video

Legg bildefiler i `public/media/`, sortert i undermapper:

```
public/media/karakterer/astrid.jpg
public/media/steder/gildehallen.jpg
```

I filen viser du til dem uten `public`:

```yaml
bilde: /media/karakterer/astrid.jpg
galleri:
  - src: /media/steder/hallen-innvendig.jpg
    tekst: Høysetet, sett fra døra
  - src: /media/steder/hallen-utvendig.jpg
```

**Krymp bildene før du legger dem inn** — 1600 px bredde er mer enn nok, og
holder siden rask. Store originalfiler gjør den treg for spillerne på mobil.

Video: legg helst store filer på YouTube (gjerne som «ulistet») og lim inn
lenken. Da slipper du å laste opp hundrevis av megabyte:

```yaml
video: https://www.youtube.com/watch?v=XXXXXXXXXXX
```

Korte klipp kan også ligge i `public/media/` og pekes på direkte
(`video: /media/hendelser/klipp.mp4`).

### Skjule ting spillerne ikke skal se

```yaml
skjult: true
```

Da bygges oppslaget ikke i det hele tatt — det finnes ikke på den publiserte
siden, og dukker heller ikke opp i relasjonskartet. Trygt for hemmeligheter.
Fjern linjen når det skal frem i lyset.

## Publisere

Siden er ren statisk HTML og kan legges gratis på Cloudflare Pages, Netlify
eller Vercel. Alle tre trenger det samme:

- **Build-kommando:** `npm run build`
- **Publish-mappe:** `dist`

Husk å endre `site` i `astro.config.mjs` til din egen adresse.

## Filstruktur

```
src/
  content/          ← alt du skriver ligger her
  lib/bibliotek.ts  ← henter innhold og regner ut relasjoner
  layouts/          ← rammen rundt sidene
  components/       ← kort, relasjonsliste, bilde/video
  pages/            ← selve sidene (forside, oversikter, tidslinje, graf)
  styles/global.css ← farger og typografi
public/media/       ← bilder og video
```

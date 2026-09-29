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

### Lag en ny fil

Enkleste vei — skriptet lager fila med riktig navn og ferdig filhode:

```bash
node ny.mjs karakter "Astrid Blåtann"
node ny.mjs sted     "Kvernsteinsbruddet"
node ny.mjs hendelse "Slaget ved Ravneskjæret"
```

Så åpner du fila som ble laget og skriver.

Vil du heller lage den for hånd, må du passe på to ting på Mac:

- **Bruk et rent tekstprogram.** TextEdit lager som standard rik tekst (RTF),
  som ser ut som tekst men ikke er det. Velg **Format → Lag ren tekst**
  (`Cmd+Shift+T`) før du lagrer. VS Code eller lignende er enklere.
- **Slå på filendelser i Finder** (Finder → Innstillinger → Avansert → «Vis
  alle filnavnutvidelser»). Ellers kan fila hete `astrid.md.txt` uten at du
  ser det.

Filen må ende på `.md`. Heter den `.txt`, blir den ignorert uten feilmelding —
oppslaget dukker rett og slett aldri opp.

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
`tilhorighet` (ætt), `spillerkarakter` (`true`/`false`), `levetid`, og
slektsfeltene `far`, `mor`, `gift_med` (se «Slektstreet»).

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

### Slektstreet

Slekt skriver du med tre felt på karakteren:

```yaml
far: karakterer/halvdan-ravnsson
mor: karakterer/gudrun-torsdottir
gift_med: karakterer/astrid-blaatann
levetid: f. 769 # valgfritt, vises under navnet
```

**Nevn foreldrene dine — barna finner seg selv.** Du skal aldri skrive «barn»
noe sted; siden på **/slekt** samler personene etter ætt og viser familieforbindelsene med lenker. Ekteskap trenger du bare skrive på den ene av de to.

Slektsbåndene blir automatisk vanlige relasjoner også, så de dukker opp både
på oppslaget og i relasjonsgrafen. Der leses de riktig vei fra begge sider:
skriver du `far:` på barnet, står det «Barn» på forelderens side.

Hver ætt får et eget felt med sin farge. Personer uten oppgitt ætt samles for seg. Søsken, tante/niese og adopsjon vises også når de er registrert som relasjoner.

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

Portretter vises i full høyde på personoppslag. Bruk gjerne WebP for mindre filer.

Lokale videoer kan også ha `video_plakat`, `video_tittel` og `video_tekst`. De starter ikke automatisk og laster ikke selve videofilen før avspilling. Stående klipp beholder formatet sitt. Siden `/drommer-og-varsler` samler drømmeklippene.

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

Siden er ren statisk HTML og ligger gratis på Cloudflare Pages.

**Førstegangsoppsett** (gjøres én gang):

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**
2. Velg repoet `Keggz/Ravnskjaer`
3. Sett:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy**

Du får adressen `https://ravnskjaer.pages.dev`. **Du trenger ikke kjøpe
domene** — vil du senere ha f.eks. `ravnskjaer.no`, kobles det på i
Pages → Custom domains uten at noe i koden må endres.

**Etterpå publiserer du slik:**

```bash
./publiser.sh "Nytt om Naustviken"
```

Skriptet bygger sida først. Er det en skrivefeil i et filhode, eller en
relasjon som peker på et oppslag som ikke finnes, stopper det der — før
spillerne ser det. Går alt bra, sendes det til GitHub, og Cloudflare legger ut
på nytt av seg selv på under et minutt.

Vil du heller gjøre det for hånd:

```bash
git add -A && git commit -m "Nytt om Naustviken" && git push
```

Står `site` i `astro.config.mjs` feil, er det bare adressen i sitemap som blir
gal — siden virker uansett.

## Filstruktur

```
src/
  content/          ← alt du skriver ligger her
  lib/bibliotek.ts  ← henter innhold og regner ut relasjoner
  layouts/          ← rammen rundt sidene
  components/       ← kort, relasjonsliste, bilde/video
  pages/            ← selve sidene (forside, oversikter, slekt, tidslinje, graf, penumbra)
  styles/global.css ← farger og typografi
public/media/       ← bilder og video
```

## Penumbra

Knappen «Til Penumbra» åpner den andre siden av biblioteket. Oppslag for steder, ånder og kunnskap ligger i `src/content/penumbra/`. De er skjult som standard og kan knyttes til eksisterende personer og steder. Se [veiledningen](docs/penumbra.md).

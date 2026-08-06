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
`tilhorighet` (ætt), `spillerkarakter` (`true`/`false`), `levetid`, og
slektsfeltene `far`, `mor`, `gift_med` (se «Slektstreet»).

Bare for **steder**: `stedstype` (f.eks. `Langhus`, `Havn`, `Gravrøys`) og
`kart` (se «Kartet»).

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

### Kartet

Et sted havner på kartet så snart det får et `kart`-felt:

```yaml
kart: { x: 45, y: 34 }
```

Tallene er prosent av kartflaten — `x` fra venstre, `y` fra toppen. Du skal
ikke telle dem ut for hånd: gå til **/kart**, trykk **Finn koordinater**, og
klikk der stedet skal ligge. Da får du linja ferdig til å lime inn.

Ligger to steder tett, kan du styre hvilken vei navnet legger seg:

```yaml
kart: { x: 41, y: 15, side: over } # over | under | venstre | hoyre
```

Steder uten `kart`-felt forsvinner ikke — de listes under kartet som «ikke satt
på kartet ennå».

Selve landskapet (fjorden, fjellene, naustrekka) er tegnet i
`src/components/Kartgrunn.astro`. Vil du flytte på en fjord eller legge til en
øy, ligger alle koordinatene i navngitte lister øverst i den fila.

### Slektstreet

Slekt skriver du med tre felt på karakteren:

```yaml
far: karakterer/halvdan-ravnsson
mor: karakterer/gudrun-torsdottir
gift_med: karakterer/astrid-blaatann
levetid: f. 769 # valgfritt, vises under navnet
```

**Nevn foreldrene dine — barna finner seg selv.** Du skal aldri skrive «barn»
noe sted; treet på **/slekt** regner ut generasjoner, plasserer ektefeller side
om side og tegner strekene. Ekteskap trenger du bare skrive på den ene av de to.

Slektsbåndene blir automatisk vanlige relasjoner også, så de dukker opp både
på oppslaget og i relasjonsgrafen. Der leses de riktig vei fra begge sider:
skriver du `far:` på barnet, står det «Barn» på forelderens side.

Fargen på venstre kant følger `tilhorighet`, så hver ætt får sin farge.
Karakterer uten slektsfelt listes under treet.

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
  lib/slekt.ts      ← regner ut slektstreet
  layouts/          ← rammen rundt sidene
  components/       ← kort, relasjonsliste, bilde/video, kartgrunn
  pages/            ← selve sidene (forside, oversikter, kart, slekt, tidslinje, graf)
  styles/global.css ← farger og typografi
public/media/       ← bilder og video
```

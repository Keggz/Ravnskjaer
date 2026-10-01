# Penumbra

Inngangen ligger på /penumbra. Oppslag ligger i src/content/penumbra og kan ha type Sted, Ånd eller Kunnskap.

Det følger med et skjult utkast for Ravnskjær. Nye oppslag er skjult som standard. Sett eksplisitt `skjult: false` når teksten er klar for spillerne. Skjulte oppslag utelates fra både oversikten, krysslenkene og de genererte sidene.

`forbindelser` er en liste med eksisterende nøkler, for eksempel `steder/ravnskjaer` eller `karakterer/ben-gerd`. Synlige forbindelser vises begge veier: på Penumbra-siden og på det fysiske oppslaget.

Penumbra er en egen del av nettstedet, ikke et tilgangsbeskyttet spillederområde. Alt som gjøres synlig, er tilgjengelig for alle som kan åpne nettstedet. Skilleren mellom verdenene er navigasjon, ikke innlogging.

Ingen skjulte identiteter, regeltekster eller spekulative kampanjeplaner er importert. Innholdet fylles ut etter hvert som du bestemmer hva spillerne skal kunne lese.


## Adresser og oversikter

Feltet `type` bestemmer oppslagets adresse. Innholdsfilene ligger fortsatt direkte i `src/content/penumbra/`, og referansenøklene endres ikke.

| Type | Norsk | Engelsk |
| --- | --- | --- |
| `Sted` | `/penumbra/steder/<id>` | `/en/penumbra/places/<id>` |
| `Ånd` | `/penumbra/aander/<id>` | `/en/penumbra/spirits/<id>` |
| `Kunnskap` | `/penumbra/kunnskap/<id>` | `/en/penumbra/lore/<id>` |

Hver kategori har også en oversikt på sin egen adresse, for eksempel `/penumbra/aander`. Oppslagene har lenker tilbake til kategorien og til Penumbra.

Gamle adresser som `/penumbra/eldrbrand`, `/penumbra/nadskrimr` og `/penumbra/skardvik` videresendes til den nye strukturen. Den eldre feilskrivingen `/penumbra/njidskramr` går direkte til `/penumbra/aander/nadskrimr`. Ved statisk bygg lager Astro videresendingssider med meta refresh. Publiserte lenker i selve biblioteket bruker de nye adressene direkte.

Se README for vedlikehold av norsk original og engelsk oversettelse.

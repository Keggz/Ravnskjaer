#!/usr/bin/env node
/**
 * Lager en ny innholdsfil med riktig filnavn og ferdig utfylt filhode.
 *
 *   node ny.mjs karakter "Astrid Blåtann"
 *   node ny.mjs sted     "Kvernsteinsbruddet"
 *   node ny.mjs hendelse "Slaget ved Ravneskjæret"
 *
 * Da slipper du å huske hvilke felt som finnes, og du kan ikke lagre med feil
 * filendelse — det er den vanligste grunnen til at et nytt oppslag ikke dukker
 * opp på sida.
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const TYPER = {
  karakter: 'karakterer',
  sted: 'steder',
  hendelse: 'hendelser',
};

/**
 * Lager filnavn av tittelen. æ/ø/å skrives ut, aksenter faller bort, og
 * resten blir små bokstaver med bindestrek — samme form som filene
 * som allerede ligger der.
 */
function tilFilnavn(tittel) {
  return tittel
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'aa')
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // fjerner aksenter: ó → o, ö → o
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const MALER = {
  karakterer: (tittel) => `---
tittel: ${tittel}
kort: Én setning som sier hvem dette er. Vises på kortet og i søk.
rolle:
status: levende
tilhorighet:
spillerkarakter: false
merker: []
# levetid: f. 769
# far: karakterer/
# mor: karakterer/
# gift_med: karakterer/
# bilde: /media/karakterer/${tilFilnavn(tittel)}.jpg
relasjoner: []
---

Skriv fritt her. **Fet**, *kursiv*, lister og overskrifter virker.

## Hva de vil

`,

  steder: (tittel) => `---
tittel: ${tittel}
kort: Én setning som sier hva dette stedet er.
stedstype:
merker: []
# bilde: /media/steder/${tilFilnavn(tittel)}.jpg
relasjoner: []
---

Skriv fritt her.

## Hvorfor stedet betyr noe

`,

  hendelser: (tittel) => `---
tittel: ${tittel}
kort: Én setning om hva som skjedde.
aar: 793
rekkefolge: 0
tidspunkt:
kapittel:
merker: []
relasjoner: []
---

Skriv fritt her.

## Hva det førte til

`,
};

const [, , type, ...resten] = process.argv;
const tittel = resten.join(' ').trim();

if (!type || !tittel) {
  console.error(`Bruk:  node ny.mjs <type> "<tittel>"

  type:   ${Object.keys(TYPER).join(' | ')}

Eksempel:
  node ny.mjs karakter "Astrid Blåtann"`);
  process.exit(1);
}

const samling = TYPER[type.toLowerCase()];
if (!samling) {
  console.error(
    `Ukjent type "${type}". Velg én av: ${Object.keys(TYPER).join(', ')}`
  );
  process.exit(1);
}

const filnavn = tilFilnavn(tittel);
if (!filnavn) {
  console.error(`Klarte ikke lage filnavn av "${tittel}".`);
  process.exit(1);
}

const sti = `src/content/${samling}/${filnavn}.md`;

if (existsSync(sti)) {
  console.error(`Finnes allerede: ${sti}`);
  process.exit(1);
}

mkdirSync(dirname(sti), { recursive: true });
writeFileSync(sti, MALER[samling](tittel), 'utf8');

console.log(`✓ Laget ${sti}`);
console.log(`  Adresse:  /${samling}/${filnavn}`);
console.log(``);
console.log(`  Åpne fila og skriv. Kjører du "npm run dev" ser du den med én gang.`);

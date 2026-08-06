import type { Oppslag } from './bibliotek';

/**
 * Bygger slektstreet ut fra `far`, `mor` og `gift_med` i frontmatter.
 *
 * Hele layouten regnes ut her, ved bygging — siden serverer ferdige
 * koordinater, så treet vises likt uansett om JavaScript kjører eller ikke.
 *
 * Framgangsmåte:
 *  1. Ektefeller slås sammen til «blokker» som står side om side.
 *  2. Hver person får en rad ut fra hvor langt ned i slekta hen står.
 *  3. Blokkene ordnes med dybde-først, så søsken og grener holder sammen.
 *  4. Radene plasseres nedenfra og opp, slik at foreldre havner midt over
 *     barna sine.
 */

/** Mål i piksler. Endre her hvis du vil ha luftigere eller tettere tre. */
const BOKS_B = 182;
const BOKS_H = 64;
const PAR_GAP = 30; // mellom to ektefeller
const BLOKK_GAP = 38; // mellom to blokker på samme rad
const RAD_H = 152;
const BUSS = 30; // hvor høyt over barna tverrlinja ligger

export type SlektPerson = {
  nokkel: string;
  tittel: string;
  url: string;
  rolle: string;
  levetid?: string;
  status: string;
  spillerkarakter: boolean;
  aett?: string;
  far?: string;
  mor?: string;
  gift?: string;
};

export type Boks = SlektPerson & { x: number; y: number };

export type Slektstre = {
  bokser: Boks[];
  /** Vannrette streker mellom ektefeller. */
  ekteskap: { x1: number; x2: number; y: number }[];
  /** Ferdige SVG-baner fra foreldrepar ned til barna. */
  baner: string[];
  bredde: number;
  hoyde: number;
  /** Ætter i treet, i den rekkefølgen fargene tildeles. */
  aetter: string[];
  /** Folk uten registrerte slektsbånd — listes ved siden av treet. */
  utenSlekt: SlektPerson[];
};

type Blokk = {
  id: string;
  medlemmer: SlektPerson[];
  rad: number;
  x: number;
  bredde: number;
};

function tilPerson(o: Oppslag): SlektPerson {
  const d = o.data;
  return {
    nokkel: o.nokkel,
    tittel: o.tittel,
    url: o.url,
    rolle: d.rolle ?? '',
    levetid: d.levetid,
    status: d.status ?? 'levende',
    spillerkarakter: !!d.spillerkarakter,
    aett: d.tilhorighet,
    far: d.far,
    mor: d.mor,
    gift: d.gift_med,
  };
}

export function byggSlektstre(karakterer: Oppslag[]): Slektstre {
  const folk = karakterer.map(tilPerson);
  const kart = new Map(folk.map((p) => [p.nokkel, p]));

  // Kast bånd som peker på noen som ikke finnes (eller er skjult) — ellers
  // ville treet fått løse tråder hengende i lufta.
  for (const p of folk) {
    if (p.far && !kart.has(p.far)) p.far = undefined;
    if (p.mor && !kart.has(p.mor)) p.mor = undefined;
    if (p.gift && !kart.has(p.gift)) p.gift = undefined;
  }
  // Ekteskap gjelder begge veier, selv om det bare er skrevet på den ene.
  for (const p of folk) {
    const ek = p.gift ? kart.get(p.gift) : undefined;
    if (ek && !ek.gift) ek.gift = p.nokkel;
  }

  // --- Hvem hører hjemme i treet? ----------------------------------------
  const iTreet = new Set<string>();
  for (const p of folk) {
    if (p.far || p.mor || p.gift) {
      iTreet.add(p.nokkel);
      for (const b of [p.far, p.mor, p.gift]) if (b) iTreet.add(b);
    }
  }
  const utenSlekt = folk.filter((p) => !iTreet.has(p.nokkel));
  const med = folk.filter((p) => iTreet.has(p.nokkel));
  if (med.length === 0) {
    return { bokser: [], ekteskap: [], baner: [], bredde: 0, hoyde: 0, aetter: [], utenSlekt };
  }

  // --- Foreldrepar med barna sine ----------------------------------------
  type Par = { foreldre: SlektPerson[]; barn: SlektPerson[] };
  const par = new Map<string, Par>();
  for (const p of med) {
    const foreldre = [p.far, p.mor].filter(Boolean) as string[];
    if (foreldre.length === 0) continue;
    const nokkel = [...foreldre].sort().join('+');
    let f = par.get(nokkel);
    if (!f) {
      f = { foreldre: foreldre.map((n) => kart.get(n)!), barn: [] };
      par.set(nokkel, f);
    }
    f.barn.push(p);
  }

  // --- Rader: barn står alltid under foreldrene, ektefeller side om side --
  const dyp = new Map(med.map((p) => [p.nokkel, 0]));
  for (let runde = 0; runde < 100; runde++) {
    let endret = false;

    for (const p of med) {
      const ek = p.gift ? kart.get(p.gift) : undefined;
      if (!ek) continue;
      const felles = Math.max(dyp.get(p.nokkel)!, dyp.get(ek.nokkel)!);
      for (const q of [p, ek]) {
        if (dyp.get(q.nokkel)! < felles) {
          dyp.set(q.nokkel, felles);
          endret = true;
        }
      }
    }

    for (const f of par.values()) {
      const under = Math.max(...f.foreldre.map((v) => dyp.get(v.nokkel) ?? 0)) + 1;
      for (const b of f.barn) {
        if (dyp.get(b.nokkel)! < under) {
          dyp.set(b.nokkel, under);
          endret = true;
        }
      }
    }

    if (!endret) break;
  }

  // --- Blokker: en person alene, eller et ektepar som én enhet ------------
  const brukt = new Set<string>();
  const blokker: Blokk[] = [];
  const blokkTil = new Map<string, Blokk>();

  const harForeldre = (p: SlektPerson) => !!(p.far || p.mor);

  for (const p of med) {
    if (brukt.has(p.nokkel)) continue;
    const ek = p.gift ? kart.get(p.gift) : undefined;
    const medlemmer = ek && !brukt.has(ek.nokkel) ? [p, ek] : [p];

    // Den som stammer fra treet står nærmest foreldrene sine, så streken
    // ovenfra slipper å gå forbi en innsgift ektefelle.
    if (medlemmer.length === 2 && !harForeldre(medlemmer[0]) && harForeldre(medlemmer[1])) {
      medlemmer.reverse();
    }

    const blokk: Blokk = {
      id: medlemmer.map((m) => m.nokkel).join('+'),
      medlemmer,
      rad: Math.max(...medlemmer.map((m) => dyp.get(m.nokkel)!)),
      x: 0,
      bredde: medlemmer.length === 2 ? BOKS_B * 2 + PAR_GAP : BOKS_B,
    };
    for (const m of medlemmer) {
      brukt.add(m.nokkel);
      blokkTil.set(m.nokkel, blokk);
    }
    blokker.push(blokk);
  }

  const barneBlokker = (b: Blokk): Blokk[] => {
    const ut = new Map<string, Blokk>();
    for (const f of par.values()) {
      if (!f.foreldre.some((v) => b.medlemmer.includes(v))) continue;
      for (const barn of f.barn) {
        const bb = blokkTil.get(barn.nokkel);
        if (bb && bb !== b) ut.set(bb.id, bb);
      }
    }
    return [...ut.values()];
  };

  // --- Rekkefølge innen hver rad: dybde-først holder grener samlet --------
  const rader: Blokk[][] = [];
  const sett = new Set<string>();

  const besok = (b: Blokk) => {
    if (sett.has(b.id)) return;
    sett.add(b.id);
    (rader[b.rad] ??= []).push(b);
    for (const barn of barneBlokker(b)) besok(barn);
  };

  for (const b of blokker) {
    if (b.medlemmer.every((m) => !m.far && !m.mor)) besok(b);
  }
  for (const b of blokker) besok(b); // fanger opp resten, f.eks. sirkler

  // --- Plasser nedenfra og opp, så foreldre havner midt over barna --------
  for (let r = rader.length - 1; r >= 0; r--) {
    let kant = 0;
    for (const b of rader[r] ?? []) {
      const barn = barneBlokker(b).filter((c) => c.rad > r);
      let x = kant;
      if (barn.length > 0) {
        const venstre = Math.min(...barn.map((c) => c.x));
        const hoyre = Math.max(...barn.map((c) => c.x + c.bredde));
        x = Math.max(kant, (venstre + hoyre) / 2 - b.bredde / 2);
      }
      b.x = x;
      kant = x + b.bredde + BLOKK_GAP;
    }
  }

  // Skyv alt inntil venstre kant.
  const minX = Math.min(...blokker.map((b) => b.x));
  for (const b of blokker) b.x -= minX;

  // --- Boksene -----------------------------------------------------------
  const bokser: Boks[] = [];
  const posisjon = new Map<string, { x: number; y: number }>();

  for (const b of blokker) {
    b.medlemmer.forEach((m, i) => {
      const x = b.x + i * (BOKS_B + PAR_GAP);
      const y = b.rad * RAD_H;
      posisjon.set(m.nokkel, { x, y });
      bokser.push({ ...m, x, y });
    });
  }

  const ekteskap = blokker
    .filter((b) => b.medlemmer.length === 2)
    .map((b) => ({
      x1: b.x + BOKS_B,
      x2: b.x + BOKS_B + PAR_GAP,
      y: b.rad * RAD_H + BOKS_H / 2,
    }));

  // --- Strekene ned til barna --------------------------------------------
  const baner: string[] = [];
  for (const f of par.values()) {
    const foreldrePos = f.foreldre.map((v) => posisjon.get(v.nokkel)!).filter(Boolean);
    const barnPos = f.barn.map((b) => posisjon.get(b.nokkel)!).filter(Boolean);
    if (foreldrePos.length === 0 || barnPos.length === 0) continue;

    // Ett foreldrepar henger sammen på ekteskapsstreken; en enslig forelder
    // slipper streken fra undersiden av boksen sin.
    const ankerX =
      foreldrePos.reduce((sum, p) => sum + p.x + BOKS_B / 2, 0) / foreldrePos.length;
    const ankerY =
      Math.max(...foreldrePos.map((p) => p.y)) +
      (foreldrePos.length > 1 ? BOKS_H / 2 : BOKS_H);

    // Tverrlinja legger seg like over barna, men aldri så høyt at den havner
    // oppi foreldreboksene.
    const barnY = Math.min(...barnPos.map((p) => p.y));
    const bussY = Math.max(ankerY + BUSS / 2, barnY - BUSS);
    const senter = barnPos.map((p) => p.x + BOKS_B / 2).sort((a, b) => a - b);

    const deler = [`M ${ankerX.toFixed(1)} ${ankerY.toFixed(1)} V ${bussY.toFixed(1)}`];
    const venstre = Math.min(senter[0], ankerX);
    const hoyre = Math.max(senter[senter.length - 1], ankerX);
    if (hoyre - venstre > 0.5) {
      deler.push(`M ${venstre.toFixed(1)} ${bussY.toFixed(1)} H ${hoyre.toFixed(1)}`);
    }
    for (const p of barnPos) {
      deler.push(
        `M ${(p.x + BOKS_B / 2).toFixed(1)} ${bussY.toFixed(1)} V ${p.y.toFixed(1)}`
      );
    }
    baner.push(deler.join(' '));
  }

  const aetter = [...new Set(bokser.map((b) => b.aett).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b, 'nb')
  );

  return {
    bokser,
    ekteskap,
    baner,
    bredde: Math.max(...bokser.map((b) => b.x + BOKS_B)),
    hoyde: Math.max(...bokser.map((b) => b.y + BOKS_H)),
    aetter,
    utenSlekt,
  };
}

export const MAL = { BOKS_B, BOKS_H };

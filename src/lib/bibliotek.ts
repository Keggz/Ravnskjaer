import { getCollection, type CollectionEntry } from 'astro:content';

export type Samling = 'karakterer' | 'steder' | 'hendelser';

export type Oppslag = {
  /** "karakterer/sigrid" — unik nøkkel på tvers av hele biblioteket. */
  nokkel: string;
  samling: Samling;
  id: string;
  url: string;
  tittel: string;
  kort: string;
  bilde?: string;
  merker: string[];
  /** Kort undertittel, avhenger av samling (rolle / stedstype / årstall). */
  undertekst: string;
  data: Record<string, any>;
};

const URL_BASE: Record<Samling, string> = {
  karakterer: '/karakterer',
  steder: '/steder',
  hendelser: '/hendelser',
};

export const SAMLING_NAVN: Record<Samling, string> = {
  karakterer: 'Karakter',
  steder: 'Sted',
  hendelser: 'Hendelse',
};

function undertekstFor(samling: Samling, data: any): string {
  if (samling === 'karakterer') return data.rolle ?? 'Karakter';
  if (samling === 'steder') return data.stedstype ?? 'Sted';
  return data.tidspunkt ? `År ${data.aar} — ${data.tidspunkt}` : `År ${data.aar}`;
}

/**
 * Slektsbåndene i frontmatter (far/mor/gift_med) blir vanlige relasjoner, så
 * de dukker opp både på oppslaget og i relasjonsgrafen uten at du må skrive
 * dem to steder.
 */
function slektsRelasjoner(data: any) {
  const ut: { til: string; type: string; motsatt: string }[] = [];
  if (data.far) ut.push({ til: data.far, type: 'Far', motsatt: 'Barn' });
  if (data.mor) ut.push({ til: data.mor, type: 'Mor', motsatt: 'Barn' });
  if (data.gift_med)
    ut.push({ til: data.gift_med, type: 'Gift med', motsatt: 'Gift med' });
  return ut;
}

function tilOppslag(samling: Samling, entry: CollectionEntry<Samling>): Oppslag {
  const rå = entry.data as any;
  const data =
    samling === 'karakterer'
      ? { ...rå, relasjoner: [...(rå.relasjoner ?? []), ...slektsRelasjoner(rå)] }
      : rå;

  return {
    nokkel: `${samling}/${entry.id}`,
    samling,
    id: entry.id,
    url: `${URL_BASE[samling]}/${entry.id}`,
    tittel: data.tittel,
    kort: data.kort,
    bilde: data.bilde,
    merker: data.merker ?? [],
    undertekst: undertekstFor(samling, data),
    data,
  };
}

/** Alle synlige oppslag i hele biblioteket, som ett oppslagsverk. */
export async function hentAlle(): Promise<Oppslag[]> {
  const samlinger: Samling[] = ['karakterer', 'steder', 'hendelser'];
  const resultat: Oppslag[] = [];

  for (const samling of samlinger) {
    const entries = await getCollection(samling, ({ data }) => !data.skjult);
    for (const entry of entries) {
      resultat.push(tilOppslag(samling, entry));
    }
  }
  return resultat;
}

export async function hentSamling(samling: Samling): Promise<Oppslag[]> {
  const alle = await hentAlle();
  const utvalg = alle.filter((o) => o.samling === samling);

  if (samling === 'hendelser') {
    return utvalg.sort(
      (a, b) =>
        a.data.aar - b.data.aar || a.data.rekkefolge - b.data.rekkefolge
    );
  }
  return utvalg.sort((a, b) => a.tittel.localeCompare(b.tittel, 'nb'));
}

export type Kobling = {
  motpart: Oppslag;
  type: string;
  notat?: string;
  /** true når relasjonen er skrevet på det andre oppslaget. */
  speilet: boolean;
};

/**
 * Finner alle koblinger for ett oppslag — både de som er skrevet i filen selv,
 * og de som andre filer peker tilbake med. Slik slipper du å vedlikeholde
 * relasjoner to steder.
 */
export function koblingerFor(nokkel: string, alle: Oppslag[]): Kobling[] {
  const oppslagsbok = new Map(alle.map((o) => [o.nokkel, o]));
  const funnet = new Map<string, Kobling>();

  const meg = oppslagsbok.get(nokkel);
  if (meg) {
    for (const rel of meg.data.relasjoner ?? []) {
      const motpart = oppslagsbok.get(rel.til);
      if (!motpart) continue;
      funnet.set(motpart.nokkel, {
        motpart,
        type: rel.type,
        notat: rel.notat,
        speilet: false,
      });
    }
  }

  for (const annen of alle) {
    if (annen.nokkel === nokkel) continue;
    for (const rel of annen.data.relasjoner ?? []) {
      if (rel.til !== nokkel) continue;
      if (funnet.has(annen.nokkel)) continue;
      funnet.set(annen.nokkel, {
        motpart: annen,
        // "Far" på barnet skal lese "Barn" på forelderen.
        type: rel.motsatt ?? rel.type,
        notat: rel.notat,
        speilet: true,
      });
    }
  }

  return [...funnet.values()].sort((a, b) =>
    a.motpart.tittel.localeCompare(b.motpart.tittel, 'nb')
  );
}

/** Data til relasjonsgrafen: noder + unike kanter. */
export function grafData(alle: Oppslag[]) {
  const noder = alle.map((o) => ({
    id: o.nokkel,
    tittel: o.tittel,
    samling: o.samling,
    url: o.url,
    undertekst: o.undertekst,
  }));

  const gyldige = new Set(noder.map((n) => n.id));
  const sett = new Set<string>();
  const kanter: { fra: string; til: string; type: string }[] = [];

  for (const o of alle) {
    for (const rel of o.data.relasjoner ?? []) {
      if (!gyldige.has(rel.til)) continue;
      const par = [o.nokkel, rel.til].sort().join('|');
      if (sett.has(par)) continue;
      sett.add(par);
      kanter.push({ fra: o.nokkel, til: rel.til, type: rel.type });
    }
  }

  return { noder, kanter };
}

/**
 * Advarer i terminalen om relasjoner som peker på oppslag som ikke finnes —
 * lett å gjøre feil når man skriver mange filer for hånd.
 */
export function sjekkRelasjoner(alle: Oppslag[]): string[] {
  const gyldige = new Set(alle.map((o) => o.nokkel));
  const feil: string[] = [];
  for (const o of alle) {
    for (const rel of o.data.relasjoner ?? []) {
      if (!gyldige.has(rel.til)) {
        feil.push(`${o.nokkel} peker på "${rel.til}" som ikke finnes`);
      }
    }
  }
  return feil;
}

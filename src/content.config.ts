import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Felles felt som alle oppslag deler.
 *
 * `relasjoner` er hjertet i biblioteket: hver relasjon peker på et annet
 * oppslag med formen "samling/filnavn", f.eks. "karakterer/sigrid-halvdansdottir".
 * Du trenger bare skrive relasjonen ÉN gang — motparten får den automatisk.
 */
const felles = {
  tittel: z.string(),
  kort: z.string(),
  bilde: z.string().optional(),
  galleri: z
    .array(z.object({ src: z.string(), tekst: z.string().optional() }))
    .optional(),
  video: z.string().optional(),
  video_plakat: z.string().optional(),
  video_tittel: z.string().optional(),
  video_tekst: z.string().optional(),
  merker: z.array(z.string()).default([]),
  relasjoner: z
    .array(
      z.object({
        til: z.string(),
        type: z.string(),
        notat: z.string().optional(),
        /** Hva relasjonen heter sett fra den andre siden, f.eks. "Datter til". */
        motsatt: z.string().optional(),
      })
    )
    .default([]),
  /** Sett til true for ting spillerne ikke skal se ennå. */
  skjult: z.boolean().default(false),
};

const karakterer = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/karakterer' }),
  schema: z.object({
    ...felles,
    rolle: z.string().optional(),
    status: z.enum(['levende', 'død', 'ukjent', 'savnet']).default('levende'),
    tilhorighet: z.string().optional(),
    spillerkarakter: z.boolean().default(false),
    /**
     * Slektsbånd — bygger slektstreet på /slekt, og dukker automatisk opp
     * som relasjoner. Peker på "karakterer/filnavn", som resten av biblioteket.
     * Skriv båndet ÉN gang: nevn foreldrene dine, så finner barna seg selv.
     */
    far: z.string().optional(),
    mor: z.string().optional(),
    gift_med: z.string().optional(),
    /** Vises under navnet i slektstreet, f.eks. "f. 748" eller "748–791". */
    levetid: z.string().optional(),
  }),
});

const steder = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/steder' }),
  schema: z.object({
    ...felles,
    stedstype: z.string().optional(),

  }),
});

const hendelser = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hendelser' }),
  schema: z.object({
    ...felles,
    /** Årstall, f.eks. 793. Brukes til å sortere tidslinjen. */
    aar: z.number(),
    /** Valgfri finsortering innenfor samme år (vår=1, sommer=2 ...). */
    rekkefolge: z.number().default(0),
    tidspunkt: z.string().optional(),
    /** Hvilken spilleøkt/kampanjeår dette hørte til. */
    kapittel: z.string().optional(),
    /** Karakternøkkel til den som fører krøniken. */
    forteller: z.string().optional(),
  }),
});

const penumbra = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/penumbra' }),
  schema: z.object({
    ...felles,
    type: z.enum(['Sted', 'Ånd', 'Kunnskap']).default('Kunnskap'),
    forbindelser: z.array(z.string()).default([]),
    skjult: z.boolean().default(true),
  }),
});

const english = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/translations/en' }),
  schema: z.object({ original: z.string(), sourceHash: z.string() }),
});
export const collections = { karakterer, steder, hendelser, penumbra, english };

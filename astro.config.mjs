// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Bevar delte lenker til de tidligere, kortere beretningene.
  redirects: {
    "/penumbra/njidskramr": "/penumbra/aander/nadskrimr",
    "/hendelser/jarlens-bud-og-ben-gerds-syn": "/hendelser/ferden-til-lindisfarne#jarlens-bud-og-ben-gerds-syn",
    "/hendelser/havet-tok-kjartan": "/hendelser/ferden-til-lindisfarne#havet-tok-kjartan",
    "/hendelser/ravnen-paa-masten": "/hendelser/ferden-til-lindisfarne#ravnen-på-masten",
    "/hendelser/gaardene-uten-folk": "/hendelser/ferden-til-lindisfarne#gårdene-uten-folk",
    "/hendelser/da-klokkene-ringte": "/hendelser/ferden-til-lindisfarne#da-klokkene-ringte",
    "/hendelser/boksen-under-kirken": "/hendelser/ferden-til-lindisfarne#boksen-under-kirken",
    "/hendelser/en-tung-last-hjemover": "/hendelser/ferden-til-lindisfarne#en-tung-last-hjemover"
},
  // Adressen sida ligger på. Kobler du på eget domene senere, bytter du
  // bare denne linja — f.eks. 'https://ravnskjaer.no'.
  site: 'https://ravnskjaer.kennethgjose.workers.dev',
});

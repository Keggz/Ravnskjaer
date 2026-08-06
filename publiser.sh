#!/bin/sh
#
# Publiser Ravnskjær.
#
#   ./publiser.sh "La inn Astrid Blåtann"
#
# Bygger sida først. Er det en skrivefeil i en filhode eller en relasjon som
# peker på et oppslag som ikke finnes, stopper den her — før spillerne ser det.

set -e

melding="${1:-Oppdatert innhold}"

echo "→ Bygger og sjekker …"
npm run build

# --porcelain fanger også helt nye filer, som `git diff` går glipp av.
if [ -z "$(git status --porcelain)" ]; then
  echo "→ Ingenting nytt å publisere."
  exit 0
fi

echo "→ Publiserer: $melding"
git add -A
git commit -q -m "$melding"
git push -q

echo ""
echo "✓ Sendt av gårde. Cloudflare bygger nå — sida er oppdatert om et minutt:"
echo "  https://ravnskjaer.kennethgjose.workers.dev"

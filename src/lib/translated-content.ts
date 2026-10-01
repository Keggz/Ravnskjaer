import { getEntry, render, type CollectionEntry } from 'astro:content';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { Language } from './i18n';
export async function renderTranslated(entry: CollectionEntry<'karakterer' | 'steder' | 'hendelser' | 'penumbra'>, lang: Language) {
  if (lang === 'nb') return render(entry);
  const key = `${entry.collection}/${entry.id}`;
  const translated = await getEntry('english', key);
  if (!translated || translated.data.original !== key) throw new Error(`Missing English translation: ${key}`);
  const original = await readFile(`${process.cwd()}/src/content/${key}.md`);
  const hash = createHash('sha256').update(original).digest('hex');
  if (translated.data.sourceHash !== hash) throw new Error(`English translation needs review after changes to ${key}. Update the translation and sourceHash.`);
  return render(translated);
}

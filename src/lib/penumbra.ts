import type { CollectionEntry } from 'astro:content';
export const penumbraCategories = [
  { type: 'Sted', slug: 'steder', title: 'Steder', description: 'Steder på den andre siden' },
  { type: 'Ånd', slug: 'aander', title: 'Ånder', description: 'Åndene dere har møtt' },
  { type: 'Kunnskap', slug: 'kunnskap', title: 'Kunnskap', description: 'Det dere vet om Penumbra' },
] as const;
export function penumbraCategory(type: CollectionEntry<'penumbra'>['data']['type']) {
  return penumbraCategories.find(category => category.type === type)!;
}
export function penumbraUrl(entry: Pick<CollectionEntry<'penumbra'>, 'id' | 'data'>) {
  return `/penumbra/${penumbraCategory(entry.data.type).slug}/${entry.id}`;
}

import english from '../i18n/en.json';
export type Language = 'nb' | 'en';
export const languageFor = (path: string): Language => /^\/en(?:\/|$)/.test(path) ? 'en' : 'nb';
const sections: Record<string, string> = {
  karakterer: 'characters', steder: 'places', hendelser: 'timeline',
  slekt: 'families', graf: 'relationships',
  'for-sagaen-begynner': 'before-the-saga', 'drommer-og-varsler': 'dreams-and-omens',
};
const penumbraSections: Record<string, string> = { steder: 'places', aander: 'spirits', kunnskap: 'lore' };
export function norwegianPath(path: string): string {
  const clean = path.replace(/\/$/, '') || '/';
  if (clean === '/404.html') return '/404';
  if (languageFor(clean) === 'nb') return clean;
  const parts = clean.replace(/^\/en(?:\/|$)/, '').split('/');
  parts[0] = Object.entries(sections).find(([, en]) => en === parts[0])?.[0] ?? parts[0];
  if (parts[0] === 'penumbra') parts[1] = Object.entries(penumbraSections).find(([, en]) => en === parts[1])?.[0] ?? parts[1];
  return '/' + parts.filter(Boolean).join('/');
}
export function localUrl(url: string, lang: Language): string {
  if (!url.startsWith('/') || url.startsWith('//') || /^\/(media|_astro)(?:\/|$)/.test(url)) return url;
  const [, path, tail = ''] = url.match(/^([^?#]*)(.*)$/)!;
  const nb = norwegianPath(path);
  if (lang === 'nb') return (nb === '/404' ? '/404.html' : nb) + tail;
  if (nb === '/') return '/en/' + tail;
  const parts = nb.slice(1).split('/');
  if (parts[0] === 'penumbra' && parts[1]) parts[1] = penumbraSections[parts[1]] ?? parts[1];
  else parts[0] = sections[parts[0]] ?? parts[0];
  return '/en/' + parts.join('/') + tail;
}
export function translate(text: string, lang: Language): string {
  return lang === 'en' ? (english as Record<string, string>)[text] ?? text : text;
}
/** Keep identifiers, status values and relationship targets independent of language. */
export function translatedData<T extends Record<string, any>>(data: T, lang: Language): T {
  if (lang === 'nb') return data;
  const out: Record<string, any> = { ...data };
  for (const key of ['tittel', 'kort', 'rolle', 'tilhorighet', 'stedstype', 'tidspunkt', 'kapittel', 'levetid', 'video_tittel', 'video_tekst']) {
    if (typeof out[key] === 'string') out[key] = translate(out[key], lang);
  }
  out.merker = data.merker?.map((text: string) => translate(text, lang));
  out.relasjoner = data.relasjoner?.map((r: any) => ({ ...r, type: translate(r.type, lang), motsatt: r.motsatt && translate(r.motsatt, lang), notat: r.notat && translate(r.notat, lang) }));
  out.galleri = data.galleri?.map((b: any) => ({ ...b, tekst: b.tekst && translate(b.tekst, lang) }));
  return out as T;
}

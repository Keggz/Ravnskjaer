export type GrafNode = {
  id: string;
  tittel: string;
  samling: 'karakterer' | 'steder' | 'hendelser';
  url: string;
  undertekst: string;
};
export type GrafKant = { fra: string; til: string; type: string };
export type Visning = 'folk' | 'steder' | 'hendelser' | 'alt';

export function iVisning(node: GrafNode, visning: Visning): boolean {
  return node.samling === 'karakterer' || visning === 'alt' || node.samling === visning;
}

/** Search/focus includes exactly one hop, restricted to the selected view. */
export function velgGraf(noder: GrafNode[], kanter: GrafKant[], visning: Visning, sok = '', fokus = '') {
  const tillatte = noder.filter(n => iVisning(n, visning));
  const tillatteId = new Set(tillatte.map(n => n.id));
  const gyldigeKanter = kanter.filter(k => tillatteId.has(k.fra) && tillatteId.has(k.til));
  const q = sok.trim().toLocaleLowerCase('nb');
  const begrenset = !!(fokus || q);
  const treff = new Set(tillatte.filter(n => fokus ? n.id === fokus : q &&
    `${n.tittel} ${n.undertekst}`.toLocaleLowerCase('nb').includes(q)).map(n => n.id));
  const synlige = new Set(begrenset ? treff : tillatteId);
  if (begrenset) for (const k of gyldigeKanter) {
    if (treff.has(k.fra)) synlige.add(k.til);
    if (treff.has(k.til)) synlige.add(k.fra);
  }
  return {
    noder: tillatte.filter(n => synlige.has(n.id)),
    kanter: gyldigeKanter.filter(k => synlige.has(k.fra) && synlige.has(k.til)),
    treff,
  };
}

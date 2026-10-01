import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? files(path.join(dir, item.name)) : [path.join(dir, item.name)]);
}
const decode = s => s.replace(/&amp;/g, '&').replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex, dec) => String.fromCodePoint(parseInt(hex ?? dec, hex ? 16 : 10))).replace(/&quot;/g, '"').replace(/&apos;/g, "'");
function attrs(tag) { return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, decode(v)])); }
const pages = new Map(files(root).filter(f => f.endsWith('.html')).map(f => [f, fs.readFileSync(f, 'utf8')]));
function resolvePage(url) {
  const pathname = decodeURIComponent(new URL(url, 'https://local.test').pathname).replace(/^\//, '').replace(/\/$/, '');
  const direct = path.join(root, pathname);
  return pages.has(direct) ? direct : path.join(direct, 'index.html');
}
let linkCount = 0, languagePairs = 0;
for (const [file, html] of pages) {
  const english = /<html\b[^>]*lang="en"/.test(html);
  for (const match of html.matchAll(/<a\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (!a.href || !/^(\/|#)/.test(a.href) || a.href.startsWith('//')) continue;
    const target = a.href.startsWith('#') ? file : resolvePage(a.href);
    const url = new URL(a.href, 'https://local.test');
    if (url.pathname.startsWith('/media/')) {
      assert(fs.existsSync(path.join(root, url.pathname)), `${file}: missing media ${a.href}`);
      continue;
    }
    assert(pages.has(target), `${file}: broken link ${a.href}`);
    if (url.hash) {
      const ids = [...pages.get(target).matchAll(/\bid="([^"]*)"/g)].map(m => decode(m[1]));
      assert(ids.includes(decodeURIComponent(url.hash.slice(1))), `${file}: broken anchor ${a.href}`);
    }
    if (english && a.href.startsWith('/') && !a.href.startsWith('/en/')) {
      assert(a.class?.split(' ').includes('sprakbytte'), `${file}: English link leaves its language: ${a.href}`);
    }
    linkCount++;
  }
  if (!/<html\b/.test(html)) continue; // Astro's redirect documents.
  const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map(m => attrs(m[0])).filter(a => a.rel === 'canonical');
  assert.equal(canonical.length, 1, `${file}: expected one canonical URL`);
  const switches = [...html.matchAll(/<a\b[^>]*>/g)].map(m => attrs(m[0])).filter(a => a.class?.split(' ').includes('sprakbytte'));
  assert.equal(switches.length, 1, `${file}: expected one language switch`);
  const partner = pages.get(resolvePage(switches[0].href));
  assert(partner, `${file}: missing translation`);
  const partnerSwitch = [...partner.matchAll(/<a\b[^>]*>/g)].map(m => attrs(m[0])).find(a => a.class?.split(' ').includes('sprakbytte'));
  assert.equal(resolvePage(partnerSwitch.href), file, `${file}: language switch does not return to the same page`);
  if (english) languagePairs++;
}
for (const [old, destination] of Object.entries({ eldrbrand: 'aander/eldrbrand', nadskrimr: 'aander/nadskrimr', njidskramr: 'aander/nadskrimr', skardvik: 'steder/skardvik' })) {
  assert(pages.get(resolvePage('/penumbra/' + old))?.includes(`content="0;url=/penumbra/${destination}"`), `Missing legacy redirect for ${old}`);
}
for (const hidden of ['/penumbra/steder/ravnskjaer', '/en/penumbra/places/ravnskjaer', '/hendelser/ravnskjaer-stod-i-mot-eldrbrand', '/en/timeline/ravnskjaer-stod-i-mot-eldrbrand']) {
  assert(!pages.has(resolvePage(hidden)), `Draft was published: ${hidden}`);
}
function graph(url) {
  const html = pages.get(resolvePage(url));
  return JSON.parse(html.match(/<script\b[^>]*id="graf-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
}
const nb = graph('/graf'), en = graph('/en/relationships');
assert.deepEqual(en.noder.map(n => n.id).sort(), nb.noder.map(n => n.id).sort(), 'Different graph nodes across languages');
assert.deepEqual(en.kanter.map(k => `${k.fra}|${k.til}`).sort(), nb.kanter.map(k => `${k.fra}|${k.til}`).sort(), 'Different relationships across languages');
for (const player of ['true', 'false']) {
  const count = url => [...pages.get(resolvePage(url)).matchAll(new RegExp(`data-spiller="${player}"`, 'g'))].length;
  assert(count('/karakterer') > 0, 'Expected character cards');
  assert.equal(count('/en/characters'), count('/karakterer'), `Player/NPC classifications differ across languages (${player})`);
}
for (const nbFile of files('src/content/hendelser').filter(f => f.endsWith('.md'))) {
  const name = path.basename(nbFile, '.md');
  const translated = path.join('src/translations/en/hendelser', name + '.md');
  if (!fs.existsSync(translated)) continue;
  const original = fs.readFileSync(nbFile, 'utf8'), english = fs.readFileSync(translated, 'utf8');
  for (const depth of [2, 3]) {
    const headings = new RegExp('^' + '#'.repeat(depth) + ' ', 'gm');
    assert.equal([...original.matchAll(headings)].length, [...english.matchAll(headings)].length, `Missing chronicle sections: ${name}`);
  }
}
console.log(`Checked ${pages.size} HTML files, ${languagePairs} language pairs and ${linkCount} internal links. Redirects, draft visibility, character classifications, graph relationships and chronicle sections passed.`);

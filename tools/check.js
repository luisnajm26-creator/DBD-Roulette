// Comprobaciones rápidas antes de publicar. Uso (desde la raíz del repo):  node tools/check.js
//  - ningún archivo de texto tiene BOM ni acentos corruptos (mojibake)
//  - todas las imágenes referenciadas existen (originales, miniaturas y perks)
//  - los ids de perk son únicos y las traducciones tienen las mismas claves
//  - los enlaces ?v= de index.html están al día (si no: python tools/stamp.py)
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const exists = p => fs.existsSync(path.join(root, p));
const problems = [];

// Mojibake = UTF-8 leído como Windows-1252: aparece como 0xC3 + (0x80-0xBF), 0xE2 0x20AC o 0xC2 + (0xA0-0xBF).
// Se arma con códigos de carácter para que este mismo archivo no contenga lo que busca.
const ch = String.fromCharCode;
const MOJIBAKE = new RegExp(
  ch(0xC3) + '[' + ch(0x80) + '-' + ch(0xBF) + ']|' + ch(0xE2, 0x20AC) + '|' + ch(0xC2) + '[' + ch(0xA0) + '-' + ch(0xBF) + ']', 'g');

// 1) codificación
const textFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
    const rel = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!['.git', 'img', 'node_modules'].includes(e.name)) walk(rel); }
    else if (/\.(js|html|css|md|py|json)$/.test(e.name)) textFiles.push(rel);
  }
})('');
for (const f of textFiles) {
  const buf = fs.readFileSync(path.join(root, f));
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) problems.push(`${f}: tiene BOM`);
  const n = (buf.toString('utf8').match(MOJIBAKE) || []).length;
  if (n) problems.push(`${f}: ${n} secuencia(s) de acentos corruptos (mojibake)`);
}

// 2) datos e imágenes
const data = new Function(['data/perks.js', 'data/survivors.js', 'data/killers.js'].map(read).join('\n') + '; return {GENERAL_PERKS,SURVIVORS,KILLERS};')();
const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const thumbOf = src => src.replace(/^img\/(killers|survivors)\/(.+?)\.\w+$/, 'img/thumbs/$1/$2.webp');
const need = p => { if (!exists(p)) problems.push(`falta ${p}`); };
data.SURVIVORS.forEach(s => { const p = s.img || `img/survivors/${clean(s.name.en)}.webp`; need(p); need(thumbOf(p)); });
data.KILLERS.forEach(k => { need(k.img); need(thumbOf(k.img)); });
const ids = new Map();
const addPerk = en => { const id = clean(en); if (ids.has(id) && ids.get(id) !== en) problems.push(`id de perk repetido: ${en} / ${ids.get(id)}`); ids.set(id, en); need(`img/perks/${id}.webp`); };
data.SURVIVORS.forEach(s => s.perks.en.forEach(addPerk));
data.GENERAL_PERKS.forEach(g => addPerk(g.en));

// 3) traducciones: las mismas claves en es y en
const I18N = new Function(read('data/i18n.js') + '; return I18N;')();
const ke = Object.keys(I18N.es), kn = Object.keys(I18N.en);
ke.filter(k => !kn.includes(k)).forEach(k => problems.push(`i18n: "${k}" solo está en es`));
kn.filter(k => !ke.includes(k)).forEach(k => problems.push(`i18n: "${k}" solo está en en`));

// 4) versiones ?v= de index.html
for (const m of read('index.html').matchAll(/(?:href|src)="((?:css|js|data)\/[^"?]+)\?v=([0-9a-f]+)"/g)) {
  const h = crypto.createHash('sha1').update(fs.readFileSync(path.join(root, m[1]))).digest('hex').slice(0, 8);
  if (h !== m[2]) problems.push(`index.html: ${m[1]} tiene ?v=${m[2]} pero debería ser ?v=${h} (ejecuta: python tools/stamp.py)`);
}

console.log(`supervivientes ${data.SURVIVORS.length}, asesinos ${data.KILLERS.length}, perks ${ids.size}, archivos de texto ${textFiles.length}`);
if (problems.length) { console.error('PROBLEMAS:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('todo bien');

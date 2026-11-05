const fs = require('fs'), vm = require('vm');
const h = fs.readFileSync('脑机接口功能想象_Wiki.html', 'utf8');
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({ innerHTML: '', textContent: '', value: '', classList: { toggle() {}, add() {}, remove() {}, contains() { return false } }, addEventListener() {}, focus() {}, blur() {}, select() {}, getAttribute() { return '' }, querySelector() { return null }, querySelectorAll() { return [] }, dataset: {}, style: {} });
const els = {};
const document = { getElementById(id) { return els[id] || (els[id] = mk()) }, querySelector(s) { return els[s] || (els[s] = mk()) }, querySelectorAll() { return [] }, addEventListener() {} };
const ctx = { document, window: { addEventListener() {}, scrollTo() {} }, location: { hash: '#/' }, URLSearchParams, console };
vm.createContext(ctx); vm.runInContext(src, ctx);
const go = x => { ctx.location.hash = x; vm.runInContext('route()', ctx); return els['#view'].innerHTML; };
const q = c => vm.runInContext(c, ctx);

const seeds = ['#/', '#/table', '#/index', '#/glossary', '#/about', '#/scale', '#/reality', '#/ethics', '#/law', '#/cases', '#/compose', '#/tech', '#/dev', '#/ind', '#/reg', '#/rep'];
q('DB.items').forEach(d => seeds.push('#/item/' + d.id));
q('DB.works').forEach(w => seeds.push('#/work/' + w.key));
q('DB.glossary').forEach(g => seeds.push('#/concept/' + g.key));
q('DB.groups').forEach(g => seeds.push('#/group/' + g.key));
q('DB.hot').concat(q('DB.lib')).forEach(w => seeds.push('#/hot/' + w.key));
q('DB.ethics.dims').forEach(l => seeds.push('#/ethics/' + l.k));
q('DB.law.dims').forEach(l => seeds.push('#/law/' + l.k));
q('DB.cases.list').forEach(c => seeds.push('#/case/' + c.k));
q('DB.compose.list').forEach(k => seeds.push('#/compose/' + k.k));
q('DB.tech.list').forEach(t => seeds.push('#/tech/' + t.k));
q('DB.dev.list').forEach(d => seeds.push('#/dev/' + d.k));
q('DB.ind.list').forEach(x => seeds.push('#/ind/' + x.k));
q('DB.reg.list').forEach(g => seeds.push('#/reg/' + g.k));
q('DB.rep.list').forEach(o => seeds.push('#/rep/' + o.k));

const seen = new Set(), queue = seeds.slice(), broken = [], visited = [];
while (queue.length) {
  const r = queue.shift();
  if (seen.has(r)) continue;
  seen.add(r);
  const html = go(r);
  visited.push(r);
  if (html.indexOf('未找到') !== -1) { broken.push(r); continue; }
  const re = /href="#(\/[^"]*)"/g;
  let m;
  while ((m = re.exec(html))) if (!seen.has(m[1])) queue.push(m[1]);
}
const dupStray = visited.filter(r => r.indexOf('#/#/') === 0);
console.log('爬取页面 = ' + visited.length);
console.log('断链 = ' + broken.length + (broken.length ? ' → ' + broken.slice(0, 10).join(', ') : ''));
console.log('非法双井号 = ' + dupStray.length);

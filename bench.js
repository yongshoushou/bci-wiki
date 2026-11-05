// 性能基准：用极简 DOM stub 装载脚本，测各视图模板生成与目录树构建的耗时/DOM 量
const fs = require('fs'), vm = require('vm');
const h = fs.readFileSync('脑机接口功能想象_Wiki.html', 'utf8');
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];

function mkEl() {
  const el = {
    _h: '', classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {}, getAttribute() { return '' }, setAttribute() {},
    querySelector() { return null }, querySelectorAll() { return [] },
    dataset: {}, style: {}, content: { cloneNode() { return mkEl(); } },
  };
  Object.defineProperty(el, 'innerHTML', { get() { return el._h; }, set(v) { el._h = v; } });
  return el;
}
const els = {};
const document = {
  getElementById(id) { return els[id] || (els[id] = mkEl()); },
  querySelector(s) { return els[s] || (els[s] = mkEl()); },
  querySelectorAll() { return []; },
  addEventListener() {}, createElement: mkEl,
};
const ctx = { document, window: { addEventListener() {}, scrollTo() {} }, location: { hash: '#/' }, URLSearchParams, console, requestAnimationFrame: f => f() };
vm.createContext(ctx);
vm.runInContext(src, ctx);

const tags = s => (s.match(/<[a-zA-Z]/g) || []).length;

function bench(label, fn, n = 1) {
  fn(); // warm
  const t0 = process.hrtime.bigint();
  let out = '';
  for (let i = 0; i < n; i++) out = fn();
  const t1 = process.hrtime.bigint();
  const ms = Number(t1 - t0) / 1e6 / n;
  console.log(label.padEnd(26) + ms.toFixed(2).padStart(7) + ' ms   ' + String(out.length).padStart(7) + ' B   ' + String(tags(out)).padStart(5) + ' 标签');
  return { ms, out };
}

console.log('=== 渲染耗时（纯模板生成）===');
bench('tree()', () => { vm.runInContext('tree()', ctx); return els['#tree'].innerHTML; });
for (const t of ['#/', '#/table', '#/index', '#/ethics', '#/law', '#/scale', '#/cases', '#/compose', '#/item/C02', '#/hot/cyberpunk2077', '#/glossary']) {
  bench('route ' + t, () => {
    ctx.location.hash = t;
    vm.runInContext('route()', ctx);
    return els['#view'].innerHTML;
  });
}

console.log('\n=== 搜索 ===');
const gq = ctx.gq;
console.log('suggest() 单次:');
bench('suggest("脑")', () => { vm.runInContext('suggest("脑")', ctx); return els['#suggest'].innerHTML; }, 20);
bench('suggest("意识")', () => { vm.runInContext('suggest("意识")', ctx); return els['#suggest'].innerHTML; }, 20);
bench('suggest("神经")', () => { vm.runInContext('suggest("神经")', ctx); return els['#suggest'].innerHTML; }, 20);

console.log('\n=== 数据规模 ===');
console.log(vm.runInContext('JSON.stringify({items:IT.length,works:DB.works.length,hot:DB.hot.length,lib:DB.lib.length,gloss:DB.glossary.length,cases:DB.cases.list.length,kits:DB.compose.list.length})', ctx));

// v2.2 新增两页的回归：作品 × 落地状态（#/works）、常见问题（#/faq）。
// 两类断言：
//   A. 聚合正确性——矩阵每一行的分布必须等于该作品条目的真实状态计数，总计必须 = 67；
//   B. 呈现完整性——首页/作品页的堆叠条、FAQ 的问答数量与链接、路由别名。
const fs = require("fs"), vm = require("vm");
const h = fs.readFileSync("脑机接口功能想象_Wiki.html", "utf8");
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({ innerHTML: "", textContent: "", value: "", classList: { toggle() {}, add() {}, remove() {}, contains() { return false } }, addEventListener() {}, focus() {}, blur() {}, select() {}, getAttribute() { return "" }, querySelector() { return null }, querySelectorAll() { return [] }, dataset: {}, style: {} });
const els = {};
const document = { getElementById(id) { return els[id] || (els[id] = mk()) }, querySelector(s) { return els[s] || (els[s] = mk()) }, querySelectorAll() { return [] }, addEventListener() {} };
const ctx = { document, window: { addEventListener() {}, scrollTo() {} }, location: { hash: "#/" }, history: { replaceState() {} }, URLSearchParams, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);
const go = x => { ctx.location.hash = x; vm.runInContext("route()", ctx); return els["#view"].innerHTML; };
const q = c => vm.runInContext(c, ctx);
const ok = (name, cond, extra) => { const line = (cond ? "OK   " : "FAIL ") + name + (extra ? "  " + extra : ""); console.log(line); if (!cond) process.exitCode = 1; };

/* ---------- 1) 矩阵口径：每行分布 = 该作品条目真实状态；总计 = 67 ---------- */
const works = q("DB.works.map(w=>w.key)");
const stKeys = q("Object.keys(DB.mapSt)");
const sums = { total: 0 };
stKeys.forEach(k => sums[k] = 0);
const mism = [];
works.forEach(k => {
  const ids = q("WM[" + JSON.stringify(k) + "].ids");
  const real = {}; stKeys.forEach(s => real[s] = 0);
  ids.forEach(id => { const st = q("BY[" + JSON.stringify(id) + "].st"); real[st] = (real[st] || 0) + 1; sums[st]++; });
  sums.total += ids.length;
  const mine = q("workSt(WM[" + JSON.stringify(k) + "])");
  stKeys.forEach(s => { if ((mine[s] || 0) !== real[s]) mism.push(k + ":" + s); });
});
ok("矩阵分布 = 条目真实状态", mism.length === 0, mism.slice(0, 4).join(","));
ok("十部作品覆盖 67 条", sums.total === 67, "实际 " + sums.total);
ok("全局六档计数与站点一致", stKeys.every(k => sums[k] === q("IT.filter(d=>d.st===" + JSON.stringify(k) + ").length")),
  stKeys.map(k => k + "=" + sums[k]).join(" "));

/* ---------- 2) #/works 页面 ---------- */
const vw = go("#/works");
ok("#/works 渲染", vw.indexOf("作品 × 落地状态") >= 0 && vw.indexOf("<table") >= 0);
const rows = (vw.match(/<a href="#\/work\/[^"]+">/g) || []).length;
ok("#/works 十行作品（含排序列表）", rows >= 20, "链接数 " + rows);
ok("#/works 有预言准确度排序", vw.indexOf("预言最准") >= 0 && /条（\d+%/.test(vw));
ok("#/works 排序按比例降序", (() => {
  const pcts = [...vw.matchAll(/条（(\d+)%）/g)].map(m => +m[1]);
  return pcts.length >= 8 && pcts.every((x, i) => i === 0 || pcts[i - 1] >= x);
})());
ok("#/works 无 undefined", vw.indexOf("undefined") < 0 && vw.indexOf("NaN") < 0);
ok("#/works 每行有堆叠条", (vw.match(/class=miniseg/g) || []).length === 10);

/* ---------- 3) 作品详情页：堆叠条 + 统计句 ---------- */
let wbad = [];
works.forEach(k => {
  const v = go("#/work/" + k);
  if (v.indexOf("class=segbar") < 0) wbad.push(k + ":no-segbar");
  if (v.indexOf("已有现实形态") < 0) wbad.push(k + ":no-stat");
  const ids = q("WM[" + JSON.stringify(k) + "].ids");
  const mine = q("workSt(WM[" + JSON.stringify(k) + "])");
  const sum = stKeys.reduce((a, s) => a + mine[s], 0);
  if (sum !== ids.length) wbad.push(k + ":sum");
});
ok("十部作品页均有进度条与统计", wbad.length === 0, wbad.slice(0, 4).join(","));

/* ---------- 4) #/faq：九问、每题有内链、无未渲染变量 ---------- */
const vf = go("#/faq");
const qs = (vf.match(/<div class="card"><b>/g) || []).length;
ok("#/faq 九个问答", qs === 9, "实际 " + qs);
ok("#/faq 每题至少一条内链", (vf.match(/<div class="card"><b>[\s\S]*?<\/p><\/div>/g) || []).every(b => b.indexOf('href="#/') >= 0));
ok("#/faq 无 undefined", vf.indexOf("undefined") < 0 && vf.indexOf("NaN") < 0);
ok("#/faq 覆盖核心问题", ["读心", "控制", "上传", "多少钱", "智商税"].every(w => vf.indexOf(w) >= 0));

/* ---------- 5) 路由与别名 ---------- */
[["#/works", "作品 × 落地状态"], ["#/questions", "常见问题"], ["#/matrix", "作品 × 落地状态"], ["#/q", "常见问题"], ["#/worklist", "作品 × 落地状态"]].forEach(([u, marker]) => {
  ok("路由 " + u, go(u).indexOf(marker) >= 0);
});
ok("别名不再把 faq 导向 about", go("#/faq").indexOf("<h1>常见问题</h1>") >= 0 && go("#/faq").indexOf("<h1>关于") < 0);

/* ---------- 6) 侧栏入口 ---------- */
q("tree()");
const tree = els["#tree"].innerHTML;
ok("侧栏有 FAQ", tree.indexOf('href="#/faq"') >= 0);
ok("侧栏有作品矩阵", tree.indexOf('href="#/works"') >= 0);

/* ---------- 7) 搜索能找到两页 ---------- */
const sug = q('(function(){suggest("常见问题");return document.querySelector("#suggest").innerHTML})()');
ok("搜索命中 FAQ", sug.indexOf("#/faq") >= 0);
const sug2 = q('(function(){suggest("作品");return document.querySelector("#suggest").innerHTML})()');
ok("搜索命中作品矩阵", sug2.indexOf("#/works") >= 0);

// v2.5 新增层 #/out 的回归：向外连（AI 结合 / 游戏 UI 投射）。
// 两类断言：
//   A. 数据自洽——数量、字段、条目 ID、证据标签取值；
//   B. 呈现完整——三个页面、现实/想象两栏并列、路由别名、首页/侧栏/搜索入口。
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
let fails = 0;
const ok = (name, cond, extra) => { const line = (cond ? "OK   " : "FAIL ") + name + (extra ? "  " + extra : ""); console.log(line); if (!cond) { fails++; process.exitCode = 1; } };

/* ---------- 1) 数据层 ---------- */
const O = q("DB.out"), OEC = q("OEC");
ok("六类外部对象", O.topics.length === 6);
ok("两个重点已标记", O.topics.filter(x => x.focus).length === 2);
ok("AI 四个位置 / HUD 两条路线", O.ai.length === 4 && O.hud.length === 2);
ok("对照总表 8 行", O.matrix.length === 8, "实际 " + O.matrix.length);
ok("证据性质 5 类", O.ev.length === 5);
ok("全部 ids 有效", [].concat(O.topics, O.ai, O.hud).every(x => x.ids.every(id => q("!!BY['" + id + "']"))));
ok("AI 四位置字段齐全", O.ai.every(x => x.name && x.where && x.ev && x.date && x.real && x.imagine && x.gap && x.note && x.ids.length));
ok("HUD 两路线字段齐全", O.hud.every(x => x.name && x.ev && x.date && x.real && x.imagine && x.gap && x.note && x.ids.length));
ok("对照表六列齐全", O.matrix.every(r => r.obj && r.real && r.imagine && r.gap && r.status && r.ev));
ok("证据标签都在配色表内", [].concat(O.ai, O.hud, O.matrix).every(x => String(x.ev).split(/\s*\+\s*|\s*\/\s*/).filter(Boolean).every(k => OEC[k] !== undefined)));

/* ---------- 2) 总览页 ---------- */
const v = go("#/out");
ok("#/out 渲染 H1", v.indexOf("<h1>脑机向外连了什么</h1>") >= 0);
ok("两个重点入口", v.indexOf('href="#/out/ai"') >= 0 && v.indexOf('href="#/out/hud"') >= 0);
ok("六类对象都在表内", O.topics.every(x => v.indexOf(x.name) >= 0));
ok("对照总表 8 行", (v.match(/<tr><td><b>/g) || []).length >= 8);
ok("证据性质 5 行", O.ev.every(x => v.indexOf(x.k) >= 0));
ok("明确区分证据等级", v.indexOf("突破性设备认定") >= 0 && v.indexOf("不等于上市许可") >= 0);
ok("无 undefined / NaN / 未替换星号", v.indexOf("undefined") < 0 && v.indexOf("NaN") < 0 && v.indexOf("**接出去") < 0);

/* ---------- 3) AI 页 ---------- */
const a = go("#/out/ai");
ok("#/out/ai 渲染 H1", a.indexOf("<h1>脑机 × AI</h1>") >= 0);
ok("四张位置卡", (a.match(/class=qcard/g) || []).length === 4);
ok("每卡都有现实/想象两栏", (a.match(/现实这一侧/g) || []).length === 4 && (a.match(/想象这一侧/g) || []).length === 4);
ok("三条判断", (a.match(/<div class="card"><b>①|<div class="card"><b>②|<div class="card"><b>③/g) || []).length === 3);
ok("时间线 5 行", ["2024-07", "2025-01", "2025-03", "2025-05-13", "2026-10-01"].every(t => a.indexOf(t) >= 0));
ok("关键事实在位", a.indexOf("11.32 bit/s") >= 0 && a.indexOf("BCI HID") >= 0 && a.indexOf("Chiral") >= 0 && a.indexOf("5 万小时") >= 0);
ok("联动伦理与 HUD 页", a.indexOf("#/ethics/N2") >= 0 && a.indexOf("#/out/hud") >= 0);
ok("AI 页无 undefined", a.indexOf("undefined") < 0 && a.indexOf("NaN") < 0);

/* ---------- 4) HUD 页 ---------- */
const d = go("#/out/hud");
ok("#/out/hud 渲染 H1", d.indexOf("<h1>向人眼投射游戏 UI</h1>") >= 0);
ok("两张路线卡", (d.match(/class=qcard/g) || []).length === 2);
ok("每卡都有现实/想象两栏", (d.match(/现实这一侧/g) || []).length === 2 && (d.match(/想象这一侧/g) || []).length === 2);
ok("三条判断 + 合流小节", (d.match(/<div class="card"><b>①|<div class="card"><b>②|<div class="card"><b>③/g) || []).length === 3 && d.indexOf("两个重点在这里合流") >= 0);
ok("关键数值在位", d.indexOf("70°") >= 0 && d.indexOf("400–600 nits") >= 0 && d.indexOf("38 例") >= 0);
ok("认定 ≠ 上市的警示", d.indexOf("不等于「获批上市」") >= 0);
ok("M05 判词与两条路线链接", d.indexOf("不是给人脑的输入格式") >= 0 && d.indexOf("#/link/LK2") >= 0 && d.indexOf("#/link/LK5") >= 0);
ok("HUD 页无 undefined", d.indexOf("undefined") < 0 && d.indexOf("NaN") < 0);

/* ---------- 5) 路由与别名 ---------- */
[["#/out", "脑机向外连了什么"], ["#/out/ai", "脑机 × AI"], ["#/out/hud", "向人眼投射游戏 UI"],
 ["#/ai", "脑机 × AI"], ["#/hud", "向人眼投射游戏 UI"], ["#/outbound", "脑机向外连了什么"],
 ["#/brainai", "脑机 × AI"], ["#/llm", "脑机 × AI"], ["#/retinal", "向人眼投射游戏 UI"],
 ["#/ui", "向人眼投射游戏 UI"], ["#/ar", "向人眼投射游戏 UI"]].forEach(([u, m]) => {
  ok("路由 " + u, go(u).indexOf("<h1>" + m + "</h1>") >= 0);
});
ok("未知子路由兜底", go("#/out/zzz").indexOf("未找到") >= 0 || go("#/out/zzz").length < 3000);

/* ---------- 6) 侧栏、搜索、首页 ---------- */
q("tree()");
const tree = els["#tree"].innerHTML;
ok("侧栏有向外连入口", tree.indexOf('href="#/out"') >= 0);
[["脑机向外连了什么", "#/out"], ["脑机 × AI", "#/ai"], ["游戏 UI", "#/hud"]].forEach(([kw, href]) => {
  const sug = q('(function(){suggest(' + JSON.stringify(kw) + ');return document.querySelector("#suggest").innerHTML})()');
  ok("搜索「" + kw + "」命中 " + href, sug.indexOf(href) >= 0);
});
ctx.location.hash = "#/";
vm.runInContext("route()", ctx);
const home = els["#view"].innerHTML;
ok("首页有向外连区块", home.indexOf("向外连：接出去的是什么系统") >= 0 && home.indexOf('href="#/out"') >= 0);
ok("首页两个重点卡", home.indexOf('href="#/out/ai"') >= 0 && home.indexOf('href="#/out/hud"') >= 0);
ok("其他入口网格有向外连", home.indexOf("脑机向外连了什么") >= 0);

console.log(fails ? "\n" + fails + " FAIL" : "\nPASS");

// 入口层回归（v2.0 第一步起）：守住「现实侧为主干、想象侧为文化再现」的结构，
// 防止后续改动把顺序退回去。只验结构与顺序，不验措辞细节。
const fs = require("fs"), vm = require("vm");
const h = fs.readFileSync("脑机接口功能想象_Wiki.html", "utf8");
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({ innerHTML: "", textContent: "", value: "", classList: { toggle() {}, add() {}, remove() {}, contains() { return false } }, addEventListener() {}, focus() {}, blur() {}, select() {}, getAttribute() { return "" }, querySelector() { return null }, querySelectorAll() { return [] }, dataset: {}, style: {} });
const els = {};
const document = { getElementById(id) { return els[id] || (els[id] = mk()) }, querySelector(s) { return els[s] || (els[s] = mk()) }, querySelectorAll() { return [] }, addEventListener() {} };
const ctx = { document, window: { addEventListener() {}, scrollTo() {} }, location: { hash: "#/" }, URLSearchParams, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);
const go = x => { ctx.location.hash = x; vm.runInContext("route()", ctx); return els["#view"].innerHTML; };
const q = c => vm.runInContext(c, ctx);
let bad = [];

// 1) 侧栏四段齐全，且顺序为 概览 → 现实侧 → 判断框架 → 想象侧 → 工具
q("tree()");
const tree = els["#tree"].innerHTML;
const SECS = ["概览", "现实侧 · 主干", "判断框架", "想象侧 · 文化再现", "工具"];
let last = -1;
// 只认分组标题本身，避免命中「代码与工具链」这类正文子串
SECS.forEach(s => {
  let i = tree.indexOf('class="grp sec">' + s);
  if (i < 0) i = tree.indexOf('class="grp">' + s);
  if (i < 0) bad.push("no-sec:" + s);
  else if (i < last) bad.push("order:" + s);
  else last = i;
});
console.log("侧栏四段 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + SECS.length + " 段 / " + tree.length + " 字符）"));

// 2) 现实侧五层在侧栏里都作为可点入口出现，且带计数
bad = [];
[["#/tech", "技术条目"], ["#/dev", "设备与产品目录"], ["#/ind", "临床适应证图谱"], ["#/reg", "监管与准入路径"], ["#/rep", "可复现层"]].forEach(([href, name]) => {
  const re = new RegExp('<a class="row ent" href="' + href.replace(/[/]/g, "\\/") + '">' + name + ' <span class="n">\\d+');
  if (!re.test(tree)) bad.push("no-ent:" + href);
});
console.log("侧栏五层入口 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 3) 首页：导语先讲现实侧、后讲想象侧
bad = [];
const home = go("#/");
const iReal = home.indexOf("主干是");
const iImag = home.indexOf("想象那一侧");
if (iReal < 0) bad.push("no-real-lead");
if (iImag < 0) bad.push("no-imag-lead");
if (iReal >= 0 && iImag >= 0 && iReal > iImag) bad.push("lead-order");
console.log("首页导语顺序 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 4) 首页五层步骤条：恰好 5 张，href 顺序为 tech→dev→ind→reg→rep
bad = [];
const layers = [...home.matchAll(/class="layer" href="([^"]+)"/g)].map(m => m[1]);
const want = ["#/tech", "#/dev", "#/ind", "#/reg", "#/rep"];
if (layers.length !== want.length) bad.push("count:" + layers.length + "!=" + want.length);
else layers.forEach((x, i) => { if (x !== want[i]) bad.push("href" + i + ":" + x + "!=" + want[i]); });
console.log("首页五层步骤条 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + layers.join(" → ") + "）"));

// 5) 首页区块顺序：五层入口 在 九条结论 之前
bad = [];
const iLayers = home.indexOf("现实侧五层");
const iTake = home.indexOf("九条结论");
if (iLayers < 0) bad.push("no-layers");
if (iTake < 0) bad.push("no-takeaways");
if (iLayers >= 0 && iTake >= 0 && iLayers > iTake) bad.push("block-order");
console.log("首页区块顺序 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（五层 → 九条结论）"));

// 6) 「其他入口」区块存在，且不再重复五层（避免同一入口出现两次）
bad = [];
const iOther = home.indexOf("其他入口");
if (iOther < 0) bad.push("no-other");
const otherPart = iOther >= 0 ? home.slice(iOther) : "";
if (otherPart.indexOf('href="#/tech"') >= 0) bad.push("dup-tech");
if (otherPart.indexOf('href="#/dev"') >= 0) bad.push("dup-dev");
console.log("其他入口区块 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（五层不重复）"));

// 7) 侧栏每条 row 的 href 都能打开（只查现实侧与工具段的入口，逐条 route）
bad = [];
const hrefs = [...tree.matchAll(/<a class="row[^"]*" href="(#[^"]+)"/g)].map(m => m[1]);
const uniq = [...new Set(hrefs)];
uniq.slice(0, 40).forEach(x => {
  const v = go(x);
  if (!v || v.indexOf("未找到") >= 0) bad.push("dead:" + x);
});
console.log("侧栏入口可达（抽查 " + Math.min(uniq.length, 40) + "/" + uniq.length + "）= " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

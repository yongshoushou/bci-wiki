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

const ids = q('DB.tech.list.map(t=>t.k).join(" ")').split(" ");
const cats = q('DB.tech.cats.map(c=>c.k).join(" ")').split(" ");

// 1) 总览页：五个分类全部出现，40 张卡片
const ov = go("#/tech");
q('DB.tech.cats.map(c=>c.name).join("|")').split("|").forEach(n => {
  if (ov.indexOf(n) < 0) bad.push("overview-missing-cat:" + n);
});
const cards = (ov.match(/class="tcard"/g) || []).length;
if (cards !== ids.length) bad.push("overview-cards:" + cards + "!=" + ids.length);
console.log("技术总览页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + cards + " 张卡片 / " + cats.length + " 类）"));

// 2) 每条详情页：四段结构齐全
bad = [];
ids.forEach(k => {
  const v = go("#/tech/" + k);
  ["典型数值", "失效模式", "来源"].forEach(sec => { if (v.indexOf(sec) < 0) bad.push(k + "-no-" + sec); });
  if (/undefined|NaN/.test(v)) bad.push(k + "-junk");
  if (v.indexOf("怎么做") < 0) bad.push(k + "-no-how");
});
console.log(ids.length + " 技术详情页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 3) 数值行数量与构建期数据一致（抽查，防止渲染时漏项）
bad = [];
ids.forEach(k => {
  const n = q('DB.tech.list.filter(t=>t.k==="' + k + '")[0].vals.length');
  const v = go("#/tech/" + k);
  const rows = (v.match(/<tr><th>/g) || []).length;
  if (rows < n) bad.push(k + "-vals:" + rows + "<" + n);
});
console.log("数值表行数 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 4) 双向索引：技术→案例 与 案例→技术 一致
bad = [];
ids.forEach(k => {
  const t = q('DB.tech.list.filter(t=>t.k==="' + k + '")[0]');
  (t.cases || []).forEach(c => {
    const v = go("#/case/" + c);
    if (v.indexOf("#/tech/" + k) < 0) bad.push("reverse-miss:" + k + "->" + c);
  });
});
console.log("案例→技术 反向索引 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 5) 关联技术必须互为可点（rel 指向的页面能打开）
bad = [];
ids.forEach(k => {
  const t = q('DB.tech.list.filter(t=>t.k==="' + k + '")[0]');
  (t.rel || []).forEach(r => {
    const v = go("#/tech/" + r);
    if (v.indexOf("技术条目 " + r) >= 0 || /不存在/.test(v)) bad.push("rel-broken:" + k + "->" + r);
  });
});
console.log("技术互链 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 6) 入口存在性
bad = [];
[["#/", "技术条目（基础层）"], ["#/index", "技术条目"], ["#/about", "技术条目层"], ["#/item/C02", "#/tech/"], ["#/case/R01", "用到的技术条目"]].forEach(([r, kw]) => {
  const v = go(r);
  if (v.indexOf(kw) < 0) bad.push(r + "-no-entry");
});
console.log("首页 / 索引 / 关于 / 条目页入口 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

console.log("体积 = " + (h.length / 1024).toFixed(1) + "KB");

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

const regs = q('DB.reg.list.map(g=>g.k).join(" ")').split(" ").filter(Boolean);
const rgrps = q('DB.reg.groups.map(g=>g.k).join(" ")').split(" ").filter(Boolean);
const reps = q('DB.rep.list.map(o=>o.k).join(" ")').split(" ").filter(Boolean);
const ogrps = q('DB.rep.groups.map(g=>g.k).join(" ")').split(" ").filter(Boolean);
const devs = q('DB.dev.list.map(d=>d.k).join(" ")').split(" ").filter(Boolean);
const inds = q('DB.ind.list.map(x=>x.k).join(" ")').split(" ").filter(Boolean);

// 1) 监管总览：18 条全部成行、5 组齐全、每条都带「关键数字」
const ov = go("#/reg");
q('DB.reg.groups.map(g=>g.name).join("|")').split("|").forEach(n => {
  if (ov.indexOf(n) < 0) bad.push("overview-missing-group:" + n);
});
const regLinks = new Set((ov.match(/#\/reg\/G\d{2}/g) || []));
if (regLinks.size !== regs.length) bad.push("overview-reg-links:" + regLinks.size + "!=" + regs.length);
const secs = (ov.match(/<h2 id="(cn|intl|pay|trial|data)"/g) || []).length;
if (secs < rgrps.length) bad.push("overview-sections:" + secs + "<" + rgrps.length);
q('DB.reg.list.map(g=>g.head).join("|")').split("|").forEach(x => {
  if (!x) bad.push("empty-head");
});
if (ov.indexOf("关键数字") < 0) bad.push("overview-no-head-col");
console.log("监管总览页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + regLinks.size + " 条 / " + rgrps.length + " 组 / " + secs + " 个分段）"));

// 2) 每条路径详情：六段齐全、步骤数与数字行数达标、无脏值
bad = [];
regs.forEach(k => {
  const v = go("#/reg/" + k);
  ["谁要走这条路", "怎么走", "关键数字", "真正的卡点", "常见失效情形", "来源"].forEach(sec => {
    if (v.indexOf(sec) < 0) bad.push(k + "-no-" + sec);
  });
  if (/undefined|NaN/.test(v)) bad.push(k + "-junk");
  const need = q('DB.reg.list.filter(g=>g.k==="' + k + '")[0].vals.length');
  const rows = (v.match(/<tr><th>/g) || []).length;
  if (rows < need) bad.push(k + "-val-rows:" + rows + "<" + need);
  const steps = q('DB.reg.list.filter(g=>g.k==="' + k + '")[0].steps.length');
  const lis = (v.match(/<li>/g) || []).length;
  const fails = q('DB.reg.list.filter(g=>g.k==="' + k + '")[0].fail.length');
  if (lis < steps + fails) bad.push(k + "-li:" + lis + "<" + (steps + fails));
});
console.log(regs.length + " 监管详情页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 3) 监管 ↔ 设备 / 适应证 双向一致
bad = [];
regs.forEach(k => {
  const g = q('DB.reg.list.filter(x=>x.k==="' + k + '")[0]');
  const v = go("#/reg/" + k);
  g.dev.forEach(dk => { if (v.indexOf("#/dev/" + dk) < 0) bad.push("reg->dev:" + k + "->" + dk); });
  g.ind.forEach(ik => { if (v.indexOf("#/ind/" + ik) < 0) bad.push("reg->ind:" + k + "->" + ik); });
});
devs.forEach(dk => {
  const should = q('DB.reg.list.filter(g=>g.dev.indexOf("' + dk + '")!==-1).map(g=>g.k).join(" ")').split(" ").filter(Boolean);
  if (!should.length) return;
  const v = go("#/dev/" + dk);
  if (v.indexOf("约束这台设备的准入路径") < 0) bad.push("dev-no-regsection:" + dk);
  should.forEach(gk => { if (v.indexOf("#/reg/" + gk) < 0) bad.push("dev->reg:" + dk + "->" + gk); });
});
inds.forEach(ik => {
  const should = q('DB.reg.list.filter(g=>g.ind.indexOf("' + ik + '")!==-1).map(g=>g.k).join(" ")').split(" ").filter(Boolean);
  if (!should.length) return;
  const v = go("#/ind/" + ik);
  should.forEach(gk => { if (v.indexOf("#/reg/" + gk) < 0) bad.push("ind->reg:" + ik + "->" + gk); });
});
console.log("监管 ↔ 设备 / 适应证 双向索引 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 4) 可复现总览：14 项成卡、4 组齐全
bad = [];
const oov = go("#/rep");
q('DB.rep.groups.map(g=>g.name).join("|")').split("|").forEach(n => {
  if (oov.indexOf(n) < 0) bad.push("overview-missing-group:" + n);
});
const oCards = (oov.match(/class="dcard"/g) || []).length;
if (oCards !== reps.length) bad.push("overview-cards:" + oCards + "!=" + reps.length);
const oLinks = new Set((oov.match(/#\/rep\/O\d{2}/g) || []));
if (oLinks.size !== reps.length) bad.push("overview-rep-links:" + oLinks.size + "!=" + reps.length);
console.log("可复现总览页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + oCards + " 张卡片 / " + ogrps.length + " 组）"));

// 5) 每条可复现条目详情：六段齐全、数字行数达标、无脏值
bad = [];
reps.forEach(k => {
  const v = go("#/rep/" + k);
  ["规模与获取", "关键数字", "适合做什么", "不能做什么", "来源"].forEach(sec => {
    if (v.indexOf(sec) < 0) bad.push(k + "-no-" + sec);
  });
  if (/undefined|NaN/.test(v)) bad.push(k + "-junk");
  const need = q('DB.rep.list.filter(o=>o.k==="' + k + '")[0].vals.length') + 2;
  const rows = (v.match(/<tr><th>/g) || []).length;
  if (rows < need) bad.push(k + "-rows:" + rows + "<" + need);
});
console.log(reps.length + " 可复现详情页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 6) 可复现 → 技术 / 案例 的链接可打开
bad = [];
reps.forEach(k => {
  const o = q('DB.rep.list.filter(x=>x.k==="' + k + '")[0]');
  const v = go("#/rep/" + k);
  o.tech.forEach(t => { if (v.indexOf("#/tech/" + t) < 0) bad.push("rep->tech:" + k + "->" + t); });
  o.cases.forEach(c => { if (v.indexOf("#/case/" + c) < 0) bad.push("rep->case:" + k + "->" + c); });
});
console.log("可复现 → 技术 / 案例 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 7) 四处入口
bad = [];
[["#/", "监管与准入"], ["#/", "可复现层"], ["#/index", "监管与准入路径"], ["#/index", "可复现层"], ["#/about", "监管与可复现"]].forEach(([r, kw]) => {
  const v = go(r);
  if (v.indexOf(kw) < 0) bad.push(r + "-no-entry:" + kw);
});
console.log("首页 / 索引 / 关于 入口 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 8) 目录树与搜索索引覆盖新层
bad = [];
q("tree()"); const nav = els["#tree"].innerHTML;
if (nav.indexOf('data-g="regg:') < 0) bad.push("nav-no-reg");
if (nav.indexOf('data-g="repg:') < 0) bad.push("nav-no-rep");
regs.concat(reps).forEach(k => {
  const key = k[0] === "G" ? "#/reg/" + k : "#/rep/" + k;
  if (nav.indexOf(key) < 0) bad.push("nav-nowhere:" + k);
});
const hits = q('SIDX.filter(function(x){return x.k==="监管"||x.k==="可复现";}).length');
if (hits !== regs.length + reps.length) bad.push("sidx:" + hits + "!=" + (regs.length + reps.length));
const hitG = q('SIDX.filter(function(x){return x.k==="监管";})[0].h');
if (hitG !== "#/reg/G01") bad.push("sidx-href:" + hitG);
console.log("目录树 / 搜索索引 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + nav.length + " 字符目录树 / 搜索命中 " + hits + " 条）"));

// 9) 404 兜底
bad = [];
["#/reg/G99", "#/rep/O99"].forEach(r => { const v = go(r); if (v.indexOf("未找到") < 0) bad.push(r + "-no-notfound"); });
console.log("未知编号兜底 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

console.log("体积 = " + (h.length / 1024).toFixed(1) + "KB");

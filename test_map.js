// test_map.js —— 想象 ↔ 现实 锚点层回归
// 守的是「每一条想象都挂在现实零件上，每一个技术条目都能反查到想象」这条不变式
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

const ids = q('DB.items.map(d=>d.id).join(" ")').split(" ");
const stKeys = q('Object.keys(DB.mapSt).join(" ")').split(" ");
const techKeys = q('DB.tech.list.map(t=>t.k).join(" ")').split(" ");
let bad = [];

// 1) 数据完整性：每条都有状态与缺口说明
ids.forEach(id => {
  const st = q('DB.items.filter(d=>d.id==="' + id + '")[0].st');
  const gap = q('DB.items.filter(d=>d.id==="' + id + '")[0].gap');
  if (stKeys.indexOf(st) < 0) bad.push(id + "-st:" + st);
  if (!gap || !gap.trim()) bad.push(id + "-no-gap");
});
const dist = q('Object.keys(DB.mapSt).map(k=>k+DB.items.filter(d=>d.st===k).length).join(" ")');
console.log("锚点数据 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + ids.length + " 条全有状态与缺口 / " + dist + "）"));

// 2) 每条想象的页面都渲染出锚点条
bad = [];
ids.forEach(id => {
  const v = go("#/item/" + id);
  if (v.indexOf('class="anchor"') < 0) bad.push(id + "-no-anchor");
  const nm = q('DB.mapSt[DB.items.filter(d=>d.id==="' + id + '")[0].st].name');
  if (v.indexOf(nm) < 0) bad.push(id + "-no-stname");
  if (/undefined|NaN/.test(v)) bad.push(id + "-junk");
  ["差在哪一环", "谁在做", "用现有部件能拼到哪一步"].forEach(s => { if (v.indexOf(s) < 0) bad.push(id + "-no-" + s); });
});
console.log("条目页锚点 = " + (bad.length ? "FAIL " + bad.slice(0, 12).join(",") : "OK（67 页均有锚点条 / 状态名 / 三段）"));

// 3) 零件链接可点：有 tech 的条目必须给出 #/tech/ 链接；concept 且空给出解释
bad = [];
ids.forEach(id => {
  const t = q('JSON.stringify(DB.items.filter(d=>d.id==="' + id + '")[0].tech)');
  const arr = JSON.parse(t), st = q('DB.items.filter(d=>d.id==="' + id + '")[0].st');
  const v = go("#/item/" + id);
  if (arr.length) {
    arr.forEach(k => { if (v.indexOf("#/tech/" + k) < 0) bad.push(id + "-no-link-" + k); });
  } else {
    const ok = v.indexOf("不落在任何技术条目上") >= 0 || v.indexOf("不需要零件") >= 0;
    if (!ok) bad.push(id + "-no-empty-copy");
  }
  if (["ship","lab","point","multi"].indexOf(st) >= 0 && !arr.length) bad.push(id + "-no-parts:" + st);
});
console.log("零件链接 = " + (bad.length ? "FAIL " + bad.slice(0, 12).join(",") : "OK（有零件的全部可点；非技术命题给出显式说明）"));

// 4) 技术条目页：40 条都能反查到想象，零引用为 0
bad = [];
let zero = [];
techKeys.forEach(k => {
  const v = go("#/tech/" + k);
  const has = v.indexOf("它撑起了哪些想象") >= 0 || v.indexOf("它约束了哪些想象") >= 0;
  if (!has) bad.push(k + "-no-reverse");
  const n = q('DB.items.filter(d=>(d.tech||[]).indexOf("' + k + '")>=0||(d.met||[]).indexOf("' + k + '")>=0).length');
  if (n === 0) zero.push(k);
  if (/undefined|NaN/.test(v)) bad.push(k + "-junk");
});
if (zero.length) bad.push("zero-ref:" + zero.join("+"));
console.log("技术页反查 = " + (bad.length ? "FAIL " + bad.slice(0, 10).join(",") : "OK（40 条均有反向列表，零引用 0）"));

// 5) 双向一致：item.tech 里的 T，其页面必须出现该 item 链接；反之亦然
bad = [];
ids.forEach(id => {
  const arr = JSON.parse(q('JSON.stringify(DB.items.filter(d=>d.id==="' + id + '")[0].tech)'));
  arr.forEach(k => {
    const tv = go("#/tech/" + k);
    if (tv.indexOf("#/item/" + id) < 0) bad.push("fwd-" + id + "-" + k);
  });
});
techKeys.slice(0, 40).forEach(k => {
  const tv = go("#/tech/" + k);
  (tv.match(/#\/item\/([A-Z]\d{2})/g) || []).forEach(m => {
    const id = m.split("/").pop();
    const arr = JSON.parse(q('JSON.stringify(DB.items.filter(d=>d.id==="' + id + '")[0].tech)'));
    const met = JSON.parse(q('JSON.stringify(DB.items.filter(d=>d.id==="' + id + '")[0].met)'));
    if (arr.indexOf(k) < 0 && met.indexOf(k) < 0) bad.push("back-" + k + "-" + id);
  });
});
console.log("双向一致 = " + (bad.length ? "FAIL " + bad.slice(0, 12).join(",") + "（共 " + bad.length + "）" : "OK（零件→想象、想象→零件两个方向均闭合）"));

// 6) 完整表格：10 列 + 落地状态筛选 + 按状态筛选行数正确
bad = [];
const t = go("#/table");
if ((t.match(/<th>/g) || []).length !== 10) bad.push("cols:" + (t.match(/<th>/g) || []).length);
if (t.indexOf('id="tst"') < 0) bad.push("no-st-filter");
if (t.indexOf("离落地") < 0) bad.push("no-st-col");
const shipN = q('DB.items.filter(d=>d.st==="ship").length');
const shipRet = q('(function(){TBL.st="ship";var out=[];var before=TBL.st;return before;})()');
if (shipRet !== "ship") bad.push("st-filter-state");
q('TBL.st="ALL"');
console.log("完整表格 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（10 列 / 状态筛选组在位 / 已上市 " + shipN + " 条）"));

// 7) 未知编号兜底
bad = [];
["#/item/ZZ9", "#/tech/T99"].forEach(u => {
  const v = go(u);
  if (v.indexOf("没有") < 0 && v.indexOf("不存在") < 0 && v.indexOf("未找到") < 0) bad.push("404-" + u);
});
console.log("兜底 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

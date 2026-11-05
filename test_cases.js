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
q('DB.cases.list.map(c=>c.k).join(" ")').split(" ").forEach(k => {
  const v = go("#/case/" + k);
  if (v.indexOf("对照要点") < 0) bad.push("case:" + k);
  if (v.indexOf("没做到什么") < 0) bad.push("case-nocant:" + k);
});
console.log("28 案例页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

bad = [];
q('DB.compose.list.map(c=>c.k).join(" ")').split(" ").forEach(k => {
  const v = go("#/compose/" + k);
  if (v.indexOf("技术组合") < 0) bad.push("kit:" + k);
  if (v.indexOf("结论") < 0) bad.push("kit-noverdict:" + k);
});
console.log("20 组合页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

["#/cases", "#/compose", "#/reality", "#/"].forEach(r => {
  const v = go(r);
  console.log("  " + r + " → " + (v.length > 1200 ? "OK " + v.length + " 字符" : "SHORT " + v.length));
});

// 条目页：有案例的必须出现「现实对照」，无案例的必须出现明确的「没有任何现实案例对应」
bad = [];
q('DB.items.map(d=>d.id).join(" ")').split(" ").forEach(id => {
  const v = go("#/item/" + id);
  const has = q('JSON.stringify(BY["' + id + '"].cases)') !== "[]";
  if (has && v.indexOf("现实案例") < 0) bad.push("miss:" + id);
  if (!has && v.indexOf("没有直接对应的公开案例") < 0) bad.push("should-say-none:" + id);
});
console.log("条目页现实对照块 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 反向索引一致性
const fwd = q('JSON.stringify(DB.cases.list.reduce((a,c)=>a.concat(c.ids.map(i=>[i,c.k])),[]))');
const fwdArr = JSON.parse(fwd);
bad = fwdArr.filter(([i, k]) => q('BY["' + i + '"].cases.indexOf("' + k + '")') < 0).map(x => x.join("<"));
console.log("案例→条目 / 条目→案例 双向一致 = " + (bad.length ? "FAIL " + bad.slice(0, 5).join(",") : "OK"));

const kfwd = JSON.parse(q('JSON.stringify(DB.compose.list.reduce((a,c)=>a.concat(c.ids.map(i=>[i,c.k])),[]))'));
bad = kfwd.filter(([i, k]) => q('BY["' + i + '"].kits.indexOf("' + k + '")') < 0).map(x => x.join("<"));
console.log("组合→条目 / 条目→组合 双向一致 = " + (bad.length ? "FAIL " + bad.slice(0, 5).join(",") : "OK"));

console.log("覆盖：案例 " + q('DB.items.filter(d=>d.cases.length).length') + "/67，组合 " + q('DB.items.filter(d=>d.kits.length).length') + "/67");
console.log("体积 = " + (Buffer.byteLength(h) / 1024).toFixed(1) + "KB");

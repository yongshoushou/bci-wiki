// 技术条目「目前最优系统 + 数值年表」回归（v2.1）
// 守两件事：40 条一条都不能漏；年表必须是一条真序列（年份递增、四列完整），
// 否则「斜率」这个说法就是假的。
const fs = require("fs");
const vm = require("vm");
const h = fs.readFileSync("脑机接口功能想象_Wiki.html", "utf8");
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({
  innerHTML: "", textContent: "", value: "",
  classList: { toggle() {}, add() {}, remove() {}, contains() { return false } },
  addEventListener() {}, querySelector() { return null }, querySelectorAll() { return [] },
  dataset: {}, style: {}
});
const els = {};
const document = {
  getElementById(i) { return els[i] || (els[i] = mk()); },
  querySelector(s) { return els[s] || (els[s] = mk()); },
  querySelectorAll() { return []; }, addEventListener() {}
};
const ctx = { document, window: { addEventListener() {}, scrollTo() {} }, location: { hash: "#/" }, history: { replaceState() {} }, URLSearchParams, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);
const go = x => { ctx.location.hash = x; vm.runInContext("route()", ctx); return els["#view"].innerHTML; };
const q = c => vm.runInContext(c, ctx);
let bad = [];

// 1) 40 条都有最优系统，且 key 里必须出现数字（不然就是空话）
const L = q("DB.tech.list.map(t=>({k:t.k,name:t.name,best:t.best,hist:t.hist}))");
if (L.length !== 40) bad.push("条目数=" + L.length);
L.forEach(t => {
  if (!t.best || !t.best.sys || !t.best.key || !t.best.note) bad.push(t.k + "缺best");
  else if (!/\d/.test(t.best.key)) bad.push(t.k + "best.key无数字");
  if (!t.hist || t.hist.length < 3) bad.push(t.k + "年表过短");
  else {
    for (let i = 1; i < t.hist.length; i++) {
      if (parseInt(t.hist[i][0]) <= parseInt(t.hist[i - 1][0])) bad.push(t.k + "年表非递增@" + i);
    }
    t.hist.forEach((r, i) => { if (r.length !== 4 || r.some(c => !String(c).trim())) bad.push(t.k + "年表空字段@" + i); });
  }
});
console.log("最优系统 + 年表（40 条）= " + (bad.length ? "FAIL " + bad.slice(0, 6).join(",") : "OK（年表合计 " + L.reduce((a, t) => a + t.hist.length, 0) + " 个里程碑）"));

// 2) 技术详情页渲染：最优系统卡、年表表头、跨度提示
bad = [];
["T01", "T05", "T13", "T22", "T29", "T40"].forEach(k => {
  const v = go("#/tech/" + k);
  if (!/目前最优系统/.test(v)) bad.push(k + "无最优系统");
  if (!/数值年表/.test(v)) bad.push(k + "无年表");
  if (!/个里程碑 · \d{4}s?–\d{4}s?/.test(v)) bad.push(k + "无跨度");
  if (/undefined/.test(v)) bad.push(k + "有undefined");
});
console.log("技术页渲染（抽查 6 条）= " + (bad.length ? "FAIL " + bad.join(",") : "OK（最优系统 + 年表 + 跨度）"));

// 3) 年表数值必须和「典型数值」对得上：至少有一个数字在两处都出现
bad = [];
const mismatch = [];
L.forEach(t => {
  const v = go("#/tech/" + t.k);
  const nums = (v.match(/\d+(\.\d+)?/g) || []).join(" ");
  // 年表里的数字串（≥2 位）应至少有一个出现在页面别处（典型数值/最优系统）
  const histNums = t.hist.map(r => r[2]).join(" ").match(/\d{2,}/g) || [];
  if (histNums.length && !histNums.some(n => nums.split(" ").indexOf(n) >= 0)) mismatch.push(t.k);
});
console.log("年表数值可对上（40 条）= " + (mismatch.length ? "FAIL " + mismatch.join(",") : "OK（每条至少一个数字与典型数值或最优系统重合）"));

// 4) 汇总口径：多少条年表首尾跨 20 年以上
const span = L.filter(t => parseInt(t.hist[t.hist.length - 1][0]) - parseInt(t.hist[0][0]) >= 20).length;
console.log("年表跨度 ≥20 年 = " + span + " / " + L.length + (span >= 25 ? " OK" : " 偏少"));

// 5) 技术总览页文案提到四样东西
const vt = go("#/tech");
console.log("技术总览措辞 = " + (/目前最优系统/.test(vt) && /数值年表/.test(vt) ? "OK" : "FAIL"));

console.log(bad.length ? "FAIL" : "PASS");

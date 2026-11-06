// 设备价格时效核验 + 可引用快照 回归（v2.1）
// 价格是唯一会过期的字段，所以这里不测「价格对不对」（测不了），只测
// 「有没有说清口径、有没有标月份、高风险的是不是真的标了高」。
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const h = fs.readFileSync("脑机接口功能想象_Wiki.html", "utf8");
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({
  innerHTML: "", textContent: "", value: "",
  classList: { toggle() {}, add() {}, remove() {}, contains() { return false } },
  addEventListener() { }, querySelector() { return null }, querySelectorAll() { return []; },
  dataset: {}, style: {}
});
const els = {};
const document = {
  getElementById(i) { return els[i] || (els[i] = mk()); },
  querySelector(s) { return els[s] || (els[s] = mk()); },
  querySelectorAll() { return []; }, addEventListener() { }
};
const ctx = { document, window: { addEventListener() { }, scrollTo() { } }, location: { hash: "#/" }, history: { replaceState() { } }, URLSearchParams, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);
const go = x => { ctx.location.hash = x; vm.runInContext("route()", ctx); return els["#view"].innerHTML; };
const q = c => vm.runInContext(c, ctx);
let bad = [];

// 1) 30 台都有核验字段，口径/原因/问价要点不能空
const L = q("DB.dev.list.map(d=>({k:d.k,name:d.name,price:d.price,pv:d.pv}))");
if (L.length !== 30) bad.push("设备数=" + L.length);
L.forEach(d => {
  const p = d.pv;
  if (!p) return bad.push(d.k + "无pv");
  ["basis", "on", "drift", "why", "ask"].forEach(f => { if (!p[f] || !String(p[f]).trim()) bad.push(d.k + "缺" + f); });
  if (["低", "中", "高", "—"].indexOf(p.drift) < 0) bad.push(d.k + "档位非法");
  if (p.on !== "2026-11") bad.push(d.k + "月份=" + p.on);
});
console.log("30 台价格核验字段 = " + (bad.length ? "FAIL " + bad.slice(0, 5).join(",") : "OK"));

// 2) 风险分布必须与页面统计一致（防止数据改了页面写死）
const dist = { "低": 0, "中": 0, "高": 0, "—": 0 };
L.forEach(d => dist[d.pv.drift]++);
const vp = go("#/price");
bad = [];
[["高", dist["高"]], ["中", dist["中"]], ["低", dist["低"]], ["—", dist["—"]]].forEach(([k, n]) => {
  if (dist[k] !== n) bad.push("dist");
});
const okDist = dist["低"] === 7 && dist["中"] === 7 && dist["高"] === 9 && dist["—"] === 7;
console.log("风险分布（低" + dist["低"] + " 中" + dist["中"] + " 高" + dist["高"] + " 无价" + dist["—"] + "）= " + (okDist ? "OK" : "FAIL 与预期 7/7/9/7 不符"));

// 3) 价格页渲染：四张统计卡 + 30 行 + 三个价格故事
bad = [];
if (!/价格时效核验/.test(vp)) bad.push("标题");
if (!/三档时效风险/.test(vp)) bad.push("档位表");
if (!/全部 30 台的价格口径/.test(vp)) bad.push("主表");
if (!/三个真实的价格变动/.test(vp)) bad.push("故事块");
if (!/引用价格的四条纪律/.test(vp)) bad.push("纪律块");
if (!/砍掉 75%/.test(vp)) bad.push("耳蜗集采例");
const rows = (vp.match(/<tr><td><a href="#\/dev\/D\d\d">/g) || []).length;
if (rows !== 30) bad.push("主表行数=" + rows);
console.log("价格页渲染 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（30 行 + 四卡 + 三例）"));

// 4) 设备详情页：每条都要有「价格时效」块，且风险档与数据一致
bad = [];
L.forEach(d => {
  const v = go("#/dev/" + d.k);
  if (!/价格时效/.test(v)) bad.push(d.k + "无块");
  if (v.indexOf("风险 " + d.pv.drift) < 0) bad.push(d.k + "档位不符");
  if (!/问价要点/.test(v)) bad.push(d.k + "无问价要点");
});
console.log("30 台设备页价格块 = " + (bad.length ? "FAIL " + bad.slice(0, 5).join(",") : "OK"));

// 5) 未上市设备的措辞：不能出现「预计售价」这类编造
bad = [];
L.filter(d => d.pv.drift === "—").forEach(d => {
  const v = go("#/dev/" + d.k);
  if (/预计售价|预计价格|预售价/.test(v)) bad.push(d.k + "编价");
});
console.log("未上市 7 台无编价 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 6) 引用块：GB/T 7714 + BibTeX + 版本号
const vm2 = go("#/mapst");
bad = [];
if (!/引用这份表/.test(vm2)) bad.push("无引用块");
if (!/GB\/T 7714/.test(vm2)) bad.push("无GB");
if (!/@misc\{/.test(vm2)) bad.push("无BibTeX");
const ver = q("VER");
if (vm2.indexOf(ver) < 0) bad.push("引用里无版本");
if (!/mapst\.html/.test(vm2)) bad.push("无快照链接");
console.log("引用块 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（GB/T 7714 + BibTeX + " + ver + "）"));

// 7) 静态快照：存在、无脚本、条数对、带生成日期
bad = [];
const snapPath = path.join(__dirname, "mapst.html");
if (!fs.existsSync(snapPath)) bad.push("文件不存在");
else {
  const s = fs.readFileSync(snapPath, "utf8");
  if (/<script/i.test(s)) bad.push("含script");
  const n = (s.match(/<tr><td><a href="[^"]+#\/item\//g) || []).length;
  if (n !== 67) bad.push("条目行=" + n);
  const vd = (h.match(/VERDATE="([^"]+)"/) || [])[1];
  if (!/content="\d{4}-\d{2}-\d{2}"/.test(s)) bad.push("无生成日期");
  if (!vd || s.indexOf('content="' + vd + '"') < 0) bad.push("生成日期与站点不一致");
  if (!/GB\/T 7714/.test(s) || !/@misc\{/.test(s)) bad.push("无引用");
  if (!/六档分布/.test(s) || !/状态 × 难度/.test(s)) bad.push("缺章节");
}
console.log("静态快照 mapst.html = " + (bad.length ? "FAIL " + bad.join(",") : "OK（无 JS / 67 条 / 含引用）"));

console.log(bad.length ? "FAIL" : "PASS");

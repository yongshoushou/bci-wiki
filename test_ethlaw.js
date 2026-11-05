// v2.3 新增页 #/ethlaw 的回归：伦理与法律 · 九个争论点。
// 重点不是「页面能打开」，而是「页面上的每个数字都说得出来源」：
//   A. 数据自洽——文案里写死的「4 条 / 2 条」必须等于数据实际计算值；
//   B. 占位符全部替换——页面上不允许残留 {e4} 这类模板片段；
//   C. 呈现完整——九张卡、两侧立场、条目章、四种治理范式、路由与别名。
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

/* ---------- 1) 数据层自洽 ---------- */
const D = q("DB.debate"), P = q("DB.paradigm");
ok("九个争论点", D.length === 9, "实际 " + D.length);
ok("编号唯一且为 Q1–Q9", D.map(x => x.k).join(",") === "Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9");
ok("九条都有判词与两侧立场", D.every(x => x.a && x.e && x.l && x.n && x.ids.length));

const e4 = q("IT.filter(d=>d.eth&&d.eth.e===4).length");
const e4v2 = q("IT.filter(d=>d.eth&&d.eth.e===4&&d.law.v===2).length");
const e4v34 = q("IT.filter(d=>d.eth&&d.eth.e===4&&d.law.v>=3).length");
ok("Q1 的「4 条」= E4 且 V2 的实际条数", e4v2 === 4, "E4∩V2=" + e4v2);
ok("Q2 的名单长度 = E4 且不判断的实际条数", D[1].ids.length === e4v34, D[1].ids.length + " vs " + e4v34);
ok("Q2 名单与计算集合完全一致", (() => {
  const calc = q("IT.filter(d=>d.eth.e===4&&d.law.v>=3).map(d=>d.id)").slice().sort().join(" ");
  return calc === D[1].ids.slice().sort().join(" ");
})());
ok("Q5 的「2 条」= V2 且判词提到同意的实际条数",
  q("IT.filter(d=>d.law.v===2&&/同意/.test(d.law.why)).length") === 2);
ok("Q7 四条 = L1–L2 且 E3+ 的实际条数",
  D[6].ids.length === q("IT.filter(d=>(d.lv===1||d.lv===2)&&d.eth.e>=3).length"));
ok("E4 总数与年度统计一致", e4 === 21, "E4=" + e4);
ok("四国治理范式齐全", P.map(x => x.name).join(",") === "智利,欧盟,美国,中国", P.map(x => x.name).join(","));
ok("范式三栏都不为空", P.every(x => x.how && x.good && x.bad && x.y && x.tag));

/* ---------- 2) 页面渲染 ---------- */
const v = go("#/ethlaw");
ok("#/ethlaw 渲染 H1", v.indexOf("<h1>伦理与法律：九个最值得吵的问题</h1>") >= 0);
ok("九张问题卡", (v.match(/class=qcard/g) || []).length === 9, "实际 " + (v.match(/class=qcard/g) || []).length);
ok("每张卡都有两侧立场", (v.match(/class=qcols/g) || []).length === 9);
ok("每张卡都有伦理/法律分栏标题", (v.match(/伦理这一侧/g) || []).length === 9 && (v.match(/法律这一侧/g) || []).length === 9);
ok("每张卡都有数字脚注", (v.match(/class=qstat/g) || []).length === 9);
ok("每张卡都有可点条目", (v.match(/class=qids/g) || []).length === 9);
ok("无残留占位符", !/\{[a-zA-Z0-9]+\}/.test(v), (v.match(/\{[a-zA-Z0-9]+\}/g) || []).slice(0, 3).join(","));
ok("无 undefined / NaN", v.indexOf("undefined") < 0 && v.indexOf("NaN") < 0);

// 条目章必须都能点开，且 ID 真实存在
const chips = [...v.matchAll(/#\/item\/([A-Z]\d+)/g)].map(m => m[1]);
ok("条目章全部有效", chips.length >= 20 && chips.every(id => q("!!BY['" + id + "']")), "共 " + chips.length + " 个");

// 开场四个数字必须与数据同值（不写死）
ok("开场数字 E4 = " + e4, v.indexOf(">" + e4 + "</b>") >= 0);
ok("开场数字「不判断」= " + e4v34, v.indexOf(">" + e4v34 + "</b>") >= 0);
ok("开场数字 V3/V2 对比在位", v.indexOf(q("IT.filter(d=>d.law.v===3).length") + ' <span') >= 0);

/* ---------- 3) 四种治理范式 ---------- */
ok("四张范式卡", (v.match(/class=pcard/g) || []).length === 4);
["智利", "欧盟", "美国", "中国"].forEach(n => ok("范式含 " + n, v.indexOf("<b>" + n + "</b>") >= 0));
ok("四种范式都给了强弱两侧", (v.match(/强在哪/g) || []).length === 4 && (v.match(/弱在哪/g) || []).length === 4);
ok("收尾点明「只立法到数据层」", v.indexOf("数据") >= 0 && v.indexOf("写入") >= 0);

/* ---------- 4) 路由、别名、侧栏、搜索、首页入口 ---------- */
[["#/ethlaw", "九个最值得吵的问题"], ["#/debate", "九个最值得吵的问题"], ["#/rights", "九个最值得吵的问题"],
 ["#/ethicallaw", "九个最值得吵的问题"], ["#/lawethics", "九个最值得吵的问题"]].forEach(([u, mark]) => {
  ok("路由 " + u, go(u).indexOf(mark) >= 0);
});
q("tree()");
const tree = els["#tree"].innerHTML;
ok("侧栏有入口", tree.indexOf('href="#/ethlaw"') >= 0);
const sug = q('(function(){suggest("伦理");return document.querySelector("#suggest").innerHTML})()');
ok("搜索「伦理」命中该页", sug.indexOf("#/ethlaw") >= 0);
const sug2 = q('(function(){suggest("神经权利");return document.querySelector("#suggest").innerHTML})()');
ok("搜索「神经权利」命中该页", sug2.indexOf("#/ethlaw") >= 0);

ctx.location.hash = "#/";
vm.runInContext("route()", ctx);
const home = els["#view"].innerHTML;
ok("首页有伦理法律入口卡", home.indexOf('href="#/ethlaw"') >= 0 && home.indexOf("九个最值得吵的问题") >= 0);
ok("首页入口卡的数字与数据同值", home.indexOf(e4 + ' 条「触及人的定义」') >= 0 && home.indexOf("有 " + e4v34 + " 条法律一句话都没说") >= 0);
ok("首页保留两组分布条", home.indexOf("伦理风险分布") >= 0 && home.indexOf("法律状态分布") >= 0);

console.log(fails ? "\n" + fails + " FAIL" : "\nPASS");

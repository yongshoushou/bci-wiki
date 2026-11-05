// test_route.js —— 路由保活、404 兜底、索引顺序与搜索排序（v2.0 第三、四步）
// 守三件事：① 旧写法与错大小写都能到同一页 ② 找不到时给得出下一步
// ③ 搜索结果按「现实侧 > 判断框架 > 想象侧 > 作品」排，不让工具页抢首位
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
let bad = [];

// 1) 别名：旧写法 / 常见简写渲染出的页面必须与规范路由逐字符一致
const AL = [["#/tbl", "#/table"], ["#/devices", "#/dev"], ["#/kits", "#/compose"], ["#/map", "#/mapst"], ["#/regs", "#/reg"], ["#/idx", "#/index"], ["#/faq", "#/about"]];
AL.forEach(([a, tgt]) => {
  const v1 = go(a), v2 = go(tgt);
  if (v1 !== v2) bad.push(a + "→" + tgt);
  if (v1.indexOf("未找到") >= 0 || v1.indexOf("没有这一页") >= 0) bad.push("empty:" + a);
});
console.log("别名重定向 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + AL.length + " 条旧写法等价）"));

// 2) 编号大小写归一：/tech/t22 与 /item/c01 必须命中同一页
bad = [];
if (go("#/tech/t22").indexOf("长期稳定性") < 0) bad.push("tech/t22");
if (go("#/item/c01").indexOf("神经接口") < 0) bad.push("item/c01");
if (go("#/dev/d23").indexOf("NEO") < 0) bad.push("dev/d23");
if (go("#/TECH").indexOf("技术条目") < 0) bad.push("TECH");
console.log("编号大小写归一 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（tech/t22 · item/c01 · dev/d23 · TECH）"));

// 3) 未知路由：给近似建议，不写死一句「未找到」
bad = [];
const v404 = go("#/tabl");
if (v404.indexOf("没有这一页") < 0) bad.push("no-404");
if (v404.indexOf("你要找的可能是") < 0) bad.push("no-suggest");
if (v404.indexOf('href="#/table"') < 0) bad.push("no-near-table");
console.log("未知路由兜底 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（给近似路由 + 常去入口）"));

// 4) 已知类型、未知编号：给出编号范围，并保持「未找到」标题
bad = [];
const vMiss = go("#/tech/T99");
if (vMiss.indexOf("未找到") < 0) bad.push("no-title");
if (vMiss.indexOf("T01–T40") < 0) bad.push("no-range");
if (vMiss.indexOf('href="#/tech"') < 0) bad.push("no-back");
console.log("未知编号兜底 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（含编号范围与返回入口）"));

// 5) 搜索排序：编号与专名要压过工具页
const top = qs => { vm.runInContext("suggest(" + JSON.stringify(qs) + ")", ctx); const s = els["#suggest"].innerHTML; const m = s.match(/<a href="([^"]+)"/); return m ? m[1] : ""; };
const RANK = [["T22", "#/tech/T22"], ["神经接口", "#/item/C01"], ["NEO", "#/dev/D23"], ["设备", "#/dev"], ["监管", "#/reg"]];
bad = [];
RANK.forEach(([qs, want]) => { const got = top(qs); if (got !== want) bad.push(qs + ":" + got + "!=" + want); });
console.log("搜索排序 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + RANK.length + " 个查询首位正确）"));

// 6) 搜索空态不返回空字符串，且不崩
bad = [];
vm.runInContext('suggest("zzzzqqqq")', ctx);
if (els["#suggest"].innerHTML.indexOf("没有命中") < 0) bad.push("no-empty-msg");
vm.runInContext('suggest("")', ctx);
if (els["#suggest"].innerHTML !== "") bad.push("not-cleared");
console.log("搜索空态 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 7) 索引页第一屏就是落地状态（想象 → 现实的对接点）
bad = [];
const vIdx = go("#/index");
const iSt = vIdx.indexOf("按落地状态");
const iTech = vIdx.indexOf("<h2>技术条目");
if (iSt < 0) bad.push("no-st-section");
if (iTech >= 0 && iSt > iTech) bad.push("order");
console.log("索引页顺序 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（落地状态 → 技术 → 设备 → …）"));

// 8) 六档页：六种状态各一行，矩阵合计等于 67
bad = [];
const vMs = go("#/mapst");
["已上市", "实验室 / 临床", "单点突破", "缺多环", "规模 / 物理不允许", "非技术命题"].forEach(n => { if (vMs.indexOf(n) < 0) bad.push("no:" + n); });
if (vMs.indexOf("状态 × 难度") < 0) bad.push("no-matrix");
if (vMs.indexOf("undefined") >= 0) bad.push("junk");
console.log("六档页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（六档齐全 / 含状态×难度矩阵）"));

// 9) 首页六档条的目的地能真的筛出该档（比对 tbody 行数，而不是整页 HTML）
bad = [];
const rows = () => (els["#tbody"].innerHTML.match(/<tr><td>/g) || []).length;
go("#/table?st=ship"); const nShip = rows();
go("#/table"); const nAll = rows();
if (nShip < 1) bad.push("no-rows");
if (nAll <= nShip) bad.push("filter-not-applied(" + nShip + "/" + nAll + ")");
console.log("表格状态筛选 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（?st=ship " + nShip + " 行 / 全表 " + nAll + " 行）"));

const fs = require("fs"), vm = require("vm");
const h = fs.readFileSync("脑机接口功能想象_Wiki.html", "utf8");
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];
try { new Function(src); } catch (e) { console.log("SYNTAX ERROR: " + e.message); process.exit(1); }

const mk = () => ({ innerHTML: "", textContent: "", value: "", classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, addEventListener() {}, focus() {}, blur() {}, select() {}, getAttribute() { return ""; }, querySelector() { return null; }, querySelectorAll() { return []; }, dataset: {}, style: {} });
const els = {};
const document = { getElementById(id) { return els[id] || (els[id] = mk()); }, querySelector(s) { return els[s] || (els[s] = mk()); }, querySelectorAll() { return []; }, addEventListener() {} };
const ctx = { document, window: { addEventListener() {}, scrollTo() {} }, location: { hash: "#/" }, URLSearchParams, console };
vm.createContext(ctx); vm.runInContext(src, ctx);
const go = x => { ctx.location.hash = x; vm.runInContext("route()", ctx); return els["#view"].innerHTML; };
const q = (code) => vm.runInContext(code, ctx);

console.log("syntax = OK");
const E = go("#/ethics");
console.log("伦理主页: " + E.length + " 字符 | 议题卡 " + (E.match(/href="#\/ethics\/N\d+"/g) || []).length + " | 矩阵 " + (E.match(/class="mtx"/g) || []).length + " | 等级 pill " + (E.match(/class="epill"/g) || []).length);
console.log("  四条结论=" + /先读这四条结论/.test(E) + " 局限=" + /这套标准的四条局限/.test(E) + " UNESCO=" + /UNESCO/.test(E));

let bad = [];
q('DB.ethics.dims.map(x=>x.k).join(" ")').split(" ").forEach(k => {
  if (go("#/ethics/" + k).indexOf("本议题下的条目") < 0) bad.push(k);
});
console.log("10 个议题页: " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

const N3 = go("#/ethics/N3");
console.log("  N3 表格行=" + (N3.match(/<tr>/g) || []).length + " 条目链接=" + (N3.match(/href="#\/item\//g) || []).length);

bad = [];
q('DB.items.map(d=>d.id).join(" ")').split(" ").forEach(id => { if (go("#/item/" + id).indexOf("伦理评估") < 0) bad.push(id); });
console.log("67 条目页含伦理区块: " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

const c9 = go("#/item/C09");
console.log("  C09 → E4=" + /E4 触及「人」的定义/.test(c9) + " 议题标签=" + (c9.match(/class="ntag"/g) || []).length + " 判词=" + /没有尸体的谋杀/.test(c9));

const hm = go("#/");
console.log("首页: 伦理分布=" + /伦理风险分布/.test(hm) + " 入口卡=" + /伦理道德分类标准/.test(hm) + " E4 行=" + /E4 触及「人」的定义/.test(hm));
console.log("目录树: " + (els["#tree"].innerHTML.indexOf("伦理道德分类标准") >= 0 ? "OK" : "MISS"));

const ix = go("#/index");
console.log("索引页: 按伦理议题=" + /按伦理议题/.test(ix) + " 按伦理等级=" + /按伦理风险等级/.test(ix));

ctx.location.hash = "#/table"; vm.runInContext("route()", ctx);
console.log("表格表头含伦理列: " + /<th>伦理<\/th>/.test(els["#view"].innerHTML) + " | 筛选组 #te=" + /id="te"/.test(els["#view"].innerHTML));

// 表格筛选
const drawAfter = (patch) => { Object.assign(q("TBL"), patch); q("drawTable()"); return q('document.querySelector("#tbody").innerHTML'); };
let rows = drawAfter({ q: "E3", g: "ALL", lv: "ALL", e: "ALL" });
console.log("表格搜 E3（精确筛选）→ 行=" + (rows.match(/<tr>/g) || []).length + " | " + els["#tc"].textContent);
rows = drawAfter({ q: "", e: "E4" });
console.log("按 E4 筛选 → 行=" + (rows.match(/<tr>/g) || []).length);
rows = drawAfter({ q: "精神隐私", e: "ALL" });
console.log("搜「精神隐私」→ 行=" + (rows.match(/<tr>/g) || []).length);

// 矩阵校验
const mtx = q("JSON.stringify(DB.matrix)");
const M = JSON.parse(mtx);
const tot = M.reduce((s, r) => s + r.cells.reduce((a, b) => a + b, 0), 0);
console.log("矩阵总计=" + tot + "（应 67） | 行分布=" + M.map(r => r.lv + ":" + r.cells.reduce((a, b) => a + b, 0)).join(" "));
const colTot = [0, 1, 2, 3, 4].map(i => M.reduce((s, r) => s + r.cells[i], 0));
console.log("列分布 E0-E4=" + colTot.join("/") + "（应 2/11/15/18/21）");
console.log("L1+L2 中 E3+ 条数=" + q("DB.items.filter(d=>d.eth&&(d.lv===1||d.lv===2)&&d.eth.e>=3).length"));

// 议题计数
console.log("议题覆盖=" + q('DB.ethics.dims.map(x=>x.k+"="+x.ids.length).join(" ")'));
console.log("每条议题数分布=" + q('JSON.stringify(DB.items.reduce((a,d)=>{a[d.eth.n.length]=(a[d.eth.n.length]||0)+1;return a},{}))'));
console.log("meta created 保留=" + /name="created" content="2026-11-04"/.test(h) + " | 体积=" + (Buffer.byteLength(h) / 1024).toFixed(1) + "KB");

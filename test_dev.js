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

const devs = q('DB.dev.list.map(d=>d.k).join(" ")').split(" ");
const tiers = q('DB.dev.tiers.map(t=>t.k).join(" ")').split(" ");
const inds = q('DB.ind.list.map(x=>x.k).join(" ")').split(" ");

// 1) 设备总览：三档齐全，30 台全部成行
const ov = go("#/dev");
q('DB.dev.tiers.map(t=>t.name).join("|")').split("|").forEach(n => {
  if (ov.indexOf(n) < 0) bad.push("overview-missing-tier:" + n);
});
const devLinks = new Set((ov.match(/#\/dev\/D\d{2}/g) || []));
if (devLinks.size !== devs.length) bad.push("overview-dev-links:" + devLinks.size + "!=" + devs.length);
const cards = (ov.match(/class="dcard"/g) || []).length;
if (cards !== devs.length) bad.push("overview-cards:" + cards + "!=" + devs.length);
const secs = (ov.match(/<h2 id="(res|non|imp)"/g) || []).length;
if (secs < tiers.length) bad.push("overview-sections:" + secs + "<" + tiers.length);
console.log("设备总览页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + cards + " 张卡片 / " + tiers.length + " 档 / " + secs + " 个分段）"));

// 2) 每条设备详情：规格、局限、适应证、来源齐全，无脏值
bad = [];
devs.forEach(k => {
  const v = go("#/dev/" + k);
  ["规格", "局限", "用于哪些适应证", "来源"].forEach(sec => { if (v.indexOf(sec) < 0) bad.push(k + "-no-" + sec); });
  if (/undefined|NaN/.test(v)) bad.push(k + "-junk");
  const rows = (v.match(/<tr><th>/g) || []).length;
  if (rows < 9) bad.push(k + "-spec-rows:" + rows + "<9");
});
console.log(devs.length + " 设备详情页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 3) 设备 → 适应证 与 适应证 → 设备 双向一致
bad = [];
devs.forEach(k => {
  const d = q('DB.dev.list.filter(d=>d.k==="' + k + '")[0]');
  const v = go("#/dev/" + k);
  const should = q('DB.ind.list.filter(x=>x.dev.indexOf("' + k + '")!==-1).map(x=>x.k).join(" ")').split(" ").filter(Boolean);
  should.forEach(ik => { if (v.indexOf("#/ind/" + ik) < 0) bad.push("dev->ind:" + k + "->" + ik); });
  const shown = new Set((v.match(/#\/ind\/I\d{2}/g) || []));
  if (shown.size !== should.length) bad.push("dev->ind-count:" + k + ":" + shown.size + "!=" + should.length);
});
inds.forEach(ik => {
  const x = q('DB.ind.list.filter(x=>x.k==="' + ik + '")[0]');
  const v = go("#/ind/" + ik);
  x.dev.forEach(dk => { if (v.indexOf("#/dev/" + dk) < 0) bad.push("ind->dev:" + ik + "->" + dk); });
});
console.log("设备 ↔ 适应证 双向索引 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 4) 适应证总览：10 条成行，表头含天花板
bad = [];
const iov = go("#/ind");
inds.forEach(k => { if (iov.indexOf("#/ind/" + k) < 0) bad.push("overview-missing:" + k); });
if (iov.indexOf("现有疗法的天花板") < 0) bad.push("overview-no-ceiling-col");
console.log("适应证总览页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK（" + inds.length + " 条）"));

// 5) 每条适应证详情：六段结构 + 终点行数 + 难点条数
bad = [];
inds.forEach(k => {
  const v = go("#/ind/" + k);
  ["患者规模", "丧失了些什么", "现有治疗与它的天花板", "BCI 的介入点", "关键疗效终点", "为什么难", "可用设备", "监管与支付路径", "来源"].forEach(sec => {
    if (v.indexOf(sec) < 0) bad.push(k + "-no-" + sec);
  });
  if (/undefined|NaN/.test(v)) bad.push(k + "-junk");
  const need = q('DB.ind.list.filter(x=>x.k==="' + k + '")[0].endp.length');
  const rows = (v.match(/<tr><th>/g) || []).length;
  if (rows < need) bad.push(k + "-endp-rows:" + rows + "<" + need);
  const lis = (v.match(/<li>/g) || []).length;
  const hard = q('DB.ind.list.filter(x=>x.k==="' + k + '")[0].hard.length');
  if (lis < hard) bad.push(k + "-hard:" + lis + "<" + hard);
});
console.log(inds.length + " 适应证详情页 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 6) 关联案例可打开（设备页与适应证页两侧）
bad = [];
devs.forEach(k => {
  const d = q('DB.dev.list.filter(d=>d.k==="' + k + '")[0]');
  (d.cases || []).forEach(c => {
    const v = go("#/case/" + c);
    if (v.indexOf("案例") < 0 || /未找到/.test(v)) bad.push("case-broken:" + k + "->" + c);
    if (v.indexOf("#/dev/" + k) < 0) bad.push("case-no-backlink:" + c + "->" + k);
  });
});
console.log("设备 ↔ 案例 反向索引 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 7) 四处入口
bad = [];
[["#/", "设备与产品目录"], ["#/", "临床适应证图谱"], ["#/index", "设备目录"], ["#/about", "设备目录与适应证"], ["#/dev/D23", "#/ind/"], ["#/ind/I01", "#/dev/"]].forEach(([r, kw]) => {
  const v = go(r);
  if (v.indexOf(kw) < 0) bad.push(r + "-no-entry:" + kw);
});
console.log("首页 / 索引 / 关于 / 交叉入口 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

// 8) 404 兜底：不存在的编号要给出未找到而不是崩
bad = [];
["#/dev/D99", "#/ind/I99"].forEach(r => { const v = go(r); if (v.indexOf("未找到") < 0) bad.push(r + "-no-notfound"); });
console.log("未知编号兜底 = " + (bad.length ? "FAIL " + bad.join(",") : "OK"));

console.log("体积 = " + (h.length / 1024).toFixed(1) + "KB");

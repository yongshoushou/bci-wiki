// 生成 mapst.html：六档落地状态的**静态快照**
// 为什么要有它：站内 #/mapst 是 JS 路由渲染的，抓取、存档、打印都不友好。
// 快照用同一份 DB 渲染成无脚本的单页，带生成日期与引用块，适合贴进报告或做离线存档。
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const dir = __dirname;
const src = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const script = src.match(/<script>([\s\S]*?)<\/script>/)[1];

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
vm.runInContext(script, ctx);
const q = c => vm.runInContext(c, ctx);

const ITEMS = q("DB.items.map(d=>({id:d.id,fn:d.fn,lv:d.lv,st:d.st,gap:d.gap,flow:d.flow}))");
const ST = q("DB.mapSt");
const LVS = q("LVS.map(l=>({k:l.k,def:l.def}))");
const VER = q("VER");
const VERDATE = q("VERDATE");

const ST_ORDER = ["ship", "lab", "point", "multi", "no", "concept"];
const SITE = "https://yongshoushou.github.io/bci-wiki/";
const PAGE_URL = SITE + "#/mapst";

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lvKey = d => d.lv >= 5 ? "L5" : "L" + Math.max(1, d.lv);
// 浅色版配色：站内是深色主题，快照为打印优化，色相保持一致、明度压暗
const SC = { ship: "#1a7f37", lab: "#0969da", point: "#9a6700", multi: "#bc4c00", no: "#cf222e", concept: "#6e7781" };
const LC = { L1: "#1a7f37", L2: "#9a6700", L3: "#bc4c00", L4: "#cf222e", L5: "#8250df", Ln: "#6e7781" };

const n = {}; ST_ORDER.forEach(k => n[k] = 0);
ITEMS.forEach(d => n[d.st]++);

const lvKeys = ["L1", "L2", "L3", "L4", "L5", "Ln"];
const mtx = {};
ST_ORDER.forEach(k => {
  mtx[k] = {};
  lvKeys.forEach(l => mtx[k][l] = ITEMS.filter(d => d.st === k && lvKey(d) === l).length);
});
const shipOdd = ITEMS.filter(d => d.st === "ship" && d.lv >= 2).length;
const labLow = ITEMS.filter(d => d.st === "lab" && d.lv === 1).length;

const KEY = "bciwiki" + VER.replace(/[^0-9]/g, "") + "mapst";
const CITE_GB = `庸垨. 六档落地状态：脑机接口功能想象对照表（${VER}）[EB/OL]. ${VERDATE}. ${PAGE_URL}.`;
const CITE_BIB = `@misc{${KEY},
  author = {庸垨},
  title  = {六档落地状态：脑机接口功能想象对照表},
  year   = {${VERDATE.slice(0, 4)}},
  note   = {${VER}, 取数 ${VERDATE}},
  url    = {${PAGE_URL}}
}`;

const css = `
:root{--fg:#1f2328;--muted:#59636e;--line:#d1d9e0;--bg:#ffffff;--panel:#f6f8fa;--accent:#0969da}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:960px;margin:0 auto;padding:44px 28px 80px}
h1{font-size:30px;line-height:1.3;margin:0 0 6px;letter-spacing:-.4px}
h2{font-size:19px;margin:38px 0 10px;padding-bottom:7px;border-bottom:1px solid var(--line)}
h3{font-size:15px;margin:24px 0 8px}
.sub{color:var(--muted);font-size:13px;margin:0 0 4px}
.lead{font-size:15.5px;color:#2f3439;margin:14px 0}
.note{color:var(--muted);font-size:12.5px;line-height:1.75}
code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
pre{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:12.5px;line-height:1.7;margin:8px 0 16px;white-space:pre-wrap;word-break:break-all}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-weight:600;background:var(--panel);font-size:12px;color:var(--muted);white-space:nowrap}
td.num{font-family:ui-monospace,monospace;text-align:center}
.pill{display:inline-block;padding:1px 8px;border-radius:20px;font-size:11.5px;font-weight:600;white-space:nowrap;border:1px solid}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin:14px 0}
.card{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:13px 15px}
.card b{font-size:14px}
.card p{margin:6px 0 0;font-size:12.5px;color:var(--muted);line-height:1.7}
.mtx td{text-align:center;font-family:ui-monospace,monospace}
.mtx td.z{color:#c8d1da}
.mtx th:first-child{text-align:left}
.hd{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;border-bottom:2px solid var(--fg);padding-bottom:14px;margin-bottom:6px}
.tag{display:inline-block;font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:5px;padding:1px 7px;margin-left:6px;vertical-align:2px;font-weight:400}
footer{margin-top:46px;padding-top:16px;border-top:1px solid var(--line);color:var(--muted);font-size:12px;line-height:1.8}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.item{margin:0 0 3px;font-size:12.8px;line-height:1.65}
.item .g{color:var(--muted);font-size:11.5px}
@media print{
  body{font-size:11.5pt}
  .wrap{max-width:none;padding:0}
  h2{page-break-after:avoid}
  tr{page-break-inside:avoid}
  a{color:inherit;text-decoration:none}
  .noprint{display:none}
}
`;

let h = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>六档落地状态 · 脑机接口功能想象对照表（${VER} 快照）</title>
<meta name="version" content="${VER}">
<meta name="generated" content="${VERDATE}">
<meta name="description" content="脑机接口功能想象对照表的静态快照：67 条想象按六档落地状态（已上市/实验室/单点突破/缺多环/物理不允许/非技术命题）分类，附状态×难度矩阵与全部条目。${VER}，${VERDATE}。">
<meta property="og:title" content="六档落地状态 · 脑机接口功能想象对照表">
<meta property="og:type" content="article">
<meta property="og:description" content="67 条想象按六档落地状态分类：真正能买到的只有 ${n.ship} 条。">
<link rel="canonical" href="${PAGE_URL}">
<style>${css}</style>
</head>
<body><div class="wrap">

<div class="hd">
  <div>
    <h1>六档落地状态</h1>
    <p class="sub">脑机接口功能想象对照表 · 静态快照 · ${VER} · 取数 ${VERDATE}</p>
  </div>
  <p class="sub noprint">在线版：<a href="${PAGE_URL}">${PAGE_URL.replace("https://", "")}</a></p>
</div>

<p class="lead">这是全表唯一把<b>想象</b>与<b>现实</b>放在同一量纲上的分类。<b>它不是难度</b>——难度（L1–L5）问「原理上能不能做到」，这一层问「今天它以什么形态存在」：能买、能进临床、只有单点验证、缺多环、物理不允许，还是根本不在技术路径上。</p>
<p class="note">判定只看一条：<b>有没有可核对的存在物</b>。有型号与价格才是「已上市」；有公开演示或注册试验才算「实验室 / 临床」；只有零散环节被验证是「单点突破」；要多个尚不存在的突破叠加是「缺多环」；受已知物理与规模约束不成立是「规模 / 物理不允许」；换成任何技术都同样成立的是「非技术命题」。最后两档的区别很重要：前者是<b>这条路走不通</b>，后者是<b>压根不在这条路上</b>。</p>

<h2>六档分布</h2>
<div class="grid">
`;

ST_ORDER.forEach(k => {
  h += `<div class="card"><b style="color:${SC[k]}">${esc(ST[k].name)}　${n[k]}</b><p>${esc(ST[k].def)}</p></div>`;
});
h += `</div>\n`;

h += `<h2>状态 × 难度：两者不重合</h2>
<p class="note">如果「已上市」意味着「技术简单」，这张矩阵应该只有左上角有数。实际不是：<b>${shipOdd} 条已上市条目的难度在 L2 以上</b>，而<b>${labLow} 条「实验室 / 临床」条目的难度只有 L1</b>。原因是落地形态由<b>有没有人为它付钱</b>决定，不由原理有多难决定。</p>
<table class="mtx"><thead><tr><th>状态 ＼ 难度</th>${lvKeys.map(l => `<th style="color:${LC[l]}">${l}</th>`).join("")}<th>合计</th></tr></thead><tbody>
`;
ST_ORDER.forEach(k => {
  let tot = 0;
  const cells = lvKeys.map(l => { const c = mtx[k][l]; tot += c; return "<td" + (c ? "" : ' class="z"') + ">" + c + "</td>"; });
  h += `<tr><th style="color:${SC[k]}">${esc(ST[k].name)}</th>${cells.join("")}<td><b>${tot}</b></td></tr>\n`;
});
const colTot = lvKeys.map(l => ST_ORDER.reduce((a, k) => a + mtx[k][l], 0));
h += `<tr><th>合计</th>${colTot.map(c => `<td><b>${c}</b></td>`).join("")}<td><b>${ITEMS.length}</b></td></tr>\n`;
h += `</tbody></table>\n`;

h += `<h2>两个容易误读的地方</h2>
<div class="grid">
<div class="card"><b>「已上市」不等于「先进」</b><p>已上市条目里难度在 L2 以上的有 ${shipOdd} 条（${ITEMS.filter(d => d.st === "ship" && d.lv >= 2).map(d => d.id).join("、")}）——它们在原理上并不简单，但商业形态成立，所以「今天能买」。反过来，C02 义体控制之所以在「已上市」，靠的是脑控机械臂这条临床线，不是作品里的光学义眼。</p></div>
<div class="card"><b>「非技术命题」不是「永远做不到」</b><p>它指的是一条设定<b>换成任何技术都同样成立</b>：C15 脱离肉体以 AI 存续、C18「人性值」这类，追问的是定义而不是器件。把它们留在表里，是为了让「技术能解决什么」的边界显形——不是给它们判死刑。</p></div>
</div>

<h2>难度分级参照</h2>
<table><thead><tr><th>级别</th><th>判定定义</th><th>条数</th></tr></thead><tbody>
`;
LVS.forEach(l => {
  const c = ITEMS.filter(d => lvKey(d) === l.k).length;
  h += `<tr><td><span class="pill" style="color:${LC[l.k]};border-color:${LC[l.k]}55;background:${LC[l.k]}12">${l.k}</span></td><td class="note">${esc(l.def)}</td><td class="num">${c}</td></tr>\n`;
});
h += `</tbody></table>\n`;

h += `<h2>全部条目（按档分组）</h2>\n<p class="note">「差在哪一环」是该条想象的现实瓶颈：它可能缺<b>零件</b>（可以买、可以等），也可能缺<b>指标</b>（只能靠实验）。两者是不同类型的困境，不能互相替代。</p>\n`;
ST_ORDER.forEach(k => {
  const arr = ITEMS.filter(d => d.st === k);
  h += `<h3><span class="pill" style="color:${SC[k]};border-color:${SC[k]}55;background:${SC[k]}12">${esc(ST[k].name)}</span><span class="tag">${arr.length} 条</span></h3>\n`;
  h += `<table><thead><tr><th style="width:56px">#</th><th style="width:150px">想象</th><th style="width:44px">难度</th><th>差在哪一环</th></tr></thead><tbody>\n`;
  arr.forEach(d => {
    h += `<tr><td><a href="${SITE}#/item/${d.id}">${d.id}</a></td><td>${esc(d.fn)}</td><td class="num" style="color:${LC[lvKey(d)]}">${lvKey(d)}</td><td class="note">${esc(d.gap || "—")}</td></tr>\n`;
  });
  h += `</tbody></table>\n`;
});

h += `<h2>引用</h2>
<p class="note">引用请连同<b>版本与日期</b>一起写。六档状态随产品上市与临床进展而变，脱离版本的引用没有意义。</p>
<h3>GB/T 7714</h3><pre>${esc(CITE_GB)}</pre>
<h3>BibTeX</h3><pre>${esc(CITE_BIB)}</pre>

<h2>口径与来源</h2>
<ul class="note">
<li><b>条目与状态的唯一来源</b>是本表的 <code>ITEM_MAP</code> 数据层，在线版与本站完整表格（<a href="${SITE}#/table">#/table</a>）同源，快照由同一份数据渲染，不存在人工二次录入。</li>
<li><b>「已上市」的判定标准</b>：有在售型号且能查到价格口径，或已在监管机构取得上市许可。仅「拿到注册证但未挂网」仍计入已上市，因为可及性属于价格问题，已在设备目录单列。</li>
<li><b>难度（L1–L5 / Ln）</b>指「按设定原样实现」的难度，不是「做个神似替代品」的难度。凡涉及「复制＝本人」的一律不低于 L4。</li>
<li><b>条目总数</b> ${ITEMS.length} 条，全部有条目页；本快照只呈现分类与瓶颈，条目页含作品出处、原文引用与现实对照。</li>
<li>本站不提供时间预测。L4/L5 不随时间自动降级，六档也不会因为「某公司宣布」而自动升档。</li>
</ul>

<footer>
<p>脑机接口功能想象对照表 · ${VER} · 快照生成于 ${VERDATE} · 数据与在线版同源</p>
<p>在线版：<a href="${PAGE_URL}">${PAGE_URL}</a>　·　本站主页：<a href="${SITE}">${SITE}</a></p>
<p class="noprint">本页为打印优化的浅色版本，与站内深色主题不同；内容与 <code>#/mapst</code> 一致。</p>
</footer>

</div></body></html>
`;

const out = path.join(dir, "mapst.html");
fs.writeFileSync(out, h, "utf8");
console.log("已生成 " + path.basename(out) + "：" + Buffer.byteLength(h, "utf8").toLocaleString() + " B / " + ITEMS.length + " 条 / " + VER);

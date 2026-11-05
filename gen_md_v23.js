// 追加一节（v2.3）：§21 伦理与法律 · 九个讨论题 + 四种治理范式
// 幂等：存在则整段替换；锚点仍是 §19 的标题与「*完*」。
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const src = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({
  innerHTML: "", textContent: "", value: "",
  classList: { toggle() { }, add() { }, remove() { }, contains() { return false } },
  addEventListener() { }, querySelector() { return null }, querySelectorAll() { return []; },
  dataset: {}, style: {}
});
const els = {};
const document = { getElementById(i) { return els[i] || (els[i] = mk()); }, querySelector(s) { return els[s] || (els[s] = mk()); }, querySelectorAll() { return []; }, addEventListener() { } };
const ctx = { document, window: { addEventListener() { }, scrollTo() { } }, location: { hash: "#/" }, history: { replaceState() { } }, URLSearchParams, console };
vm.createContext(ctx); vm.runInContext(src, ctx);
const q = c => vm.runInContext(c, ctx);

const VER = q("VER"), VERDATE = q("VERDATE");
const IT = q("IT");
const DEBATE = q("DB.debate");
const PARADIGM = q("DB.paradigm");

// 与页面 debateVars 同口径的统计
const cnt = f => IT.filter(f).length;
const V = {};
V.N = IT.length;
V.e4 = cnt(d => d.eth && d.eth.e === 4);
V.e4v34 = cnt(d => d.eth && d.eth.e === 4 && d.law.v >= 3);
V.e4v2 = cnt(d => d.eth && d.eth.e === 4 && d.law.v === 2);
V.e4pct = Math.round(V.e4 / V.N * 100);
[0, 1, 2, 3, 4].forEach(i => V["v" + i] = cnt(d => d.law.v === i));
V.judged = cnt(d => d.law.v <= 2);
V.unjudged = cnt(d => d.law.v >= 3);
V.l12e3 = cnt(d => (d.lv === 1 || d.lv === 2) && d.eth.e >= 3);
["N1", "N2", "N4", "N5"].forEach(k => V[k.toLowerCase()] = cnt(d => d.eth.n.indexOf(k) !== -1));
V.n4e4 = cnt(d => d.eth.n.indexOf("N4") !== -1 && d.eth.e === 4);
V.n5e4 = cnt(d => d.eth.n.indexOf("N5") !== -1 && d.eth.e === 4);
V.j2 = cnt(d => d.law.j.indexOf("J2") !== -1);
V.j2v = cnt(d => d.law.j.indexOf("J2") !== -1 && d.law.v >= 3);

// 占位符替换（与页面同规则）
const fill = t => String(t).replace(/\{([a-zA-Z0-9]+)\}/g, (m, k) => V[k] !== undefined ? V[k] : m);
const cell = s => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
const strip = s => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

let md = "";
md += "## 21. 伦理与法律：九个最值得讨论的问题（" + VERDATE + " 新增 · v2.3）\r\n\r\n";
md += "§11–§12 给的是分类标准（议题 + 等级 + 逐条判词），这一节把它们拧成九条**值得讨论的判断**：每条一句判词、两侧各自的理由、可以点开核对的条目。页面版见 `#/ethlaw`，全部数字由 " + V.N + " 条数据实时计算。\r\n\r\n";
md += "| 关键数字 | 值 |\r\n|---|---|\r\n";
md += "| 触及「人」的定义（E4） | " + V.e4 + " 条（占 " + V.e4pct + "%） |\r\n";
md += "| 其中法律明确不作判断（V3/V4） | " + V.e4v34 + " 条 |\r\n";
md += "| 其中现行法判得清楚（V2） | " + V.e4v2 + " 条 |\r\n";
md += "| 无规定（V3） vs 违法（V2） | " + V.v3 + " 条 vs " + V.v2 + " 条 |\r\n";
md += "| 有明确判断（V0–V2） | " + V.judged + " 条，全部落在现行法上 |\r\n\r\n";

DEBATE.forEach(x => {
  md += "**" + x.k + "　" + cell(fill(x.q)) + "**\r\n\r\n";
  md += "> **" + cell(fill(x.a)) + "**\r\n\r\n";
  md += "- **伦理这一侧**：" + cell(strip(fill(x.e))) + "\r\n";
  md += "- **法律这一侧**：" + cell(strip(fill(x.l))) + "\r\n";
  md += "- **数据**：" + cell(fill(x.n)) + "；涉及条目：" + x.ids.join("、") + "\r\n\r\n";
});

md += "### 现实世界已经在动：四种治理范式\r\n\r\n";
md += "九条讲的是「想象 vs 现行法」，但真实的立法竞争已经开始了。四条路完全不同——同一款设备，在四个地方面对四套规则（截至 " + VERDATE + "）。\r\n\r\n";
md += "| 法域 | 路径 | 怎么做 | 强在哪 | 弱在哪 |\r\n|---|---|---|---|---|\r\n";
PARADIGM.forEach(p => {
  md += "| " + cell(p.name) + " | " + cell(p.tag) + "（" + cell(p.y) + "） | " + cell(strip(p.how)) + " | " + cell(strip(p.good)) + " | " + cell(strip(p.bad)) + " |\r\n";
});
md += "\r\n> **四条路的唯一共同点：全部在「数据」层面立法**——采集、存储、跨境、二次利用。没有任何一种真正处理「写入」：往脑子里放一个念头、压制一段信念、覆写一个人格，在四个法域里都找不到对应的行为类型（见 Q6 与 §12 的 J2）。**监管准备好了接手「读」，还没准备好接手「写」。**\r\n\r\n";
md += "> 口径：判词是编辑判断，不是法律意见；法条以 " + VERDATE + " 现行有效版本为准。分类标准全文见 §11（伦理）与 §12（法律）。\r\n\r\n";

// --- 写入（CRLF 统一，幂等）---
const f = path.join(dir, "脑机接口功能想象对照表.md");
let doc = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const START = "## 21. 伦理与法律";
const ANCHOR = "## 19. 作品 × 落地状态矩阵";
const END = "*完*";
const block = md.replace(/\r\n/g, "\n");
if (doc.indexOf(START) >= 0) {
  const a = doc.indexOf(START);
  const b = doc.indexOf(END, a);
  if (b < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, a) + block + doc.slice(b);
  console.log("已替换 §21");
} else {
  const i = doc.lastIndexOf(END);
  if (i < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, i) + block + doc.slice(i);
  console.log("已插入 §21");
}
// §16 指路条：把历史累积的「两张 / 四张附表」多行合并成唯一一行「五张附表」（幂等）
const GUIDE = "- **五张附表**：技术天花板与年表见 §17，价格时效核验见 §18，作品 × 落地状态矩阵见 §19，常见问题见 §20，伦理与法律的九个讨论题见 §21。";
{
  const lines = doc.split("\n");
  const kept = lines.filter(l => !/\*\*[两三四五]张附表\*\*/.test(l));
  const i = kept.findIndex(l => /^## 16\. 评估方法与免责说明/.test(l));
  if (i < 0) throw new Error("§16 标题未找到，无法放指路条");
  // 连同标题后累积的空行一起规整，保证反复运行字节稳定
  let j = i + 1;
  while (j < kept.length && kept[j].trim() === "") j++;
  kept.splice(i + 1, j - (i + 1), "", GUIDE, "");
  doc = kept.join("\n");
}
fs.writeFileSync(f, doc.replace(/\n/g, "\r\n"), "utf8");
console.log("完成：" + doc.split("\n").length + " 行 / 版本 " + VER);

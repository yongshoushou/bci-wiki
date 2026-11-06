// 追加两节（v2.2）：§19 作品 × 落地状态矩阵、§20 常见问题
// 幂等：存在则整段替换；放在「*完*」之前，不影响其它 gen_md_* 的锚点。
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
const ST = q("DB.mapSt");
const stKeys = Object.keys(ST);
const works = q("DB.works.map(w=>({key:w.key,name:w.name,sub:w.sub,ids:WM[w.key].ids}))");
const FAQ = q("FAQ");

// 每部作品的状态分布
works.forEach(w => {
  const n = {}; stKeys.forEach(k => n[k] = 0);
  w.ids.forEach(id => { const st = q("BY[" + JSON.stringify(id) + "].st"); n[st] = (n[st] || 0) + 1; });
  w.n = n; w.total = w.ids.length;
  w.real = n.ship + n.lab;
  w.pct = w.total ? Math.round(w.real / w.total * 100) : 0;
});
const rank = works.slice().sort((a, b) => b.pct - a.pct || b.real - a.real || b.total - a.total);
const mx = works.filter(w => w.key === "Matrix")[0];
const cp = works.filter(w => w.key === "CP2077")[0];
const fm = works.filter(w => w.key === "Films")[0];
const tot = works.reduce((a, w) => a + w.total, 0);
const sum = {}; stKeys.forEach(k => sum[k] = works.reduce((a, w) => a + w.n[k], 0));

const cell = s => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
const strip = s => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

let md = "";
md += "## 19. 作品 × 落地状态矩阵（2026-11-05 新增 · v2.2）\r\n\r\n";
md += "§15 是把 67 条想象逐条挂现实锚点，这一节换个看法：**按作品横切**。同一部作品里的想象，今天分别走到哪一档——这一层回答的是「我看的那部作品，到底说中了多少」。\r\n\r\n";
md += "| 作品 | 条目 | " + stKeys.map(k => ST[k].name).join(" | ") + " | 有现实形态 | 占比 |\r\n";
md += "|---|---|" + stKeys.map(() => "---").join("|") + "|---|---|\r\n";
works.forEach(w => {
  md += "| " + cell(w.name) + " | " + w.total + " | " + stKeys.map(k => w.n[k] || "·").join(" | ") + " | " + w.real + " | " + w.pct + "% |\r\n";
});
md += "| **合计** | **" + tot + "** | " + stKeys.map(k => "**" + sum[k] + "**").join(" | ") + " | **" + (sum.ship + sum.lab) + "** | **" + Math.round((sum.ship + sum.lab) / tot * 100) + "%** |\r\n\r\n";

md += "**哪部作品「预言最准」**（口径：已上市 + 实验室·临床 ÷ 总条数）\r\n\r\n";
rank.forEach((w, i) => {
  md += (i + 1) + ". **" + cell(w.name) + "** — " + w.real + " / " + w.total + " 条（" + w.pct + "%）" + (w.total < 10 ? "（样本 " + w.total + " 条，仅供参考）" : "") + "\r\n";
});
md += "\r\n> 这不是「写得好」的排名：追问哲学的作品天然得分低，而那往往正是它们的价值。\r\n\r\n";

md += "**三种创作取向**\r\n\r\n";
md += "1. **《黑客帝国》最狂。** " + mx.total + " 条里 " + (mx.n.no + mx.n.concept) + " 条落在「物理不允许 / 非技术命题」——它关心的从来不是工程，而是主体性。\r\n";
md += "2. **《赛博朋克 2077》最均衡。** " + cp.real + " 条有现实形态、" + cp.n.multi + " 条缺多环，设定里自带「技术会失败」的自觉。\r\n";
md += "3. **「预言最准」是电影组**（盗梦空间 / 源代码 / 阿凡达 / 头号玩家），" + fm.real + " / " + fm.total + " 条。但要注意口径：X08 Metaverse 与 X25 OASIS 落在「已上市」，是因为**商业形态成立**（头显 + 账户体系就是可卖的入口），不是因为全感官替代实现了。**「已上市」不等于「作品里最炫的那条成真了」。**\r\n\r\n";
md += "> 样本说明：除《赛博朋克 2077》（" + cp.total + " 条）与《黑客帝国》（" + mx.total + " 条）外，其余作品各 1–4 条，比例易受单条归类影响。逐条判定见 §15。\r\n\r\n";

md += "## 20. 常见问题（2026-11-05 新增 · v2.2）\r\n\r\n";
md += "九个最常被问到的问题。答案控制在百来字，每个数字都能在 §10–§18 里核对——这一节不加新事实，只是把全站已有内容按「普通人提问的顺序」重排一遍。\r\n\r\n";
FAQ.forEach((x, i) => {
  md += "**" + (i + 1) + ". " + cell(x[0]) + "**\r\n\r\n" + cell(strip(x[1])) + "\r\n\r\n";
});

// --- 写入（CRLF 统一，幂等）---
const f = path.join(dir, "脑机接口功能想象对照表.md");
let doc = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const START = "## 19. 作品 × 落地状态矩阵";
const END = "*完*";
const block = md.replace(/\r\n/g, "\n");
if (doc.indexOf(START) >= 0) {
  const a = doc.indexOf(START);
  const b = doc.indexOf(END, a);
  if (b < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, a) + block + doc.slice(b);
  console.log("已替换 §19–§20");
} else {
  const i = doc.lastIndexOf(END);
  if (i < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, i) + block + doc.slice(i);
  console.log("已插入 §19–§20");
}
// §16 指路条补一句（幂等）；v2.3 生成「五张附表」后不要再追加「四张附表」旧行
const guideOld = "- **两张附表**：技术天花板与年表见 §17，价格时效核验见 §18。";
const guideNew = "- **四张附表**：技术天花板与年表见 §17，价格时效核验见 §18，作品 × 落地状态矩阵见 §19，常见问题见 §20。";
if (!/\*\*[两四五]张附表\*\*/.test(doc)) {
  if (doc.indexOf(guideOld) >= 0) doc = doc.replace(guideOld, guideNew);
  else {
    const m = doc.match(/## 16\. 评估方法与免责说明[^\n]*\n/);
    if (m) doc = doc.replace(m[0], m[0] + "\n" + guideNew + "\n");
  }
}
fs.writeFileSync(f, doc.replace(/\n/g, "\r\n"), "utf8");
console.log("完成：" + doc.split("\n").length + " 行 / 版本 " + VER);

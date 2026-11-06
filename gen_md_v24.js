// 追加一节（v2.4）：§22 脑机连接 · 六类形态
// 幂等：存在则整段替换；必须排在生成链最后（v23 会重排 §21 到文末之间的整段）。
// §16 指路条由本脚本统一收口为唯一一行「六张附表」。
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
const T = q("DB.link.types"), B = q("DB.link.band"), F = q("DB.link.flows");
const cell = s => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
const strip = s => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

let md = "";
md += "## 22. 脑机连接：六类形态（" + VERDATE + " 新增 · v2.4）\r\n\r\n";
md += "§10–§14 写的是**接口**（零件、设备、适应证、监管），回答「能不能做」。这一节写的是**连接**：谁连谁、往哪个方向、什么拓扑、传得动多少、能不能断开。同一个接口，接的对象不同，结论会完全翻过来——读出光标是 V1（办手续即可），写入一个人格是 V2（违法且同意无效），脑脑共享是 V3（法律无规定）。**接口是器件问题，连接是关系问题。** 页面版见 `#/link` 与 `#/link/LK1`–`#/link/LK6`。\r\n\r\n";
md += "六类是编辑按「谁连谁」人工划分的，不是从 67 条算出来的；同一条想象可以横跨多类，卡片上的代表条目不构成互斥分组。数值全部沿用站内现实基线、案例与科技组合，唯一新增的外部事实是 BrainNet 2019（Nature Scientific Reports 9, 6115）。\r\n\r\n";

md += "### 22.1 六类总览\r\n\r\n";
md += "| 形态 | 方向 | 拓扑 | 现实状态 | 带宽量级 | 代表条目 |\r\n|---|---|---|---|---|---|\r\n";
T.forEach(x => {
  md += "| **" + x.k + " " + cell(x.name) + "** | " + cell(x.flow) + " · " + cell(x.dir) + " | " + cell(x.topo) + " | " + cell(x.status) + " | " + cell(x.band) + " | " + x.ids.length + " 条 |\r\n";
});
md += "\r\n";

md += "### 22.2 逐类：现实、差距与退出权\r\n\r\n";
T.forEach(x => {
  md += "**" + x.k + "　" + cell(x.name) + "**（" + cell(x.en) + " · " + cell(x.flow) + " · " + cell(x.dir) + " · " + cell(x.topo) + " · " + cell(x.status) + "）\r\n\r\n";
  md += "- **是什么**：" + cell(strip(x.def)) + "\r\n";
  md += "- **现实对应物**：" + cell(strip(x.real)) + (x.refs.length ? "（站内案例：" + x.refs.join("、") + "）" : "") + "\r\n";
  md += "- **带宽量级**：" + cell(strip(x.band)) + "\r\n";
  md += "- **代表作品**：" + cell(strip(x.works)) + "\r\n";
  md += "- **与作品的差距**：" + cell(strip(x.gap)) + "\r\n";
  md += "- **能不能断开**：" + cell(strip(x.quit)) + "\r\n";
  md += "- **一句判断**：" + cell(strip(x.note)) + "\r\n";
  md += "- **代表条目**：" + x.ids.join("、") + "\r\n\r\n";
});

md += "### 22.3 带宽阶梯\r\n\r\n";
md += "作品里「连上了」是一个开关，现实里是一道量级。左列是今天真实传得动的东西，右列是作品默认传得动的东西——**两者不在一个量纲上，不是「再快一点」能追上的**。\r\n\r\n";
md += "| 形态 | 现实传得动 | 作品要求 | 锚点 |\r\n|---|---|---|---|\r\n";
B.forEach(b => {
  const x = T.filter(y => y.k === b.k)[0];
  md += "| " + b.k + " " + cell(x.name) + " | " + cell(b.act) + " | " + cell(b.want) + " | " + cell(b.src) + " |\r\n";
});
md += "\r\n> 最该记住的一格是 LK4：2019 年三个人确实完成了一次脑脑协作，但每轮只传得动一个二进制决策（转 / 不转），5 组平均准确率 81.25%。把它读成「心灵感应已实现」，和把人工耳蜗读成「记忆能写入」是同一类误读——**通了，不代表传得动内容**。\r\n\r\n";

md += "### 22.4 从 67 条想象看信息流\r\n\r\n";
md += "下面是条目数据 `flow` 字段的原始分布，按条数降序。它与六类**不是一一对应**：`S` 是全感官流，`SEC` 是神经安全，`—` 是非技术命题。保留原始分布，是为了让分类的边界看得见。\r\n\r\n";
md += "| 信息流 | 条数 | 条目 |\r\n|---|---|---|\r\n";
Object.keys(F).sort((a, b) => F[b] - F[a] || a.localeCompare(b)).forEach(f => {
  const arr = q("IT.filter(d=>d.flow===" + JSON.stringify(f) + ").map(d=>d.id)");
  md += "| `" + cell(f) + "` | " + F[f] + " | " + arr.join("、") + " |\r\n";
});
md += "\r\n> 合计 67 条。写得最多的是 `M→B`（机器写进脑，17 条）与 `S`（全感官流，14 条）——**恰恰是现实最薄的两类**；而唯一拿到注册证的 `B→M` 只有 3 条。想象的重心和现实的重心是错开的。\r\n\r\n";

md += "### 22.5 能不能断开\r\n\r\n";
md += "前面每层都在问「连得上吗」，这一节问「断得开吗」。**退出权不是附加功能，它决定这条连接是工具还是依附关系。** 见 §21 第五问与 §11 的 N5。\r\n\r\n";
md += "| 形态 | 退出现状 |\r\n|---|---|\r\n";
T.forEach(x => md += "| " + x.k + " " + cell(x.name) + " | " + cell(strip(x.quit)) + " |\r\n");
md += "\r\n> N5 知情同意是全表覆盖最广的伦理议题（24 条），但 E4 里仍有 6 条同时挂着 N5；《民法典》第992条规定人格权不得放弃，同意在处分人格时自动失效。写入侧 M07 / M13 / X20 全部是 V3 无规定——**能连上、断不开、又没人管，是这一层最实际的风险组合**。反例是 M16 自我拔除：全表唯一一条法律明确站在用户一侧的。\r\n\r\n";
md += "> 口径：状态描述的是**连接形态**有没有现实对应物，不等于某条想象成真了（逐条判定见 §15）。法条与技术数值以 " + VERDATE + " 现行有效版本 / 公开报道为准。分类标准全文见 §11（伦理）、§12（法律）与 §21（九个讨论题）。\r\n\r\n";

// --- 写入（CRLF 统一，幂等）---
const f = path.join(dir, "脑机接口功能想象对照表.md");
let doc = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const START = "## 22. 脑机连接";
const END = "*完*";
const block = md.replace(/\r\n/g, "\n");
if (doc.indexOf(START) >= 0) {
  const a = doc.indexOf(START);
  const b = doc.indexOf(END, a);
  if (b < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, a) + block + doc.slice(b);
  console.log("已替换 §22");
} else {
  const i = doc.lastIndexOf(END);
  if (i < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, i) + block + doc.slice(i);
  console.log("已插入 §22");
}
// §16 指路条：删掉所有历史版本行，插唯一一行「六张附表」（幂等，含空行规整）
const GUIDE = "- **六张附表**：技术天花板与年表见 §17，价格时效核验见 §18，作品 × 落地状态矩阵见 §19，常见问题见 §20，伦理与法律的九个讨论题见 §21，脑机连接的六类形态见 §22。";
{
  const lines = doc.split("\n");
  const kept = lines.filter(l => !/\*\*[两三四五六]张附表\*\*/.test(l));
  const i = kept.findIndex(l => /^## 16\. 评估方法与免责说明/.test(l));
  if (i < 0) throw new Error("§16 标题未找到");
  let j = i + 1;
  while (j < kept.length && kept[j].trim() === "") j++;
  kept.splice(i + 1, j - (i + 1), "", GUIDE, "");
  doc = kept.join("\n");
}
fs.writeFileSync(f, doc.replace(/\n/g, "\r\n"), "utf8");
console.log("完成：" + doc.split("\n").length + " 行 / 版本 " + VER);

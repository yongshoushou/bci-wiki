// gen_md_map.js —— 从已构建的 Wiki 产物读取 DB，生成 §15「想象 ↔ 现实 对照」
// 用法：node build_wiki.js && node gen_md_tech.js && node gen_md_dev.js && node gen_md_reg.js && node gen_md_map.js
// 顺序：本脚本必须最后跑（它把评估方法顺延为 §16）
// 幂等：重复运行结果一致；行尾随原文件
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const mdPath = path.join(dir, "脑机接口功能想象对照表.md");
const html = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const m = html.match(/\/\*DB_START\*\/\nconst DB=([\s\S]*?);\n\/\*DB_END\*\//);
if (!m) throw new Error("未找到 DB 数据块，请先运行 node build_wiki.js");
const DB = JSON.parse(m[1]);

const EOL = fs.readFileSync(mdPath, "utf8").indexOf("\r\n") !== -1 ? "\r\n" : "\n";
const norm = t => t.replace(/\r\n/g, "\n").split("\n").join(EOL);

const IT = DB.items, ST = DB.mapSt;
const TSD = {};
DB.tech.list.forEach(t => { TSD[t.k] = t; });
const ORDER = ["ship", "lab", "point", "multi", "no", "concept"];

const cnt = k => IT.filter(d => d.st === k).length;
const shop = IT.filter(d => d.st === "ship").map(d => d.id);

let out = "";

out += "## 15. 想象 ↔ 现实 对照（2026-11-05 新增 · v1.5）\n\n";

out += "### 15.1 这一层为什么存在\n\n";
out += "§1–§9 是想象侧，§10–§14 是现实侧。两边各自都写全了，但中间一直缺一条线：**每一条想象，到底挂在哪些现实零件上，卡在哪一环**。缺了这条线，两边就是两本书。\n\n";
out += `本节给全部 ${IT.length} 条想象逐条补三样东西：**离落地的状态**（六档）、**差在哪一环**（一句话）、**需要的零件与卡点指标**（技术条目编号）。有案例的条目也照填——案例回答「谁在做」，锚点回答「要什么零件、卡在哪」。\n\n`;
out += "> 六档状态的含义是递进收窄的：**已上市**（买得到）→ **实验室 / 临床**（做得到，买不到）→ **单点突破**（某一环节通了）→ **缺多环**（要多个突破叠加）→ **规模 / 物理不允许**（不是没做到，是不成立）→ **非技术命题**（换任何技术都同样成立）。\n\n";

out += "### 15.2 状态分布\n\n";
out += "| 状态 | 条数 | 含义 |\n|---|---|---|\n";
ORDER.forEach(k => {
  out += `| **${ST[k].name}** | ${cnt(k)} | ${ST[k].def} |\n`;
});
out += `\n合计 ${IT.length} 条。\n\n`;
out += `一个必须说清的口径：标「已上市」的 ${cnt("ship")} 条里，只有 **C02 义体控制与感知增强** 与 **X23 神经链接驱动替身** 是脑机接口本身；M06 电话线、X08 Metaverse、X25 OASIS 这三条是网络与 VR 平台，能买到但不是 BCI。**真正能买到的脑机接口功能，是 2 条，占 3%。**\n\n`;
out += `反过来说，标「非技术命题」的 ${cnt("concept")} 条不是废条目——它们记录的是人被反复恐惧的那一类东西（人格覆写、意识备份、被系统判定），而这一类恰恰是伦理与法律层（§6、§7）最重的部分。把它们强行塞进技术路线图，才是错的。\n\n`;

out += "### 15.3 逐条对照\n\n";
out += "按作品分组。「零件」列是 §10 的技术条目编号，「指标」列是决定够不够用的评价指标编号——两者分开，是因为缺零件和零件不够好是两种不同的卡点。\n\n";

const GRP = [
  { name: "赛博朋克 2077", pre: "C" },
  { name: "黑客帝国", pre: "M" },
  { name: "其他作品", pre: "X" }
];
GRP.forEach(g => {
  const arr = IT.filter(d => d.id[0] === g.pre);
  out += `#### ${g.name}（${arr.length} 条）\n\n`;
  out += "| # | 功能 | 难度 | 离落地 | 差在哪一环 | 零件 | 指标 |\n|---|---|---|---|---|---|---|\n";
  arr.forEach(d => {
    const parts = (d.tech || []).map(k => k).join(" ") || "—";
    const mets = (d.met || []).map(k => k).join(" ") || "—";
    out += `| ${d.id} | ${d.fn} | ${d.lvs} | ${ST[d.st].name} | ${d.gap} | ${parts} | ${mets} |\n`;
  });
  out += "\n";
});

out += "### 15.4 这张表暴露的三件事\n\n";
out += `**一、能买到的东西比想象的少一个数量级。** ${IT.length} 条想象里只有 2 条是买得到的 BCI 功能，其余 65 条要么在实验室、要么缺零件、要么不成立。这个比例不是悲观的估计，是把「有 demo」和「有产品」分开算之后的结果。\n\n`;
out += `**二、卡点集中在同几个指标上。** 把 67 条的指标列横向看，出现最多的是通道数（T16）、长期稳定性（T22）、带宽（T23）。这三项恰好是 §12 里所有失败案例的共同死因——电极在 6–12 个月衰减、通道数上不去、带宽撑不住全脑尺度。换句话说，**想象侧最狂的那批条目，卡的和现实侧最朴素的那批条目是同一个地方**。\n\n`;
out += `**三、有一类条目不该被技术路线图收编。** ${cnt("concept")} 条非技术命题里，多数是「人被系统判定」「人格被覆写」这类母题。它们的价值在提问，不在实现——把它们标成「缺多环」会让人误以为再等十年就能做出来，那是对读者最不负责的一种写法。\n\n`;

// ---------- 写入 ----------
let md = fs.readFileSync(mdPath, "utf8");
md = norm(md);

const evalRe = /^## \d+\. 评估方法与免责说明/m;
const evalIdx = md.search(evalRe);
if (evalIdx === -1) throw new Error("未找到「评估方法与免责说明」章节");
let head = md.slice(0, evalIdx);
let tail = md.slice(evalIdx);

// 1) 去掉旧的 §15 对照（幂等）
const cut = head.search(/^## 15\. 想象 ↔ 现实 对照/m);
if (cut !== -1) head = head.slice(0, cut);
head = head.replace(/\s*$/, "\n\n");

// 2) 评估方法顺延为 §16
tail = tail.replace(evalRe, "## 16. 评估方法与免责说明");

// 3) 版本
const VER_SITE = (html.match(/<meta name="version" content="([^"]+)">/) || [])[1];
head = head.replace(/\*\*版本\*\*：v\d+\.\d+\.\d+/, "**版本**：v" + (VER_SITE || "1.5.0"));

// 4) 站点读法说明里的章节范围
head = head.replace(/现实侧见 §10–§1[0-9]。/, "现实侧见 §10–§15。");

// 5) 交叉引用（幂等）
if (head.indexOf("逐条对照见 §15") === -1) {
  head = head.replace("18 条监管路径见 §13，14 项可复现资源见 §14。", "18 条监管路径见 §13，14 项可复现资源见 §14，67 条逐条对照见 §15。");
}

// 6) 结论先行补第 13 条（幂等：以增补句是否存在为准）
if (head.indexOf("\n13. **把 67 条全部挂到现实零件上之后") === -1) {
  const item12 = head.split(EOL).find(l => l.indexOf("12. **把监管和可复现补上之后") === 0);
  if (item12) {
    const add = `13. **把 ${IT.length} 条全部挂到现实零件上之后，能买到的只有 2 条。** 5 条标「已上市」，但其中 3 条是网络与 VR 平台，不是脑机接口本身；真正能买到的是义体控制（C02）与神经链接驱动替身（X23），占 3%。其余：实验室 ${cnt("lab")} 条、单点突破 ${cnt("point")} 条、缺多环 ${cnt("multi")} 条、物理或规模不允许 ${cnt("no")} 条、根本不是技术命题 ${cnt("concept")} 条。最值得注意的不是这个比例，而是卡点撞车——想象侧最狂的条目和现实侧最朴素的条目，卡的都是通道数、长期稳定性、带宽。详见 §15。`;
    head = head.replace(item12 + EOL, item12 + EOL + add + EOL);
  }
}

md = norm(head + norm(out) + "\n" + tail);
fs.writeFileSync(mdPath, md, "utf8");

const lines = md.split(EOL).length;
console.log("§15 对照=" + IT.length + "（" + ORDER.map(k => k + cnt(k)).join(" ") + "）/ 文件行数=" + lines + " / 行尾=" + (EOL === "\r\n" ? "CRLF" : "LF"));

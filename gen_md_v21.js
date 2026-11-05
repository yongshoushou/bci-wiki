// 给完整版 Markdown 追加两节（v2.1）：§17 技术天花板与数值年表、§18 价格时效核验
// 幂等：若两节已存在则整段替换；放在「*完*」之前，避免干扰其它 gen_md_* 脚本的锚点。
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

const TECH = q("DB.tech.list.map(t=>({k:t.k,name:t.name,cat:t.cat,best:t.best,hist:t.hist}))");
const DEV = q("DB.dev.list.map(d=>({k:d.k,name:d.name,price:d.price,pv:d.pv,tier:d.tier}))");
const VER = q("VER");
const VERDATE = q("VERDATE");
const CAT = {}; q("DB.tech.cats").forEach(c => CAT[c.k] = c.name);

const mdCell = s => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();

const histSpan = t => {
  const y0 = parseInt(t.hist[0][0]), y1 = parseInt(t.hist[t.hist.length - 1][0]);
  return { y0, y1, span: y1 - y0 };
};
const longest = TECH.slice().sort((a, b) => histSpan(b).span - histSpan(a).span)[0];
const shortest = TECH.slice().sort((a, b) => histSpan(a).span - histSpan(b).span)[0];

let md = "";
md += "## 17. 技术天花板与数值年表（" + VERDATE + " 新增 · v2.1）\r\n\r\n";
md += "§2 的技术条目给的是「典型数值范围」，但区间不告诉你今天的天花板在哪，也不告诉你天花板是怎么涨上来的。这一节补两样：" +
  "**目前最优系统**（今天最好的是谁、好到什么数）与**数值年表**（这个数从哪一年开始变成这个数）。\r\n\r\n";
md += "年表只收可核查的里程碑：年份取首次公开报道年，数值取该报道或后续复现中的口径。\r\n\r\n";
md += "| # | 条目 | 分类 | 目前最优系统 | 关键值 | 年表跨度 | 里程碑 |\r\n";
md += "|---|---|---|---|---|---|---|\r\n";
TECH.forEach(t => {
  const s = histSpan(t);
  md += "| " + t.k + " | " + mdCell(t.name) + " | " + mdCell(CAT[t.cat]) + " | " + mdCell(t.best.sys) + " | " + mdCell(t.best.key) +
    " | " + s.y0 + "–" + s.y1 + "（" + s.span + " 年） | " + t.hist.length + " |\r\n";
});
md += "\r\n**读法三条**\r\n\r\n";
md += "1. **看斜率，不看单点。** 数字在加速，说明瓶颈在工程（可以靠投入解决）；数字多年不动，说明瓶颈在物理或生物学（投入没用）。" +
  "最典型的一对是：通道数五年涨了约 20 倍（工程瓶颈），而皮层内电极的信号半衰期十年没变（生物瓶颈）。\r\n";
md += "2. **「当时的最优值」不等于「当时能买到的」。** 年表记录的是报道里最好的一档，量产指标通常要低一档。" +
  "T05 的年表里 2024 年就有 1024 电极，但到 2026 年全球累计仍只有 27 例——这就是「报道值」与「可及性」的差距。\r\n";
md += "3. **跨度最长的不一定最难。** 跨度最长的是 " + longest.k + " " + longest.name + "（" + histSpan(longest).span + " 年），" +
  "跨度最短的是 " + shortest.k + " " + shortest.name + "（" + histSpan(shortest).span + " 年）——后者不是更简单，" +
  "是它作为工程项出现得晚。\r\n\r\n";
md += "全部 " + TECH.length + " 条共 " + TECH.reduce((a, t) => a + t.hist.length, 0) + " 个里程碑，逐条的完整年表见站点 `#/tech/{编号}` 页。\r\n\r\n";

md += "## 18. 价格时效核验（" + VERDATE + " 新增 · v2.1）\r\n\r\n";
md += "§11 的设备目录给了价格，但**价格是整份表里唯一「写下来就开始过期」的字段**。" +
  "同一台机器在院端招标、科研采购、海外采购之间能差一倍；集采与医保目录又能一夜之间把它砍掉四分之三。" +
  "所以每台价格旁边必须挂三样东西：**口径、核验月份、时效风险**。\r\n\r\n";
md += "**三档时效风险**（判定只看「下次变动由谁决定」）：\r\n\r\n";
md += "- **低**：厂商官网零售价，只在产品换代时变动。典型：Muse S、Emotiv、OpenBCI、MindWave。\r\n";
md += "- **中**：按配置报价、进口报关，汇率与批次都会传导。典型：Neuropixels、actiCHamp、g.HIamp、MEG。\r\n";
md += "- **高**：挂网价、集采、医保目录，政策一动就变；或者压根没有公开价。典型：NEO、DBS、人工耳蜗、院端康复设备。\r\n";
md += "- **—**：未上市，不存在价格，只存在「入组例数」。典型：N1、Stentrode、Connexus、北脑一号。\r\n\r\n";
const dist = { "低": 0, "中": 0, "高": 0, "—": 0 };
DEV.forEach(d => dist[d.pv.drift]++);
md += "30 台现行分布：低 " + dist["低"] + " / 中 " + dist["中"] + " / 高 " + dist["高"] + " / 无价 " + dist["—"] + "。\r\n\r\n";
md += "| # | 设备 | 价格（原文） | 口径 | 核验 | 风险 | 为什么会变 |\r\n";
md += "|---|---|---|---|---|---|---|\r\n";
const order = { "高": 0, "中": 1, "低": 2, "—": 3 };
DEV.slice().sort((a, b) => (order[a.pv.drift] - order[b.pv.drift]) || a.k.localeCompare(b.k)).forEach(d => {
  md += "| " + d.k + " | " + mdCell(d.name) + " | " + mdCell(d.price) + " | " + mdCell(d.pv.basis) + " | " + d.pv.on +
    " | " + d.pv.drift + " | " + mdCell(d.pv.why) + " |\r\n";
});
md += "\r\n**三个真实的价格变动**\r\n\r\n";
md += "1. **人工耳蜗：一次集采砍掉 75%。** 2025-03 起第五批国家组织耗材集采结果全国执行，单套（含植入体与言语处理器）" +
  "从平均 20 余万元降到约 5 万元，采购周期 3 年。同一产品、同一年的「价格」可以差四倍，取决于有没有被集采。\r\n";
md += "2. **NEO：上市 10 天进上海医保。** 2026-03 拿到三类证，挂网价约 47.5 万元，置入费 6000–6600 元/次另计。" +
  "这是特例不是常态——多数创新器械进目录要走 1–3 年。看到「已上市」，要接着问「本省挂网了吗、报销多少」。\r\n";
md += "3. **Precision Layer 7：510(k) 不等于能长期植入。** 1024 个电极，2025 年拿到 510(k)，" +
  "但覆盖的只是术中 30 天临时使用。这不是价格问题，是「能买」的边界问题：买得到，不等于能一直戴着。\r\n\r\n";
md += "**引用价格的四条纪律**\r\n\r\n";
md += "1. **带口径。**「约 5 万元」必须写成「集采中选价，含植入体与言语处理器，2025-03 起执行」；否则读者会以为手术费也含在内。\r\n";
md += "2. **带月份。** 挂网价与集采价按批次执行，写 2024 年和写 2025 年是两个数。\r\n";
md += "3. **区分「设备价」与「治疗总费用」。** 植入类真实支出 = 器件 + 置入/手术 + 住院 + 术后程控 + 可能的更换，器件往往只是一半。\r\n";
md += "4. **未上市的不要编价。** 任何「预计售价」都是传闻；这类设备只该引用通道数、入组例数与随访时长。\r\n\r\n";

// --- 写入（CRLF 统一，幂等）---
const f = path.join(dir, "脑机接口功能想象对照表.md");
let doc = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const md19Safe = doc.indexOf("## 19. 作品 × 落地状态矩阵") >= 0;
const START = "## 17. 技术天花板与数值年表";
const END = md19Safe ? "## 19. 作品 × 落地状态矩阵" : "*完*";
const block = md.replace(/\r\n/g, "\n");
if (doc.indexOf(START) >= 0) {
  const a = doc.indexOf(START);
  const b = doc.indexOf(END, a);
  if (b < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, a) + block + doc.slice(b);
  console.log("已替换 §17–§18");
} else {
  const i = doc.lastIndexOf(END);
  if (i < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, i) + block + doc.slice(i);
  console.log("已插入 §17–§18");
}
// §16 首行加一张指路条（幂等）
const guide = "- **两张附表**：技术天花板与年表见 §17，价格时效核验见 §18。\n";
if (doc.indexOf("**两张附表**") < 0) {
  const m = doc.match(/## 16\. 评估方法与免责说明[^\n]*\n/);
  if (m) doc = doc.replace(m[0], m[0] + "\n" + guide);
}
fs.writeFileSync(f, doc.replace(/\n/g, "\r\n"), "utf8");
console.log("完成：", (doc.split("\n").length) + " 行");

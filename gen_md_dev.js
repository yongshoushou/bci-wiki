// gen_md_dev.js —— 从已构建的 Wiki 产物读取 DB，生成 §11 设备目录与 §12 适应证图谱
// 用法：node build_wiki.js && node gen_md_dev.js
// 幂等：重复运行结果一致；行尾随原文件（避免半文件 LF / 半文件 CRLF）
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

const D = DB.dev.list, TIERS = DB.dev.tiers, I = DB.ind.list;
const EVN = { 1: "E1 监管批准 / 上市", 2: "E2 同行评议", 3: "E3 注册临床 / 官方披露", 4: "E4 厂商宣称 / 媒体" };

let out = "";

// ---------- §11 ----------
out += "## 11. 设备与产品目录（2026-11-05 新增 · v1.2）\n\n";
out += "### 11.1 这一层为什么存在\n\n";
out += "§10 的技术条目回答「这类方法怎么工作」，但读者真正会问的下一个问题是：**今天花多少钱、走什么流程，能拿到一台什么机器**。\n\n";
out += `本节收 **${D.length} 台设备**，分三档：` + TIERS.map(t => `${t.name} ${t.ids.length}`).join("、") + "。每台固定给七项：**通道数 / 采样率 / 侵入性 / 认证状态 / 价格口径 / 一句话定位 / 局限**。\n\n";
out += "选这一层的理由很简单：**产品目录是最不容易撒谎的一层**。价格、注册证号、入组例数、挂网编码都能查；相比之下，「精度提升 30%」「实现意念控制」这类说法无法核验。\n\n";
out += "> 与 §10 的分工：技术条目按「方法」组织（模态、范式、指标、算法、器件），设备目录按「产品」组织。同一个方法可以对应十几台机器，同一台机器也常横跨多种方法。Wiki 版本见 `#/dev` 与 `#/ind`。\n\n";

out += "### 11.2 三档：钱、风险与认证的三条分界线\n\n";
out += "| 档位 | 台数 | 典型通道 | 典型价格 | 认证状态 |\n|---|---|---|---|---|\n";
out += `| 科研级 | ${TIERS[0].ids.length} | 4–5120 记录点 | 1 万美元 – 数百万美元 | 科研用，无医疗器械认证 |\n`;
out += `| 非侵入 · 消费与康复 | ${TIERS[1].ids.length} | 1–16 通道 | 100 美元 – 数十万元人民币 | 消费电子免注册；康复类走二类证 |\n`;
out += `| 植入与介入 | ${TIERS[2].ids.length} | 8–1684 通道 | 未上市（试验免费）– 47.5 万元 | 三类证 / IDE / 510(k) 限 30 天 |\n\n`;
out += "三条分界线值得单独记住：\n\n";
out += "1. **价格跨三个数量级。** 单通道玩具 100 美元，科研级放大器 5 万欧元，植入式系统 47.5 万元人民币——它们都被叫作「脑机接口」。不给价格谈性能，等于不谈。\n";
out += "2. **认证不是性能证明。** 全球第一个拿到三类证的 NEO 只有 8 个导联；1024 电极的 Precision Layer 7 只被允许在术中贴 30 天。证证明的是「安全且有效到可以收费」，不是「最好」。\n";
out += "3. **「未上市」与「不存在」是两件事。** Neuralink、Synchron、Paradromics 都已在人体内工作多年，但一台也买不到——它们只在试验里，患者不付费，也不能自选。\n\n";

out += "### 11.3 全部条目\n\n";
TIERS.forEach(t => {
  const arr = D.filter(d => d.tier === t.k);
  out += `#### ${t.name}（${arr.length} 台）\n\n`;
  out += `${t.desc}\n\n`;
  arr.forEach(d => {
    out += `**${d.k} · ${d.name}**（${d.en}）\n\n`;
    out += `- **厂商 / 国别 / 年份**：${d.vendor} · ${d.country} · ${d.y}\n`;
    out += `- **通道数**：${d.ch}\n`;
    out += `- **采样 / 速率**：${d.fs}\n`;
    out += `- **侵入性**：${d.inv}\n`;
    out += `- **认证状态**：${d.cert}\n`;
    out += `- **价格**：${d.price}\n`;
    out += `- **定位**：${d.pos}\n`;
    out += `- **局限**：${d.limit}\n`;
    out += `- **用到的技术条目**：${(d.tech || []).join(" ") || "—"}\n`;
    out += `- **对应案例**：${(d.cases || []).join(" ") || "—"}\n`;
    out += `\n`;
  });
});

out += "### 11.4 这一层暴露的三件事\n\n";
out += "1. **能开处方的只有一台。** 30 台设备里，拿到上市许可、可以收费、能进医保的只有 NEO 一个。其余 29 台不是不存在，是**买不到**：要么在试验里，要么只卖给实验室，要么需要医院单独立项。\n";
out += "2. **通道数的军备竞赛已经跑过临床需求。** 从 8 导联（NEO）到 1684 通道（Connexus），通道数涨了两百倍；但真正拿到证的适应证仍然只有「抓握」。多出来的通道目前主要买的是「更准、更少校准漂移」，不是「更多功能」。\n";
out += "3. **非侵入这一档最混乱，也最容易被包装。** 100 美元的玩具和 4.6 万元的康复设备同处一档，都叫「脑机接口」。区分它们的不是通道数，而是**有没有做闭环、有没有临床终点、有没有证**。\n\n";

// ---------- §12 ----------
out += "## 12. 临床适应证图谱（2026-11-05 新增 · v1.2）\n\n";
out += "### 12.1 换一个起点\n\n";
out += "前面十节都从技术或作品出发。这一节从**患者**出发：`" + I.length + "` 个真实群体，他们失去了什么、现有疗法卡在哪、BCI 到底补上了哪一段。\n\n";
out += "判断标准只有一条：**现有疗法已经做到哪一步**。够用的地方，BCI 就没有位置；有明确天花板的地方，才值得投入。\n\n";
out += `这 ${I.length} 个适应证里，只有 1 个已有上市产品（颈段脊髓损伤手功能），其余全部在注册临床或研究阶段。\n\n`;

out += "### 12.2 总览\n\n";
out += "| # | 适应证 | 中国患者规模 | 证据 | 现有疗法的天花板 |\n|---|---|---|---|---|\n";
I.forEach(x => {
  out += `| ${x.k} | **${x.name}** | ${x.pop} | ${EVN[x.ev] || x.ev} | ${x.now.length > 80 ? x.now.slice(0, 80) + "…" : x.now} |\n`;
});
out += "\n";

out += "### 12.3 逐条\n\n";
I.forEach(x => {
  out += `#### ${x.k} · ${x.name}（${x.en}）\n\n`;
  out += `- **患者规模（中国）**：${x.pop}\n`;
  out += `  - 口径：${x.popNote}\n`;
  out += `- **丧失了些什么**：${x.loss}\n`;
  out += `- **现有治疗与天花板**：${x.now}\n`;
  out += `- **BCI 的介入点**：${x.bci}\n`;
  out += `- **证据等级**：${EVN[x.ev] || x.ev}\n`;
  out += `- **关键疗效终点**：\n`;
  x.endp.forEach(e => { out += `  - **${e[0]}**：${e[1]}\n`; });
  out += `- **为什么难**：\n`;
  x.hard.forEach((h, i) => { out += `  ${i + 1}. ${h}\n`; });
  out += `- **可用设备**：${x.dev.join(" ")}\n`;
  out += `- **依赖的技术条目**：${(x.tech || []).join(" ") || "—"}\n`;
  out += `- **现实案例**：${(x.cases || []).join(" ") || "—"}\n`;
  out += `- **监管与支付路径**：${x.reg}\n`;
  out += `- **来源**：${x.src}\n\n`;
});

out += "### 12.4 这张表暴露的三件事\n\n";
out += "1. **需求最大的地方，证据最薄。** 卒中后上肢康复的人群超过 1500 万，是 ALS 的两百倍；但真正拿到三类证的 BCI 产品，在卒中方向几乎为零。原因不是不需要，而是**植入类器械做不了大规模随机对照**，而非侵入类又难做出可重复的疗效。\n";
out += "2. **最成功的 BCI 不是「读」，是「写」。** 人工耳蜗累计超过 100 万例，是全球唯一大规模普及的神经接口。它不需要解码任何意图，只需要把声音编码成电脉冲。这条经验在讨论「脑机接口什么时候普及」时几乎总被跳过。\n";
out += "3. **证据等级与临床价值不是一回事。** NEO 有注册证（E1），但它只解「抓握」；ALS 的语音解码还停在论文层面（E2），却已经能让人以每分钟 60–80 词说话。对闭锁患者来说，后者改变的东西更多。\n\n";

out += "> 本节与 §11 双向互链：设备页列出它服务的适应证，适应证页列出可用设备。Wiki 版本见 `#/ind`。\n\n";

// ---------- 写入 ----------
let md = fs.readFileSync(mdPath, "utf8");
md = norm(md);

// 1) 去掉旧的两节（幂等）
const evalRe = /^## \d+\. 评估方法与免责说明/m;
const evalIdx = md.search(evalRe);
if (evalIdx === -1) throw new Error("未找到「评估方法与免责说明」章节");
let head = md.slice(0, evalIdx);
let tail = md.slice(evalIdx);
const cut = head.search(/^## (11|12)\. (设备与产品目录|临床适应证图谱)/m);
if (cut !== -1) head = head.slice(0, cut);
head = head.replace(/\s*$/, "\n\n");

// 2) 评估方法顺延为 §13
tail = tail.replace(evalRe, "## 13. 评估方法与免责说明");

// 3) 版本与交叉引用
head = head.replace(/\*\*版本\*\*：v1\.\d+\.\d+/, "**版本**：v1.2.0");
if (head.indexOf("30 台设备见 §11") === -1) {
  head = head.replace("40 条技术条目见 §10。", "40 条技术条目见 §10，30 台设备见 §11，10 个适应证见 §12。");
}

// 4) 结论先行补第 11 条（幂等：以增补句本身的存在为准）
if (head.indexOf("\n11. **补上设备目录之后") === -1) {
  const item10 = head.split("\n").find(l => l.indexOf("10. **技术层补上之后") === 0);
  if (item10) {
    const add = "11. **补上设备目录之后，「能不能买」成了最硬的一道筛子。** 30 台设备里，拿到上市许可、可以收费、能进医保的只有 NEO 一台；其余 29 台不是不存在，是买不到——在试验里、只卖实验室、或需单独立项。10 个适应证里也只有 1 个有上市产品。价格从 100 美元的玩具到 47.5 万元的植入系统，跨三个数量级，而它们都被叫作「脑机接口」。详见 §11 与 §12。";
    head = head.replace(item10 + "\n", item10 + "\n" + add + "\n");
  }
}

md = head + norm(out) + "\n" + tail;
fs.writeFileSync(mdPath, md, "utf8");

const lines = md.split(EOL).length;
console.log("§11 设备=" + D.length + "（" + TIERS.map(t => t.k + t.ids.length).join(" ") + "）/ §12 适应证=" + I.length +
  " / 文件行数=" + lines + " / 行尾=" + (EOL === "\r\n" ? "CRLF" : "LF"));

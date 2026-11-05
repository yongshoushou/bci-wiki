// gen_md_reg.js —— 从已构建的 Wiki 产物读取 DB，生成 §13 监管与准入路径、§14 可复现层
// 用法：node build_wiki.js && node gen_md_reg.js
// 顺序：build → gen_md_tech → gen_md_dev → gen_md_reg（本脚本最后跑，负责把版本号落到 v1.3.0）
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

const G = DB.reg.list, GG = DB.reg.groups;
const O = DB.rep.list, OG = DB.rep.groups;

let out = "";

// ---------- §13 监管与准入路径 ----------
out += "## 13. 监管与准入路径（2026-11-05 新增 · v1.3）\n\n";
out += "### 13.1 这一层为什么存在\n\n";
out += "§10 回答「怎么做到」，§11 回答「买哪台」。但这两层都绕过了最后一个问题：**怎么合法地卖、怎么合法地收钱、要等多久**。\n\n";
out += `本节收 **${G.length} 条路径**，分五组：` + GG.map(g => `${g.name} ${g.ids.length}`).join("、") + "。每条固定给：谁要走、怎么走、**可核对的法定时限与费用**、真正的卡点、常见失效情形。\n\n";
out += "这一层只有一条主线，看懂它就够一半：\n\n";
out += "> **法定时限和真实周期差 3–10 倍，差额不在审评，在「不计入时限」的那几项。**\n\n";
out += "NMPA 三类器械的法定技术审评是 **90 个工作日**，实际要 **2–4 年**；FDA 的 PMA 法定 **180 天**，实际 **298–320 天**；510(k) 法定 **90 天**，2025 年实际中位 **126 天**。法规写的是「审多久」，没写的是「补资料、整改、开会、中止」各占多久——而后者才是真实周期。看任何一条路径，先找它的「不计入」条款。\n\n";
out += "> 与 §11、§12 的分工：设备页与适应证页都在讲「有没有这个能力」，监管页只讲「能不能卖」。三者的判断可以完全相反——能力最强的设备（1024 电极的 Layer 7）拿的是最窄的许可（限术中 30 天），能力最弱的（8 导联的 NEO）拿的是唯一的上市证。\n\n";

out += "### 13.2 五组总览\n\n";
GG.forEach(g => {
  out += `#### ${g.name}（${g.en}· ${g.ids.length} 条）\n\n`;
  out += g.desc + "\n\n";
  out += "| # | 路径 | 管辖 | 关键数字 |\n|---|---|---|---|\n";
  G.filter(x => x.grp === g.k).forEach(x => {
    out += `| ${x.k} | ${x.name}（${x.en}） | ${x.juris} | ${x.head} |\n`;
  });
  out += "\n";
});

out += "### 13.3 逐条：怎么走、卡在哪\n\n";
GG.forEach(g => {
  out += `#### ${g.name}\n\n`;
  G.filter(x => x.grp === g.k).forEach(x => {
    out += `**${x.k} · ${x.name}**（${x.en} ｜ 管辖：${x.juris}）\n\n`;
    out += `- **谁要走**：${x.who}\n`;
    out += "- **怎么走**：\n";
    x.steps.forEach((s, i) => { out += `  ${i + 1}. ${s}\n`; });
    out += "\n| 关键数字 | 值 |\n|---|---|\n";
    x.vals.forEach(v => { out += `| ${v[0]} | ${v[1]} |\n`; });
    out += `\n**卡点**：${x.gate}\n\n`;
    out += "**常见失效**：\n";
    x.fail.forEach(s => { out += `- ${s}\n`; });
    if (x.dev.length) out += `\n涉及设备：${x.dev.join("、")}。`;
    if (x.ind.length) out += `涉及适应证：${x.ind.join("、")}。`;
    out += `\n\n来源：${x.src}\n\n`;
  });
});

out += "### 13.4 读这一层的三条纪律\n\n";
out += "1. **拿证 ≠ 能收钱。** 证只解决「能卖」，收费要另走价格立项、省级定价、医保目录三步。2025-03 国家医保局在《神经系统类医疗服务价格项目立项指南（试行）》里为脑机接口单独立了三个项目；2025-03-31 湖北率先定出政府指导价（置入 6552 元/次、取出 3139 元/次、非侵入适配 966 元/次）；浙江把相关服务纳入医保支付。三步是分开的，别混成一句「已经进医保了」。\n";
out += "2. **定价 ≠ 耗材价。** 6552 元是**手术服务费**，NEO 的 **47.5 万元**是耗材挂网价，两者差两个数量级。做市场测算时把这两个数字搞混，结论会错得很整齐。\n";
out += "3. **监管分岔决定商业模式。** 同一个硬件，卒中康复不用 AI 走二类、用了 AI 升三类（2026-06《脑机接口医疗器械产品分类界定指导原则》）。这决定你两年拿证还是四年拿证，也决定这轮融资够不够烧到那时候。产品定义怎么写，等于选哪条路。\n\n";
out += "> Wiki 版本见 `#/reg`；设备页与适应证页会反向列出约束它们的路径。\n\n";

// ---------- §14 可复现层 ----------
out += "## 14. 可复现层（2026-11-05 新增 · v1.3）\n\n";
out += "### 14.1 这一层为什么存在\n\n";
out += `这一层不提供结论，只提供**检验结论的工具**：${O.length} 项公开数据集、工具链与评测协议，以及一张判断「这个结果能不能复现」的清单。\n\n`;
out += "BCI 领域有一个公开的秘密：**九个人、两个场次，就能成为「国际基准」。** 这不是研究者偷懒，是侵入式数据本身就极难获取。所以读任何结果之前，先问三个问题——数据在不在、划分方式是哪一档、失败受试者报没报。\n\n";
out += "> 与前几层的分工：§10–§13 讲「世界是什么样的」，§14 讲「凭什么相信这句话」。它是全站唯一一层对**别人给的数字**下判断的地方。\n\n";

out += "### 14.2 四组总览\n\n";
OG.forEach(g => {
  out += `#### ${g.name}（${g.en}· ${g.ids.length} 项）\n\n`;
  out += g.desc + "\n\n";
  out += "| # | 条目 | 英文 | 规模 / 体量 |\n|---|---|---|---|\n";
  O.filter(x => x.grp === g.k).forEach(x => {
    out += `| ${x.k} | ${x.name} | ${x.en} | ${x.scale} |\n`;
  });
  out += "\n";
});

out += "### 14.3 逐条：能做什么、不能做什么\n\n";
OG.forEach(g => {
  out += `#### ${g.name}\n\n`;
  O.filter(x => x.grp === g.k).forEach(x => {
    out += `**${x.k} · ${x.name}**（${x.en}）\n\n`;
    out += `${x.what}\n\n`;
    out += `- **规模**：${x.scale}\n`;
    out += `- **获取**：${x.access}\n`;
    out += `- **适合做什么**：${x.use}\n`;
    out += `- **不能做什么**：${x.limit}\n\n`;
    out += "| 关键数字 | 值 |\n|---|---|\n";
    x.vals.forEach(v => { out += `| ${v[0]} | ${v[1]} |\n`; });
    if (x.tech.length) out += `\n相关技术条目：${x.tech.join("、")}。`;
    if (x.cases.length) out += `相关现实案例：${x.cases.join("、")}。`;
    out += `\n\n来源：${x.src}\n\n`;
  });
});

out += "### 14.4 读结果的四道检查\n\n";
out += "读完任何一篇 BCI 论文或任何一份产品材料，按这四道过一遍：\n\n";
out += "1. **先看划分方式。** WithinSession、CrossSession、CrossSubject 之间的差距常有 **15–25 个百分点**。同一篇论文换成跨受试者，结论可能反转。不写档位的准确率，等于没写。\n";
out += "2. **再找机会水平。** 二分类 50%、四分类 25%。一个「准确率 62%」的四分类结果，离瞎猜只差 37 个百分点——听起来比实际好得多。\n";
out += "3. **看预处理有没有泄漏。** 滤波、归一化、去伪迹如果是在**全量数据**上做，再划分训练/测试，测试集的信息已经漏进训练集了。正确做法是只在训练集上拟合参数。\n";
out += "4. **最后看失败受试者。** 运动想象有 **15–30%** 的人「用不了 BCI」。只报成功者的研究，把最需要帮助的那部分人藏起来了。\n\n";
out += "中国的情况需要单独说明：**NEO、北脑一号、脑虎、WRS 01 均未公开原始数据**。这不等于结果不可信，但意味着任何引用都只能引用「团队自己的说法」，无法外部验证。在综述与方法学讨论里，这一点必须标出来。\n\n";
out += "> Wiki 版本见 `#/rep`；数据集与工具链标注了它们对应的技术条目。\n\n";

// ---------- 写入 ----------
let md = fs.readFileSync(mdPath, "utf8");
md = norm(md);

const evalRe = /^## \d+\. 评估方法与免责说明/m;
const evalIdx = md.search(evalRe);
if (evalIdx === -1) throw new Error("未找到「评估方法与免责说明」章节");
let head = md.slice(0, evalIdx);
let tail = md.slice(evalIdx);

// 1) 去掉旧的 §13 §14（幂等）
const cut = head.search(/^## (13|14)\. (监管与准入路径|可复现层)/m);
if (cut !== -1) head = head.slice(0, cut);
head = head.replace(/\s*$/, "\n\n");

// 2) 评估方法顺延为 §15
tail = tail.replace(evalRe, "## 15. 评估方法与免责说明");

// 3) 版本
head = head.replace(/\*\*版本\*\*：v\d+\.\d+\.\d+/, "**版本**：v1.3.0");

// 4) 交叉引用（幂等：以目标串是否存在为准）
if (head.indexOf("18 条监管路径见 §13") === -1) {
  head = head.replace("10 个适应证见 §12。", "10 个适应证见 §12，18 条监管路径见 §13，14 项可复现资源见 §14。");
}

// 5) 结论先行补第 12 条（幂等：以增补句本身的存在为准）
if (head.indexOf("\n12. **把监管和可复现补上之后") === -1) {
  const item11 = head.split(EOL).find(l => l.indexOf("11. **补上设备目录之后") === 0);
  if (item11) {
    const add = "12. **把监管和可复现补上之后，能查的都查完了，剩下的是没法查的。** 18 条路径里有 11 条能给出法定时限，12 条能给出费用或周期；但 14 项可复现资源里，没有一项是中国的侵入式临床数据——NEO、北脑一号、脑虎、WRS 01 的原始记录全部不公开。这意味着国内最硬的那批结果，目前只能引用团队自己的说法。详见 §13 与 §14。";
    head = head.replace(item11 + EOL, item11 + EOL + add + EOL);
  }
}

md = norm(head + norm(out) + "\n" + tail);   // 末尾统一行尾，避免各生成器留下的纯 LF 空行
fs.writeFileSync(mdPath, md, "utf8");

const lines = md.split(EOL).length;
console.log("§13 监管=" + G.length + "（" + GG.map(g => g.k + g.ids.length).join(" ") + "）/ §14 可复现=" + O.length +
  "（" + OG.map(g => g.k + g.ids.length).join(" ") + "）/ 文件行数=" + lines + " / 行尾=" + (EOL === "\r\n" ? "CRLF" : "LF"));

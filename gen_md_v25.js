// 追加一节（v2.5）：§23 脑机向外连了什么（AI 结合 / 游戏 UI 投射）
// 幂等：存在则整段替换；必须排在生成链最后（v24 会重排 §22 到文末之间的整段）。
// §16 指路条由本脚本统一收口为唯一一行「七张附表」。
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const src = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({ innerHTML: "", textContent: "", value: "", classList: { toggle() { }, add() { }, remove() { }, contains() { return false } }, addEventListener() { }, querySelector() { return null }, querySelectorAll() { return []; }, dataset: {}, style: {} });
const els = {};
const document = { getElementById(i) { return els[i] || (els[i] = mk()); }, querySelector(s) { return els[s] || (els[s] = mk()); }, querySelectorAll() { return []; }, addEventListener() { } };
const ctx = { document, window: { addEventListener() { }, scrollTo() { } }, location: { hash: "#/" }, history: { replaceState() { } }, URLSearchParams, console };
vm.createContext(ctx); vm.runInContext(src, ctx);
const q = c => vm.runInContext(c, ctx);

const VER = q("VER"), VERDATE = q("VERDATE");
const O = q("DB.out");
const cell = s => String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
const strip = s => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

let md = "";
md += "## 23. 脑机向外连了什么（" + VERDATE + " 新增 · v2.5）\r\n\r\n";
md += "§22 问「谁连谁」，这一节问**连出去之后接的是什么系统**。接口是器件，连接是关系，而接出去的对象决定这条链路最后变成什么：一个输入法、一层 UI、一个代理，还是一个主体。两块重点——**与 AI 的结合**、**向人眼投射类似游戏 UI 的技术**——现实与想象两侧并列写，左边是今天已经做出来的（带日期与证据性质），右边是作品里默认成立的（带条目编号）。页面版见 `#/out`、`#/out/ai`、`#/out/hud`。\r\n\r\n";

md += "### 23.1 六类外部对象\r\n\r\n";
md += "| 对象 | 现实这一侧 | 想象这一侧 | 状态 |\r\n|---|---|---|---|\r\n";
O.topics.forEach(x => {
  md += "| **" + x.k + " " + cell(x.name) + "**" + (x.focus ? "（重点）" : "") + " | " + cell(strip(x.real)) + " | " + cell(strip(x.imagine)) + " | " + cell(x.status) + " |\r\n";
});
md += "\r\n> 不是互斥分类，同一条想象可以同时接多个对象。代表作品与条目清单见站点页面。\r\n\r\n";

md += "### 23.2 重点一：脑机 × AI——AI 在链路里的四个位置\r\n\r\n";
md += "现实里 **AI 是管道**：没有解码器、自校准和语义补全，今天的 BCI 连一个稳定的光标都给不出来。作品里 **AI 是角色**：人格、反派、神明、墙后的东西。\r\n\r\n";
O.ai.forEach(x => {
  md += "**" + x.k + "　" + cell(x.name) + "**（" + cell(x.where) + " · " + cell(x.date) + " · " + cell(x.ev) + "）\r\n\r\n";
  md += "- **现实**：" + cell(strip(x.real)) + "\r\n";
  md += "- **想象**：" + cell(strip(x.imagine)) + "\r\n";
  md += "- **差在哪**：" + cell(strip(x.gap)) + "\r\n";
  md += "- **一句判断**：" + cell(strip(x.note)) + "\r\n";
  md += "- **对应条目**：" + x.ids.join("、") + "\r\n\r\n";
});
md += "**三条判断**\r\n\r\n";
md += "1. **现实是管道，作品是角色。** 现实 BCI 离开深度学习几乎不能工作，但这一层在作品里几乎不出现——训练几周、每天重校准、信号会漂移，不好看。作品把算力写成了「它有自己的想法」。\r\n";
md += "2. **AI 放大的不是智能，是带宽。** LK1 约 10 bit/s、LK4 每轮约 1 bit，工程上目前唯一有效的解法不是提带宽，而是让模型把 1 次点击扩成一句话（A2）。代价立刻落到 N2 认知自由与 X20：这句替我说的话，有多少是我想的？\r\n";
md += "3. **两块重点在「上下文」这里合流。** Apple BCI HID 的双向回传把屏幕状态与 UI 元素喂给解码器——脑机真正参与 UI 的地方不是显示，而是**知道屏幕上有什么**。\r\n\r\n";
md += "**现实锚点时间线**\r\n\r\n";
md += "| 时间 | 事件 | 性质 |\r\n|---|---|---|\r\n";
[["2024-07", "Synchron 公布接入 OpenAI 生成模型：候选回复 + 一次意念点击", "厂商公告"],
 ["2025-01", "Synchron × NVIDIA Holoscan：信号处理迁到边缘 AI 平台", "厂商公告"],
 ["2025-03", "GTC 发布 Chiral「认知 AI 脑基础模型」与 Cosmos/Omniverse 仿真训练；现场演示 ALS 患者意念控家居", "会议演示"],
 ["2025-05-13", "Apple 公布 BCI HID 协议，神经输入成为原生输入模态；协议双向回传 UI 状态", "厂商公告"],
 ["2026-10-01", "Neuralink 博客：5 万小时无标注脑数据自监督预训练，解码器数周免重校准、报 11.32 bit/s", "厂商公告"]]
  .forEach(x => md += "| " + x[0] + " | " + cell(x[1]) + " | " + x[2] + " |\r\n");
md += "\r\n";

md += "### 23.3 重点二：向人眼投射游戏 UI——两条路线\r\n\r\n";
md += "「眼睛里浮出一层界面」是赛博朋克最标志性的镜头。现实里它分成**两条完全不同的路线**：一条把光叠在视野上（消费电子，已上市），一条把信号写进视觉通路（神经外科，只到光点级）。作品把两者拍成同一个镜头。\r\n\r\n";
O.hud.forEach(x => {
  md += "**" + x.k + "　" + cell(x.name) + "**（" + cell(x.date) + " · " + cell(x.ev) + "）\r\n\r\n";
  md += "- **现实**：" + cell(strip(x.real)) + "\r\n";
  md += "- **想象**：" + cell(strip(x.imagine)) + "\r\n";
  md += "- **差在哪**：" + cell(strip(x.gap)) + "\r\n";
  md += "- **一句判断**：" + cell(strip(x.note)) + "\r\n";
  md += "- **对应条目**：" + x.ids.join("、") + "\r\n\r\n";
});
md += "**三条判断**\r\n\r\n";
md += "1. **游戏 HUD 今天就能做，靠光学不靠脑机。** 视野角落小窗、波导 AR 全屏叠层、激光直投视网膜都是现成技术；不碰脑就绕开了绝大多数神经相关规制——这是 §19 那句「已上市不等于作品里最炫那条成真」的又一个实例。\r\n";
md += "2. **差的是约束，不是画面。** 现实光学叠加受阳光、FOV、续航、重量、激光安全亮度限制（Meta Orion 原型约 70°、98 g、续航约 2 h、未商用）；作品的义眼 UI 没有这些，还默认它**知道你在看什么**。后者靠协议不靠光学。\r\n";
md += "3. **M05 的判词是全站最精准的一句**：「本质是给观众看的界面，不是给人脑的输入格式」。真要往视觉通路写，卡点不是分辨率，是「一段视觉内容该写成什么神经格式」没有理论——与 LK2 写入困境同一堵墙。\r\n\r\n";
md += "> **两个重点在这里合流**：Apple BCI HID 让 iPad / Vision Pro 把屏幕状态与 UI 元素实时回传给解码器。脑机真正参与 UI 的那一环不是把画面投进眼睛，而是让解码器知道画面里有什么。AI 负责猜上下文，光学负责显示，脑机只负责一个意图——**作品要的是「UI 长在眼里」，现实做到的是「UI 知道你在看」**。\r\n\r\n";

md += "### 23.4 现实 × 想象对照总表\r\n\r\n";
md += "| 外部对象 | 现实锚点 | 想象锚点 | 差在哪 | 状态 | 证据性质 |\r\n|---|---|---|---|---|---|\r\n";
O.matrix.forEach(r => {
  md += "| **" + cell(r.obj) + "** | " + cell(strip(r.real)) + " | " + cell(strip(r.imagine)) + " | " + cell(strip(r.gap)) + " | " + cell(r.status) + " | " + cell(r.ev) + " |\r\n";
});
md += "\r\n";

md += "### 23.5 证据性质与口径\r\n\r\n";
md += "这一节的现实锚点大量来自厂商公告与会议演示，和 §8 现实案例的 E1–E4 证据分级**不是同一套**，不要混读。尤其「突破性设备认定」常被媒体写成「获批」，这是错的。\r\n\r\n";
md += "| 性质 | 含义 |\r\n|---|---|\r\n";
O.ev.forEach(x => md += "| " + cell(x.k) + " | " + cell(strip(x.def)) + " |\r\n");
md += "\r\n";
md += "> 口径：只收 " + VERDATE + " 前可核查的公开事实（官方博客、平台协议公告、同行评议论文、监管认定与主流媒体综述），厂商数字按厂商口径标注、不外推性能；想象侧引用站内既有 67 条与作品库，不新增设定。两侧不对等是有意的——**作品省略的，往往正是工程主体**。落地状态仍以 §15 / §19 的六档为准，伦理与法律判断见 §21。\r\n\r\n";

// --- 写入（CRLF 统一，幂等）---
const f = path.join(dir, "脑机接口功能想象对照表.md");
let doc = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const START = "## 23. 脑机向外连了什么";
const END = "*完*";
const block = md.replace(/\r\n/g, "\n");
if (doc.indexOf(START) >= 0) {
  const a = doc.indexOf(START);
  const b = doc.indexOf(END, a);
  if (b < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, a) + block + doc.slice(b);
  console.log("已替换 §23");
} else {
  const i = doc.lastIndexOf(END);
  if (i < 0) throw new Error("找不到结尾标记 *完*");
  doc = doc.slice(0, i) + block + doc.slice(i);
  console.log("已插入 §23");
}
// §16 指路条：删掉所有历史版本行，插唯一一行「七张附表」（幂等，含空行规整）
const GUIDE = "- **七张附表**：技术天花板与年表见 §17，价格时效核验见 §18，作品 × 落地状态矩阵见 §19，常见问题见 §20，伦理与法律的九个讨论题见 §21，脑机连接的六类形态见 §22，向外连的现实×想象对照见 §23。";
{
  const lines = doc.split("\n");
  const kept = lines.filter(l => !/\*\*[两三四五六七]张附表\*\*/.test(l));
  const i = kept.findIndex(l => /^## 16\. 评估方法与免责说明/.test(l));
  if (i < 0) throw new Error("§16 标题未找到");
  let j = i + 1;
  while (j < kept.length && kept[j].trim() === "") j++;
  kept.splice(i + 1, j - (i + 1), "", GUIDE, "");
  doc = kept.join("\n");
}
fs.writeFileSync(f, doc.replace(/\n/g, "\r\n"), "utf8");
console.log("完成：" + doc.split("\n").length + " 行 / 版本 " + VER);

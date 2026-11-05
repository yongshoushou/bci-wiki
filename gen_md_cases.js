// gen_md_cases.js —— 从已构建的 Wiki 产物读取 DB，生成 §8 现实案例对照组 / §9 现有科技组合
// 用法：node build_wiki.js && node gen_md_cases.js
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const m = html.match(/\/\*DB_START\*\/\nconst DB=([\s\S]*?);\n\/\*DB_END\*\//);
if (!m) throw new Error("未找到 DB 数据块，请先运行 node build_wiki.js");
const DB = JSON.parse(m[1]);

const BY = {};
DB.items.forEach(d => (BY[d.id] = d));
const CSD = {};
DB.cases.list.forEach(c => (CSD[c.k] = c));
const KSD = {};
DB.compose.list.forEach(k => (KSD[k.k] = k));

const EVN = { 1: "E1 监管批准/上市", 2: "E2 同行评议", 3: "E3 注册临床/官方披露", 4: "E4 厂商宣称" };
const cell = s => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const ids = arr => arr.map(id => `[${id}]`).join(" ");

// ---------- §8 现实案例对照组 ----------
let out = "";
out += "## 8. 现实案例对照组（2026-11-05 新增）\n\n";
out += `> 给 §0 的 ${DB.items.length} 条虚构想象配一列「现实里到底做到了哪一步」。共 **${DB.cases.list.length} 个案例**，每个标注证据等级、量化指标，以及最重要的一栏——**没做到什么**。\n`;
out += "> \n> **证据等级只看「能否被独立核查」，不看技术价值**：E1 有监管准入文件 / E2 有同行评议论文 / E3 在 ClinicalTrials.gov 或 NMPA 可查 / E4 只有厂商或媒体说法。同一件事经常同时存在「厂商称已成功」与「公开登记查无试验」两种版本，本表把两者并排放。\n\n";

out += "### 8.1 这一组对照要说的四件事\n\n";
const aut = DB.cases.list.filter(c => c.ev === 1);
const peer = DB.cases.list.filter(c => c.ev === 2);
out += `1. **「意念控制」已经不是幻想，但它只做到一件事。** 全球首个植入式 BCI 注册证 2026-03 发给博睿康 NEO，适应证是颈段脊髓损伤患者的**抓握**。同年 Neuralink 累计 27 例、北脑一号 36 例、脑虎 57 例。这条线跑通的是「读一个意图 → 触发一个预置动作」，不是作品里的双向总线。\n`;
out += `2. **读出跑通了，写入只成了一半。** 语音解码已达 97% 准确率、接近自然语速；触觉反馈能分出粗糙与光滑。但真正大规模成功的「写入」只有两个：人工耳蜗（把频谱塞进 20 来个电极，用了五十年、一百万例）与 DBS（抑制一个核团，不是写一段内容）。\n`;
out += `3. **27 例、36 例、57 例——整个领域还在「几十人」的量级。** 对照：人工耳蜗超过 100 万例，DBS 超过 20 万例。BCI 现在的处境相当于人工耳蜗的 1980 年代初。\n`;
out += `4. **最有信息量的不是成功案例，是失败案例。** Argus II 让 350 多人重获部分视觉，2020 年停产，植入者失去维修渠道，设备留在体内变成砖（R28）；起搏器因固件漏洞一次召回 46.5 万台（R27）——后者正是 Quickhack 的技术祖先，只是目标还不是人脑。\n\n`;

out += "### 8.2 证据等级分布\n\n| 等级 | 案例数 | 判定标准 | 案例 |\n|---|---:|---|---|\n";
[1, 2, 3, 4].forEach(k => {
  const arr = DB.cases.list.filter(c => c.ev === k);
  const def = {
    1: "拿到上市许可、注册证或政府定价编码，可合法销售或收费",
    2: "结果发表于同行评议期刊，方法可被独立复现",
    3: "在 ClinicalTrials.gov / NMPA 等平台有可查登记，或监管与公立机构正式披露",
    4: "只有公司声明、创始人发言或媒体报道，查不到试验登记与论文"
  }[k];
  out += `| ${EVN[k]} | ${arr.length} | ${def} | ${arr.map(c => c.k).join(" ")} |\n`;
});
out += "\n";

out += "### 8.3 全部案例（按八类现实路径）\n\n";
DB.cases.meta.forEach(cat => {
  const arr = DB.cases.list.filter(c => c.cat === cat.k);
  if (!arr.length) return;
  out += `#### ${cat.name}（${arr.length} 个）\n\n`;
  out += `${cat.desc}\n\n`;
  out += "| # | 案例 | 机构 / 时间 | 证据 | 做到了什么 | 量化指标 | 没做到什么 | 对应条目 |\n|---|---|---|---|---|---|---|---|\n";
  arr.forEach(c => {
    out += `| ${c.k} | **${cell(c.name)}** | ${cell(c.org)} · ${cell(c.y)} | ${EVN[c.ev]} | ${cell(c.what)} | ${cell(c.metric)} | ${cell(c.cant)} | ${ids(c.ids)} |\n`;
  });
  out += "\n";
  arr.forEach(c => {
    out += `- **${c.k} 对照要点**：${c.pin}\n`;
  });
  out += "\n";
});

out += "### 8.4 对照结果：多少想象已有现实对应物\n\n";
out += "| 难度 | 条目数 | 有现实案例 | 覆盖率 | 对应案例 |\n|---|---:|---:|---:|---|\n";
const LVN = { 1: "L1", 2: "L2", 3: "L3", 4: "L4", 5: "L5" };
["L1", "L2", "L3", "L4", "L5", "Ln"].forEach(lv => {
  const all = DB.items.filter(d => (d.lv === -1 ? "Ln" : "L" + d.lv) === lv);
  if (!all.length) return;
  const a = all.filter(d => d.cases && d.cases.length);
  const ks = [...new Set(a.reduce((s, d) => s.concat(d.cases), []))].sort();
  out += `| ${lv} | ${all.length} | ${a.length} | ${all.length ? ((a.length / all.length) * 100).toFixed(0) : 0}% | ${ks.join(" ") || "—"} |\n`;
});
const cov = DB.items.filter(d => d.cases && d.cases.length);
const covHi = DB.items.filter(d => d.cases && d.cases.some(k => CSD[k].ev <= 2));
out += `| **合计** | **${DB.items.length}** | **${cov.length}** | **${((cov.length / DB.items.length) * 100).toFixed(0)}%** | — |\n\n`;
out += `覆盖率只有 ${cov.length}/${DB.items.length}，这个数字本身就是结论：**虚构里的大部分想象，现实里连一个沾边的项目都没有**。而「有对应物」也不等于「接近」——X01 电子脑被 27 例只读植入覆盖，两者差着几个范式。\n\n`;

out += "### 8.5 三条使用纪律\n\n";
out += "1. **不要把「有对应物」读成「已实现」。** 一条想象只要有一个案例沾到边就算覆盖，但覆盖不等于接近。\n";
out += "2. **优先看「没做到」那一栏。** 所有宣传材料都在写做到了什么；只有「没做到」才告诉你天花板在哪，而天花板通常是物理的，不是努力的。\n";
out += "3. **数字要带日期。** 这个领域的数字每半年翻一次。本节所有数字截止 2026-10 / 2026-11，引用时请连日期一起引。\n\n";

// ---------- §9 现有科技组合 ----------
out += "## 9. 现有科技组合可实现清单（2026-11-05 新增）\n\n";
out += `> 与难度标尺**正交**的第四个数轴。§5 的 L 问「按作品原样实现要多少次突破」，本节问另一个问题：**不发明任何新东西，只把今天买得到的部件拼起来，能做到什么程度**。共 ${DB.compose.list.length} 条，分三档。\n\n`;

out += "### 9.1 三档判定\n\n| 档 | 名称 | 条数 | 判定标准 | 现在能做什么 |\n|---|---|---:|---|---|\n";
const ACT = { A: "直接做原型，几周内可验证", B: "找临床/器械伙伴，准备审批路径", C: "先解决合法性：适应证、编码、证据规则" };
DB.compose.tiers.forEach(t => {
  out += `| ${t.k} | **${t.name}** | ${t.n} | ${t.def} | ${ACT[t.k]} |\n`;
});
out += "\n分档标准只有一个：**缺的是工程、是审批、还是许可**。缺的东西不同，可采取的行动就完全不同。\n\n";

out += "### 9.2 先读这五条结论\n\n";
out += "1. **最像作品的几条，根本不需要碰脑。** 神经自适应恐怖游戏（K01）、注意力定价（K06）、外挂记忆（K18）都能用摄像头、麦克风和耳机做到七八成。作品默认「必须植入」，是叙事惯性，不是工程必然。\n";
out += "2. **「读出」已经进产品线，「写入」还停在手术台上。** B 档凡是读出的（K09 控外设、K10 语音、K12 触觉）都有器械级成果；凡是写入内容的（K15 记忆）连理论都没有。**读出与写入之间的差距，比侵入与非侵入之间的差距大得多。**\n";
out += "3. **真正卡住的不再是技术。** C 档五条全部是「做得出来但没有合法路径」：职场监控、远程固件更新、神经数据作证据——技术早已具备，卡在适应证、收费编码与证据规则。\n";
out += "4. **成本最低、收益最高的一条是合规工具链（K08）。** 它不产生任何演示，却决定其余所有功能能不能上线。这类「不性感但必需」的项目，在想象里从来不存在。\n";
out += "5. **有一条必须明确排除：记忆写入（K15）。** 列在 B 档只为说明「部件有了但理论没有」——把它算进「可组合」，这份清单的可信度就没了。\n\n";

out += "### 9.3 全部组合\n\n";
DB.compose.tiers.forEach(t => {
  const arr = DB.compose.list.filter(x => x.tier === t.k);
  out += `#### ${t.k} ${t.name}（${arr.length} 条）\n\n`;
  out += "| # | 功能 | 技术组合 | 已有谁做到 | 真正卡点 | 与作品版的差距 |\n|---|---|---|---|---|---|\n";
  arr.forEach(x => {
    out += `| ${x.k} | **${cell(x.name)}** | ${x.parts.map(cell).join(" ＋ ")} | ${cell(x.have)} | ${cell(x.blocker)} | ${cell(x.gap)} |\n`;
  });
  out += "\n";
  arr.forEach(x => {
    out += `- **${x.k} 怎么拼**：${x.how}\n`;
    out += `- **${x.k} 结论**：${x.verdict}\n`;
  });
  out += "\n";
});

out += "### 9.4 拼不出来的那一半\n\n";
const zero = DB.items.filter(d => !d.kits || !d.kits.length).map(d => d.id);
const many = DB.items.filter(d => d.kits && d.kits.length >= 3).map(d => d.id);
out += `把 ${DB.items.length} 条想象按「能被几个现有组合覆盖」排序：\n\n`;
out += `- **三条以上组合可覆盖（${many.length} 条）**：${many.map(i => `[${i}]`).join(" ")}\n`;
out += `- **一条都没有（${zero.length} 条）**：${zero.map(i => `[${i}]`).join(" ")}\n\n`;
out += `右边这一组不是「还没拼好」，是「部件还不存在」。它们的分布几乎全部集中在 L4–L5 与人格相关条目——这与 §5 的难度判定互相印证，只是这次是从「拼装可行性」而不是「科学突破」的角度得出的。\n\n`;

out += "### 9.5 这份清单的三条局限\n\n";
out += "1. **「可组合」不等于「可产品化」。** A 档能做出原型，不代表能卖给任何人：消费级 EEG 的指标未经临床验证，卖给「改善睡眠」是营销，不是医疗。\n";
out += "2. **成本被刻意省略。** B 档每条单位成本都在几十万到几百万元量级（含手术、随访、器械），这不是「贵」，是「尚未进入规模经济」。\n";
out += "3. **时点极短。** 以 2026-11 为准。这个领域每半年改写一次数字，任何延迟引用的结论都会失真。\n\n";

out += "---\n\n";

// ---------- 写回 Markdown ----------
const mdPath = path.join(dir, "脑机接口功能想象对照表.md");
let md = fs.readFileSync(mdPath, "utf8");
const B_START = "<!--CASES_START-->", B_END = "<!--CASES_END-->";

if (md.indexOf(B_START) !== -1) {
  md = md.replace(new RegExp(B_START + "[\\s\\S]*?" + B_END), () => B_START + "\n" + out + B_END);
} else {
  const anchor = /## 8\. 评估方法与免责说明/;
  if (!anchor.test(md)) throw new Error("未找到 §8 锚点");
  md = md.replace(anchor, () => B_START + "\n" + out + B_END + "\n## 10. 评估方法与免责说明");
  // §9 已被新内容占用，原 §8 顺延为 §10
}
// 幂等：确保原 §8 已重编号
md = md.replace(/^## (?:8|10)\. 评估方法与免责说明/m, "## 10. 评估方法与免责说明");

fs.writeFileSync(mdPath, md, "utf8");
console.log("已写入 §8/§9：案例 " + DB.cases.list.length + " 个，组合 " + DB.compose.list.length + " 条，Markdown " + (Buffer.byteLength(md) / 1024).toFixed(1) + " KB");

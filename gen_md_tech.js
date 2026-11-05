// gen_md_tech.js —— 从已构建的 Wiki 产物读取 DB，生成 §10 技术条目层
// 用法：node build_wiki.js && node gen_md_tech.js
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const dir = __dirname;
const mdPath = path.join(dir, "脑机接口功能想象对照表.md");
const html = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const m = html.match(/\/\*DB_START\*\/\nconst DB=([\s\S]*?);\n\/\*DB_END\*\//);
if (!m) throw new Error("未找到 DB 数据块，请先运行 node build_wiki.js");
const DB = JSON.parse(m[1]);

const cell = s => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");

const T = DB.tech.list;
const CATS = DB.tech.cats;

let out = "";
out += "## 10. 技术条目层（2026-11-05 新增 · v1.1）\n\n";
out += "### 10.1 这一层为什么存在\n\n";
out += "上面九节的重心在虚构那一侧：67 条想象、200 部作品，现实侧只有 28 个案例和 20 条组合。缺一层可被引用的技术骨架，于是所有「现实能不能做到」的判断都停在形容词上。\n\n";
out += `本节补上 **${T.length} 条技术条目**，分五类：` +
  CATS.map(c => `${c.name} ${c.ids.length}`).join("、") +
  "。每条固定四段：**定义 / 怎么做 / 典型数值区间 / 失效模式**，另列代表系统与来源。\n\n";
out += "三条读法纪律：\n\n";
out += "1. **数值是量级锚点，不是规格书。** 同一型号在不同批次、不同术者、不同脑区之间能差出数倍。看到精确到小数点后两位的宣传数字，先找第三方复现。\n";
out += "2. **每条都单列「失效模式」。** 宣传材料只写前半段。判断一项技术是否成熟，看它在什么条件下失效、失效之后能不能修。\n";
out += "3. **能说出区间，才算被工程化。** 说不出典型值、信噪比门槛、寿命数据的能力，通常还停在演示阶段。\n\n";
out += "> 本节与 §8 / §9 双向互链：案例用到哪些技术、技术支撑哪些案例，两边都能查到。Wiki 版本见 `#/tech`。\n\n";

out += "### 10.2 总览\n\n";
out += "| # | 名称 | 分类 | 一句话定义 |\n|---|---|---|---|\n";
T.forEach(t => {
  const cat = CATS.find(c => c.k === t.cat);
  out += `| ${t.k} | **${cell(t.name)}** | ${cat.name} | ${cell(t.def)} |\n`;
});
out += "\n";

out += "### 10.3 逐条数值与失效模式\n\n";
CATS.forEach(c => {
  const arr = T.filter(t => t.cat === c.k);
  out += `#### ${c.name}（${arr.length}）\n\n`;
  out += `${c.desc}\n\n`;
  arr.forEach(t => {
    out += `**${t.k} ${t.name}**　*${t.en}*\n\n`;
    out += `- **定义**：${t.def}\n`;
    out += `- **怎么做**：${t.how}\n`;
    out += `- **典型数值**：${t.vals.map(v => `${v[0]} ${v[1]}`).join("；")}\n`;
    out += `- **失效模式**：${t.fail}\n`;
    if (t.rel.length) {
      out += `- **关联技术**：${t.rel.map(k => { const x = T.find(y => y.k === k); return `${k} ${x ? x.name : ""}`; }).join(" · ")}\n`;
    }
    out += t.cases.length
      ? `- **对应案例**：${t.cases.join(" ")}（详见 §8）\n`
      : `- **对应案例**：无。${c.k === "algo" || c.k === "dev" ? "算法与通用器件通常不单独成案，价值体现在使用它们的系统里。" : "该方向尚未走到能独立成案的阶段，这本身是信息。"}\n`;
    out += `- **来源**：${t.src}\n\n`;
  });
});

out += "### 10.4 这一层暴露的三件事\n\n";
out += "1. **写入远落后于读出。** 指标与器件两节里，凡是「读」的条目都能给出临床级数值；凡是「写入内容」的，一条也拿不出来。人工耳蜗与 DBS 的规模（百万人级、二十万人级）做的事都极窄——刺激强度与频率，而不是信息内容。\n";
out += "2. **长期稳定性是唯一的真门槛。** 通道数可以堆、算法可以换，但电极在体内衰减与脱出没有工程解。Neuralink 首例报道约 85% 电极丝脱出、Utah 阵列多单位记录多在 2 年内显著衰减——这两个数字比任何精度指标都更能说明 BCI 现在的处境。\n";
out += "3. **中国的硬件路线在「半侵入」上更靠前。** 8 通道硬膜外 NEO 已拿到三类证、128 通道北脑一号完成 36 例入组，与 1024 通道皮层内的路线不是同一条赛道：前者用更少的通道换取可上市的安全性。\n\n";

out += "---\n\n";

let md = fs.readFileSync(mdPath, "utf8");

// 行尾自适应：原文件是 CRLF 就按 CRLF 写，避免半个文件 LF、半个文件 CRLF
const EOL = md.indexOf("\r\n") !== -1 ? "\r\n" : "\n";
const norm = t => t.replace(/\r\n/g, "\n").split("\n").join(EOL);
md = norm(md);
out = norm(out);

// 幂等：若已存在 §10 技术条目层，先整段删除
const startTag = "## 10. 技术条目层";
const endTag = "## 11. 评估方法与免责说明";
const si = md.indexOf(startTag);
if (si !== -1) {
  const ei = md.indexOf(endTag);
  if (ei === -1) throw new Error("找到旧 §10 但找不到 §11，请手动检查");
  md = md.slice(0, si) + md.slice(ei);
}

// 原 §10 评估方法顺延为 §11
if (md.indexOf("## 10. 评估方法与免责说明") !== -1) {
  md = md.replace("## 10. 评估方法与免责说明", "## 11. 评估方法与免责说明");
} else if (md.indexOf(endTag) === -1) {
  throw new Error("未找到「评估方法与免责说明」章节，无法定位插入点");
}

md = md.replace(endTag, out + endTag);
fs.writeFileSync(mdPath, md, "utf8");
console.log(`已写入 §10：${T.length} 条技术条目（` + CATS.map(c => c.k + c.ids.length).join(" ") + "）");

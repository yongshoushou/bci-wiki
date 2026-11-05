const fs = require("fs");
const path = require("path");
const dir = __dirname;

// 从构建产物里取 DB（DB 是 JSON.stringify 注入的，可直接解析）
const wiki = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const mm = wiki.match(/const DB=(\{[\s\S]*?\});\n\/\*DB_END\*\//);
if (!mm) throw new Error("无法提取 DB");
const DB = JSON.parse(mm[1]);

const E = DB.ethics, M = DB.matrix;
const BY = {}; DB.items.forEach(d => BY[d.id] = d);
const LVN = { L1: "L1 工程可达", L2: "L2 需神经科学突破", L3: "L3 需范式突破", L4: "L4 物理/信息论存疑", L5: "L5 叙事装置", Ln: "— 非技术项" };
const lvOf = d => d.lv === -1 ? "Ln" : "L" + d.lv;

const lowHi = DB.items.filter(d => d.eth && (d.lv === 1 || d.lv === 2) && d.eth.e >= 3);

let out = [];
out.push("## 6. 伦理道德分类标准（2026-11-05 新增）");
out.push("");
out.push("与 §0.2 的难度标尺**正交**的第二个维度：难度问「能不能做」，伦理问「该不该做、谁负责」。两套标尺互不推导——子弹时间（M10）是 L5 却几乎没有伦理争议，远程入侵植入体（C06）只有 L1 却已踩到人身控制与责任归属。");
out.push("");
out.push("分类骨架取自两份现行文件：中国《脑机接口研究伦理指引》（国家科技伦理委员会人工智能伦理分委员会，2024-02）与 UNESCO《神经技术伦理问题建议书》（第 43 届大会，撒马尔罕，2025-11-05 通过 / 11-12 生效，全球首个神经技术伦理准则性框架）；再加本表的编辑判断。");
out.push("");
out.push("### 6.1 十条伦理议题（N1–N10）");
out.push("");
out.push("| 代号 | 议题 | 核心追问 | 定义 | 规范现状 | 条目数 |");
out.push("|---|---|---|---|---|---|");
E.dims.forEach(x => {
  out.push("| **" + x.k + "** | " + x.name + " | " + x.q + " | " + x.def.replace(/\|/g, "\\|") + " | " + x.real.replace(/\|/g, "\\|") + " | " + x.ids.length + " |");
});
out.push("");
out.push("**覆盖悬殊值得注意**：N5 知情同意（" + E.dims[4].ids.length + " 条）、N8 尊严与商品化（" + E.dims[7].ids.length + " 条）、N4 身份与人格（" + E.dims[3].ids.length + " 条）是虚构作品最常碰的三类；而现实中规范最实的只有 N1 精神隐私、N5 知情同意、N9 数据主权——N3 自主与能动、N7 责任归属、N8 尊严与商品化在现行文件里几乎空白，而这三类恰恰是**条目数不少、规范几乎没有**的缺口。");
out.push("");
out.push("### 6.2 伦理风险等级 E0–E4 的判定");
out.push("");
out.push("判定是**顺序判断**，命中即停：");
out.push("");
out.push("| 步 | 问题 | 命中 → |");
out.push("|---|---|---|");
out.push("| 1 | 是否有任何真实主体受影响？ | 否 → **E0** |");
out.push("| 2 | 是否落在现行规范之内（医疗器械审批 / 《个人信息保护法》/《网络安全法》/ 动物伦理）？ | 是 → **E1** |");
out.push("| 3 | 现实是否已有实践与公开争论，但无共识？ | 是 → **E2** |");
out.push("| 4 | 现有法律是否无法覆盖，需新设权利或新立罪名？ | 是 → **E3** |");
out.push("| 5 | 前置哲学问题（副本是否本人）是否未决，以致任何规范都无从落地？ | 是 → **E4** |");
out.push("");
out.push("> **E 衡量的不是伤害大小，是「离形成规范有多远」。** 一个导致死亡但责任清晰的事故是 E1；一个没人受伤却无法判定主体的事是 E4。所以 E4 不等于最危险，只等于最无解。");
out.push("");
out.push("全表分布：**E0 " + E.levels[0].ids.length + " / E1 " + E.levels[1].ids.length + " / E2 " + E.levels[2].ids.length + " / E3 " + E.levels[3].ids.length + " / E4 " + E.levels[4].ids.length + "**。");
out.push("");
out.push("### 6.3 难度 × 伦理 交叉矩阵");
out.push("");
out.push("| 难度 \\ 伦理 | E0 无争议 | E1 有规范 | E2 有争议 | E3 无法覆盖 | E4 触及人的定义 | 合计 |");
out.push("|---|---|---|---|---|---|---|");
M.forEach(r => {
  const sum = r.cells.reduce((a, b) => a + b, 0);
  out.push("| **" + r.lv + "** " + (LVN[r.lv] || "") + " | " + r.cells.map(c => c || "·").join(" | ") + " | " + sum + " |");
});
const col = [0, 1, 2, 3, 4].map(i => M.reduce((s, r) => s + r.cells[i], 0));
out.push("| **合计** | " + col.join(" | ") + " | " + DB.items.length + " |");
out.push("");
out.push("**怎么读：**");
out.push("");
out.push("1. **右列（E4）数量最多，说明核心争点高度集中。** 它不是十个问题，是一个问题（「副本是不是本人」）的十个投影。");
out.push("2. **L4 是伦理上最重的一行。** 因为「复制」「覆写」「融合」全在 L4，而它们都在问「你是不是你」。");
out.push("3. **L1–L2 的行看起来干净，但 E3 已经出现。** 这些是唯一会在本世纪二十年代落地的东西。");
out.push("4. **Ln（非技术项）集中在 E2。** 赛博精神病、人性值这类设定，本质是把现实中的精神卫生与信用评分问题换了个外壳。");
out.push("");
out.push("**真正紧迫的 4 条**（L1–L2 且 E3+）：" + lowHi.map(d => d.id + " " + d.fn).join("、") + "。数量不多，但它们是全表唯一会先发生的事。");
out.push("");
out.push("### 6.4 逐条伦理标注（67 条）");
out.push("");
out.push("| # | 功能 | 难度 | 伦理等级 | 议题 | 判词 |");
out.push("|---|---|---|---|---|---|");
DB.items.forEach(d => {
  const L = E.levels[d.eth.e];
  const dims = d.eth.n.map(k => k).join(" ");
  out.push("| " + d.id + " | " + d.fn.replace(/\|/g, "\\|") + " | " + d.lvs + " | **" + L.k + "** " + L.name + " | " + dims + " | " + d.eth.why.replace(/\|/g, "\\|") + " |");
});
out.push("");
out.push("### 6.5 这套标准的四条局限");
out.push("");
out.push("1. **归属是判断，不是计算。** 同一条想象从不同立场看会落到不同议题。C06 远程入侵植入体，从个人看是 N3 自主被剥夺，从公共看是 N9 基础设施安全，从军队看是 N10 双用。本表给的是编辑判断，不是唯一解。");
out.push("2. **E 不衡量伤害大小。** 它刻意不把「后果严重度」算进去，否则会造成「死人的排前面、难懂的排后面」的误导。伤害大小应看具体条目，不看等级。");
out.push("3. **它是分析工具，不是法律意见。** 本表不构成合规判断。真实项目的伦理审查应走《脑机接口研究伦理指引》《涉及人的生命科学和医学研究伦理审查办法》与机构伦理委员会。");
out.push("4. **价值立场是明示的。** 本表默认「个人自主优先于技术便利」「人格不得商品化」。不同意这两条前提的人会得出不同分级——这不是缺陷，是任何伦理框架都无法回避的起点。");
out.push("");

const block = out.join("\n");

const mdPath = path.join(dir, "脑机接口功能想象对照表.md");
let md = fs.readFileSync(mdPath, "utf8");
if (md.indexOf("## 6. 伦理道德分类标准") !== -1) throw new Error("已插入过，先撤销再跑");
md = md.replace("## 6. 评估方法与免责说明", block + "\n---\n\n## 7. 评估方法与免责说明");
// §7 最后一条要改：加了伦理维度后「不含价值判断」自相矛盾
md = md.replace(
  "- **这份表不含价值判断**：实现难度低不等于值得做，L5 也不等于想象力差——恰好相反，M14「人体电池」科学上最站不住，却是整个赛博朋克 economic 隐喻的地基。",
  "- **难度部分不含价值判断，伦理部分则是明确的价值判断**：实现难度低不等于值得做，L5 也不等于想象力差——恰好相反，M14「人体电池」科学上最站不住，却是整个赛博朋克经济隐喻的地基。伦理分级的立场已在 §6.5 第 4 条明示。"
);
fs.writeFileSync(mdPath, md, "utf8");
console.log("已插入伦理章节：" + block.split("\n").length + " 行；文件共 " + md.split("\n").length + " 行");

const fs = require("fs");
const path = require("path");
const dir = __dirname;

const wiki = fs.readFileSync(path.join(dir, "脑机接口功能想象_Wiki.html"), "utf8");
const mm = wiki.match(/const DB=(\{[\s\S]*?\});\n\/\*DB_END\*\//);
if (!mm) throw new Error("无法提取 DB");
const DB = JSON.parse(mm[1]);

const L = DB.law, M = DB.matrixLaw;
const LVN = { L1: "L1 工程可达", L2: "L2 需神经科学突破", L3: "L3 需范式突破", L4: "L4 物理/信息论存疑", L5: "L5 叙事装置", Ln: "— 非技术项" };
const esc = s => String(s == null ? "" : s).replace(/\|/g, "\\|");
const cV = k => { const x = L.levels.filter(y => y.k === k)[0]; return x ? x.ids.length : 0; };

const judged = DB.items.filter(d => d.law.v <= 2);
const unj = DB.items.filter(d => d.law.v >= 3);
const v3 = DB.items.filter(d => d.law.v === 3);
const v4 = DB.items.filter(d => d.law.v === 4);
const low = DB.items.filter(d => d.lv === 1 || d.lv === 2);
const lowJ = low.filter(d => d.law.v <= 2);
const netV2 = DB.items.filter(d => d.law.v === 2 && d.law.j.some(k => k === "J6" || k === "J7"));

let out = [];
out.push("## 7. 法律分类标准（2026-11-05 新增 · 只依据现行法）");
out.push("");
out.push("第三个维度，与 §0.2 难度、§0.4 伦理都正交。它只回答一个问题：**按今天生效的法律，这条想象算什么**。");
out.push("");
out.push("三条硬约束，写在这里作为整套标准的边界：");
out.push("");
out.push("1. **不预测立法。** 不假设任何待议法案通过，不推测「将来大概会怎么管」。若日后修法，本表相应条目自动失效——这是刻意的，宁可过时也不猜。");
out.push("2. **不评价应然。** 「该不该」属 §6 伦理维度。本维度只做事实判断：现行法怎么说。");
out.push("3. **超出射程就不判断。** 没有可适用的条文，或根本没有法律评价对象，一律标注「未作判断」，既不算合法也不算违法。");
out.push("");

out.push("### 7.1 八条法律议题（J1–J8）");
out.push("");
out.push("与伦理议题按「侵犯了什么价值」划分不同，法律议题按**受影响的法益／部门法**划分——伦理问价值，法律问**能不能立案、由谁管辖、适用哪部法**。一条想象通常横跨 1–3 类。");
out.push("");
out.push("| 代号 | 议题 | 受影响的法益 | 现行法依据 | 为什么还会判不了 | 条目数 |");
out.push("|---|---|---|---|---|---|");
L.dims.forEach(x => {
  out.push("| **" + x.k + "** | " + x.name + " | " + esc(x.q) + " | " + esc(x.law) + " | " + esc(x.gap) + " | " + x.ids.length + " |");
});
out.push("");

out.push("### 7.2 法律状态 V0–V4 的判定");
out.push("");
out.push("判定是**顺序判断**，命中即停。前两步决定「判不判」，后三步决定「怎么判」：");
out.push("");
out.push("| 步 | 问题 | 命中 → |");
out.push("|---|---|---|");
out.push("| 1 | 该行为在物理上可能、且存在法律上的行为主体与评价对象？ | 否 → **V4 不进入评价**（不判断） |");
out.push("| 2 | 是否落入现行刑法／民法／行政法的禁止性构成要件？ | 是 → **V2 违法** |");
out.push("| 3 | 是否属于须经许可、审批、资质或有效同意方可实施？ | 是 → **V1 合规可行** |");
out.push("| 4 | 现行法是否明确不禁止，且不侵害他人法益？ | 是 → **V0 合法** |");
out.push("| 5 | 以上皆否：有主体、有行为、无规则 | → **V3 无规定**（不判断） |");
out.push("");
out.push("全表分布：**V0 " + cV("V0") + " / V1 " + cV("V1") + " / V2 " + cV("V2") + " / V3 " + cV("V3") + " / V4 " + cV("V4") + "**。");
out.push("");
out.push("> **V3／V4 都不等于「合法」。** V4 是法律管不着（无所谓合法与否），V3 是法律还没管（立法缺口）。把「不违法」读成「允许」，是这套标尺最容易被误用的地方。");
out.push("");
out.push("> 还要分清：**V2 是「有法可依的否定」，V3 是「无法可依」。** 前者有被告、有罪名；后者往往加害者不违法、受害者无救济。刑事上法无明文不为罪（《刑法》第 3 条），民事上「法无禁止即自由」只保护行为人。");
out.push("");

out.push("### 7.3 难度 × 法律状态 交叉矩阵");
out.push("");
out.push("| 难度 \\ 法律 | V0 合法 | V1 合规可行 | V2 违法 | V3 无规定 | V4 不进入评价 | 合计 |");
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
out.push("1. **V1 是最大的一格（" + cV("V1") + " 条）。** 这个领域多数功能不是「能不能做」，而是「有没有办手续」——器械注册、伦理审查、单独同意。合规成本远大于技术成本。");
out.push("2. **V3（" + cV("V3") + " 条）比 V2（" + cV("V2") + " 条）多一倍。** 违法是少数，无人管辖才是多数。这是本表最值得记住的结构性事实。");
out.push("3. **V4 只有 " + cV("V4") + " 条，且全在 L5 与纯机制。** 说明作品的绝大多数想象在法律上都「有对象可评价」——「这是科幻所以法律管不着」通常是错的。");
out.push("4. **L1–L2 那一行几乎全落在 V0–V2（" + lowJ.length + " / " + low.length + "）。** 已经能做到的事，法律基本都有话说；唯一例外是 M08（虚拟死亡导致生理死亡），卡在因果链上。");
out.push("");

out.push("### 7.4 逐条法律标注（67 条）");
out.push("");
out.push("| # | 功能 | 难度 | 法律状态 | 议题 | 判词 | 依据 |");
out.push("|---|---|---|---|---|---|---|");
DB.items.forEach(d => {
  const s = L.levels[d.law.v];
  const mark = d.law.v >= 3 ? " ⚠️**未作判断**" : "";
  out.push("| " + d.id + " | " + esc(d.fn) + " | " + d.lvs + " | **" + s.k + "** " + s.name + mark + " | " + d.law.j.join(" ") + " | " + esc(d.law.why) + " | " + esc(d.law.basis) + " |");
});
out.push("");

out.push("### 7.5 未作判断的 " + unj.length + " 条（V3 + V4）");
out.push("");
out.push("这是本维度最需要单独列出的一节：以下条目**本表不给结论**。分两类，原因完全不同。");
out.push("");
out.push("**V3 无规定（" + v3.length + " 条）——有主体、有行为、无法条。** 立法缺口，不是灰色地带：");
out.push("");
out.push(v3.map(d => d.id + " " + d.fn).join("、") + "。");
out.push("");
out.push("**V4 不进入评价（" + v4.length + " 条）——法律上没有评价对象。** 物理不可能、无行为主体或纯游戏机制，标「合法」或「违法」都是错的：");
out.push("");
out.push(v4.map(d => d.id + " " + d.fn).join("、") + "。");
out.push("");

out.push("### 7.6 六条结论与局限");
out.push("");
out.push("1. **近一半的想象，现行法没有答案。** " + DB.items.length + " 条里，有明确判断的 " + judged.length + " 条，**不判断的 " + unj.length + " 条**，占 " + (unj.length / DB.items.length * 100).toFixed(0) + "%。这不是没查，是查完确实没有可适用的条文。");
out.push("2. **技术越清晰，法律越清晰。** L1–L2 共 " + low.length + " 条，其中 " + lowJ.length + " 条有明确判断。V3／V4 几乎全在 L3–L5：法律能管的是已经发生的事。");
out.push("3. **法律不需要先回答「engram 是不是人」。** C09 摧毁原脑＝故意杀人（V2，刑法第 232 条）；C13 覆写人格＝故意伤害，且本人同意也无效（V2，人格权不得放弃，《民法典》第 992 条）；C11 生前签约处分死后人格＝标的不存在（V3）。伦理上的 E4 死结，在刑法与民法上都能当场结案。**这是三个维度之间最大的分野。**");
out.push("4. **最现成可用的武器不是杀人罪，是网络安全法。** V2 的 " + cV("V2") + " 条里有 " + netV2.length + " 条（" + netV2.map(d => d.id).join("、") + "）的定性靠的是「未授权入侵／破坏计算机信息系统」（刑法第 285、286 条），不需要任何针对脑机接口的新立法。这类行为已经在发生，只是还没发生在人脑上。");
out.push("5. **法域差异可能完全相反。** 同一行为在不同国家结论不同：X24 读取情绪，欧盟受 AI Act 第 5 条约束、美国部分州受 BIPA 约束、中国受《个人信息保护法》第 28 条约束。本表以中国法判定、主要法域为参照，**跨境业务必须逐法域重判**。");
out.push("6. **本表不是法律意见。** 它不构成对任何具体行为的合法性判断，也不替代执业律师意见。涉医疗器械的须走 NMPA／FDA／CE 的正式路径；涉人体研究的须过机构伦理委员会。");
out.push("");
out.push("> 法条依据以中国现行法为主（《刑法》《民法典》《个人信息保护法》《数据安全法》《网络安全法》《医疗器械监督管理条例》《刑事诉讼法》），并以 GDPR、EU AI Act (Reg. 2024/1689)、EU MDR 2017/745、美国 CFAA／BIPA／加州 SB 1223、Oviedo 公约、ICCPR 为参照。所有条文以 **2026-11 现行有效版本**为准。");
out.push("");

const block = out.join("\n");

const mdPath = path.join(dir, "脑机接口功能想象对照表.md");
let md = fs.readFileSync(mdPath, "utf8");
if (md.indexOf("## 7. 法律分类标准") !== -1) throw new Error("已插入过，先撤销再跑");
if (md.indexOf("## 7. 评估方法与免责说明") === -1) throw new Error("找不到锚点");
md = md.replace("## 7. 评估方法与免责说明", block + "\n---\n\n## 8. 评估方法与免责说明");
md = md.replace(
  "- **难度部分不含价值判断，伦理部分则是明确的价值判断**：实现难度低不等于值得做，L5 也不等于想象力差——恰好相反，M14「人体电池」科学上最站不住，却是整个赛博朋克经济隐喻的地基。伦理分级的立场已在 §6.5 第 4 条明示。",
  "- **三个维度性质不同**：难度是技术判断（不含价值判断），伦理是明确的价值判断（立场见 §6.5 第 4 条），法律是**事实判断**（只陈述现行法，不作应然主张，不预测立法）。三者不可互相推导。\n- **法律部分的三条边界**：只依据 2026-11 现行有效的法律；不预测任何待议立法；超出法律射程的 32 条明确标注「未作判断」，既不算合法也不算违法。这份标注不是回避，是结论本身。"
);
fs.writeFileSync(mdPath, md, "utf8");
console.log("已插入法律章节：" + block.split("\n").length + " 行；文件共 " + md.split("\n").length + " 行");

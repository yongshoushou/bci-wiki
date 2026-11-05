const fs = require("fs");
let s = fs.readFileSync("CHANGELOG.md", "utf8");
const B = "`";
const row = "| **v2.1.1** | " + B + "HEAD" + B + " | 2026-11-05 | **措辞修正 + 快照可达性**：年表列名从「当时的最优值」改为「**当时的关键数值**」，并补一句「有些指标的进步是数值变小（如长期稳定性记的是衰减幅度），看的是走向不是大小」——原措辞对 T22 这类失效类指标不成立。站内快照链接改为继承当前查询串（托管侧只放行带 sharecode 的静态文件），并并列 GitHub Pages 永久链接。 |
";
const anchor = "| **v2.1.0** |";
const i = s.indexOf(anchor);
if (i < 0) throw new Error("找不到 v2.1.0 行");
if (s.indexOf("**v2.1.1**") < 0) s = s.slice(0, i) + row + s.slice(i);
s = s.replace("（截至 v2.1.0 共 18 次提交）", "（截至 v2.1.1 共 19 次提交）");
fs.writeFileSync("CHANGELOG.md", s);
console.log("CHANGELOG 已加 v2.1.1");

# 脑机接口功能想象 · Wiki

游戏 / 影视 / 动画 / 小说中对**脑机接口（BCI）及其延伸功能**的想象汇总 Wiki。
重点覆盖《赛博朋克 2077》体系与《黑客帝国》全系列。

## 在线阅读

👉 **https://yongshoushou.github.io/bci-wiki/**

仓库地址：https://github.com/yongshoushou/bci-wiki

## 规模

- **67 条功能条目**：每条含出处、设定描述、信息流分类、实现难度（L1–L5）、判定依据、注释与参见
- **100 个作品总结页**：10 篇深度总结 + 90 部作品库（游戏 25 / 动画漫画 11 / 电影 28 / 剧集 9 / 小说 17）
- **22 个术语页**（Relic、Soulkiller、engram、Blackwall、Ghost、SQUID、BTL、副本问题、带宽瓶颈……）
- **8 个主题概念分组**、难度标尺、现实基线、完整对照表（含搜索与筛选）

## 难度标尺（全站统一）

| 等级 | 含义 |
|---|---|
| L1 | 工程可达（已有现实对应物） |
| L2 | 需要神经科学突破（缺编解码理论） |
| L3 | 需要范式级突破 |
| L4 | 物理 / 信息论层面存疑 |
| L5 | 叙事装置（不对应技术） |

标尺锚定 2026 年前后现实 BCI 进展（Neuralink N1、Synchron、2025 年全脑仿真评估等），行业数字仅作量级参照。

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html` | Wiki 主站（单文件 SPA，hash 路由，无依赖）。**这是构建产物，不要直接改** |
| `build_wiki.js` | **单一数据源**：条目数据从 `脑机接口功能想象_直观版.html` 提取，主题分组 / 术语 / 作品总结（HOT、LIB）写在本文件里 |
| `脑机接口功能想象_直观版.html` | 67 条条目数据的来源（表格版） |
| `脑机接口功能想象对照表.md` | 完整 Markdown 对照表（人类可读版） |

## 本地构建

```bash
node build_wiki.js          # 从表格版提取数据，校验引用，注入 Wiki
# build_wiki.js 输出的文件名是「脑机接口功能想象_Wiki.html」，更新站点时：
cp 脑机接口功能想象_Wiki.html index.html   # Windows: copy
```

需要 Node.js（任意现代版本），无其他依赖。

## 贡献

欢迎提 Issue 和 Pull Request，见 [CONTRIBUTING.md](CONTRIBUTING.md)。常见贡献：修正设定细节、补充作品、新增条目。

## 许可

- **代码**（HTML/JS/CSS 框架与构建脚本）：[MIT](LICENSE)
- **词条内容**（条目描述、作品总结、术语释义）：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans)（署名-相同方式共享）

## 免责

作品设定以官方文本为准；两处需以原作为准：①《Cyberpunk: Edgerunners》第二季（2026）依据 2026 年媒体报道整理；②《The Matrix Online》已于 2009 年关服，设定依据当时官方资料。现实进展数字随报道波动，仅用于量级参照。

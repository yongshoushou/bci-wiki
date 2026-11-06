// v2.4 新增层 #/link 的回归：连接形态图谱。
// 两类断言：
//   A. 数据自洽——六类字段齐全、条目 / 案例编号真实存在、带宽阶梯一一对应、flow 分布合计 67；
//   B. 呈现完整——总览六卡与四节、六个详情页、路由别名与大小写归一、首页/侧栏/搜索入口。
const fs = require("fs"), vm = require("vm");
const h = fs.readFileSync("脑机接口功能想象_Wiki.html", "utf8");
const src = h.match(/<script>([\s\S]*?)<\/script>/)[1];
const mk = () => ({ innerHTML: "", textContent: "", value: "", classList: { toggle() {}, add() {}, remove() {}, contains() { return false } }, addEventListener() {}, focus() {}, blur() {}, select() {}, getAttribute() { return "" }, querySelector() { return null }, querySelectorAll() { return [] }, dataset: {}, style: {} });
const els = {};
const document = { getElementById(id) { return els[id] || (els[id] = mk()) }, querySelector(s) { return els[s] || (els[s] = mk()) }, querySelectorAll() { return [] }, addEventListener() {} };
const ctx = { document, window: { addEventListener() {}, scrollTo() {} }, location: { hash: "#/" }, history: { replaceState() {} }, URLSearchParams, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);
const go = x => { ctx.location.hash = x; vm.runInContext("route()", ctx); return els["#view"].innerHTML; };
const q = c => vm.runInContext(c, ctx);
const plain = s => String(s).replace(/<[^>]+>/g, "");
let fails = 0;
const ok = (name, cond, extra) => { const line = (cond ? "OK   " : "FAIL ") + name + (extra ? "  " + extra : ""); console.log(line); if (!cond) { fails++; process.exitCode = 1; } };

/* ---------- 1) 数据层 ---------- */
const T = q("DB.link.types"), B = q("DB.link.band"), F = q("DB.link.flows");
ok("六类连接形态", T.length === 6, "实际 " + T.length);
ok("编号 LK1–LK6 唯一有序", T.map(x => x.k).join(",") === "LK1,LK2,LK3,LK4,LK5,LK6");
ok("每类必填字段齐全", T.every(x => x.name && x.en && x.flow && x.dir && x.topo && x.status && x.band && x.def && x.real && x.works && x.ids.length && x.gap && x.quit && x.note));
ok("每类都有代表条目", T.every(x => x.ids.length >= 3), T.map(x => x.k + ":" + x.ids.length).join(" "));
ok("条目编号全部存在", T.every(x => x.ids.every(id => q("!!BY['" + id + "']"))));
ok("案例锚点全部存在", T.every(x => x.refs.every(r => q("!!CSD['" + r + "']"))));
ok("带宽阶梯 6 行且与形态一一对应", B.length === 6 && B.every(b => T.some(x => x.k === b.k)));
ok("带宽阶梯三列都非空", B.every(b => b.act && b.want && b.src));
ok("flow 分布合计 = 67", Object.keys(F).reduce((s, k) => s + F[k], 0) === 67);
ok("flow 分布与条目真实一致", Object.keys(F).every(k => F[k] === q("IT.filter(d=>d.flow===" + JSON.stringify(k) + ").length")));
ok("状态取值在配色表内", T.every(x => q("LSTC[" + JSON.stringify(x.status) + "]") !== undefined), T.map(x => x.status).join(" / "));

/* ---------- 2) 总览页 ---------- */
const v = go("#/link");
ok("#/link 渲染 H1", v.indexOf("<h1>脑机连接：谁连谁</h1>") >= 0);
ok("六张连接卡", (v.match(/class="lcard"/g) || []).length === 6, "实际 " + (v.match(/class="lcard"/g) || []).length);
ok("五个小节齐全", ["一、六类连接形态", "二、带宽阶梯", "三、从 67 条想象看信息流", "四、能不能断开", "五、这一层的口径与局限"].every(t => v.indexOf(t) >= 0));
ok("带宽阶梯 6 行链接", (v.match(/#\/link\/LK[1-6]/g) || []).length >= 12);
ok("断开权 6 行", (v.match(/<tr><td style="white-space:nowrap"><a href="#\/link\/LK/g) || []).length === 6 && T.every(x => plain(v).indexOf(x.quit.slice(0, 10)) >= 0));
ok("flow 分布标注合计 67 条", v.indexOf("合计 67 条") >= 0);
ok("无 undefined / NaN", v.indexOf("undefined") < 0 && v.indexOf("NaN") < 0);
ok("关键事实在位", v.indexOf("81.25%") >= 0 && v.indexOf("10.39 bit/s") >= 0 && v.indexOf("50–200 ms") >= 0);

/* ---------- 3) 六个详情页 ---------- */
const bad = [];
T.forEach(x => {
  const d = go("#/link/" + x.k);
  const pv = plain(d);
  if (d.indexOf("<h1>") < 0 || d.indexOf(x.name) < 0) bad.push(x.k + ":title");
  if (pv.indexOf(x.def.slice(0, 16)) < 0) bad.push(x.k + ":def");
  if (pv.indexOf(x.quit.slice(0, 14)) < 0) bad.push(x.k + ":quit");
  if (pv.indexOf(x.note.slice(0, 14)) < 0) bad.push(x.k + ":note");
  const rows = (d.match(/<tr><td><a href="#\/item\//g) || []).length;
  if (rows !== x.ids.length) bad.push(x.k + ":rows=" + rows + "/" + x.ids.length);
  if (d.indexOf("pager") < 0) bad.push(x.k + ":pager");
  if (d.indexOf("undefined") >= 0 || d.indexOf("NaN") >= 0) bad.push(x.k + ":undefined");
});
ok("六个详情页结构齐全", bad.length === 0, bad.slice(0, 6).join(","));
ok("详情页案例链接可达", q("DB.link.types.every(x=>x.refs.every(r=>!!CSD[r]))"));

/* ---------- 4) 路由、别名、大小写归一、兜底 ---------- */
[["#/link", "脑机连接：谁连谁"], ["#/links", "脑机连接：谁连谁"], ["#/connections", "脑机连接：谁连谁"],
 ["#/brainlink", "脑机连接：谁连谁"], ["#/topology", "脑机连接：谁连谁"], ["#/connect", "脑机连接：谁连谁"],
 ["#/link/LK4", "LK4"], ["#/LINK/lk4", "脑 ↔ 脑"]].forEach(([u, mark]) => {
  ok("路由 " + u, go(u).indexOf(mark) >= 0);
});
ok("未知编号兜底", go("#/link/LK99").indexOf("未找到") >= 0 || go("#/link/LK99").indexOf("不存在") >= 0 || go("#/link/LK99").length < 3000);

/* ---------- 5) 侧栏、搜索、首页入口 ---------- */
q("tree()");
const tree = els["#tree"].innerHTML;
ok("侧栏有连接层入口", tree.indexOf('href="#/link"') >= 0);
const sug = q('(function(){suggest("脑机连接");return document.querySelector("#suggest").innerHTML})()');
ok("搜索「脑机连接」命中", sug.indexOf("#/link") >= 0);
const sug2 = q('(function(){suggest("连接形态");return document.querySelector("#suggest").innerHTML})()');
ok("搜索「连接形态」命中", sug2.indexOf("#/link") >= 0);
ctx.location.hash = "#/";
vm.runInContext("route()", ctx);
const home = els["#view"].innerHTML;
ok("首页有连接层区块", home.indexOf("脑机连接：六类形态，谁连谁") >= 0 && home.indexOf('href="#/link"') >= 0);
ok("首页六张形态卡", T.every(x => home.indexOf('href="#/link/' + x.k + '"') >= 0));
ok("其他入口网格有连接层", home.indexOf("脑机连接形态图谱") >= 0);

console.log(fails ? "\n" + fails + " FAIL" : "\nPASS");

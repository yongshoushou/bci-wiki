const fs = require('fs');
const vm = require('vm');

// 1) 数据源里的规范化出处值
const src = fs.readFileSync('脑机接口功能想象_直观版.html', 'utf8');
const items = vm.runInNewContext(src.match(/const DATA=(\[[\s\S]*?\n\]);/)[1]);
const WORK = {};
items.forEach(d => { WORK[d.id] = d.work; });

// 2) 只改「表头含『出处』」那张表的那一列，其余表格一律不碰
const p = '脑机接口功能想象对照表.md';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
let col = -1, width = 0, n = 0;
const changed = [];

for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim();
  if (!t.startsWith('|')) { col = -1; continue; }

  const cells = lines[i].split('|');
  const heads = cells.map(c => c.trim());

  if (heads.indexOf("出处") !== -1 || heads.indexOf("作品") !== -1) {          // 表头行：锁定列号
    col = Math.max(heads.indexOf('出处'), heads.indexOf('作品'));
    width = cells.length;
    continue;
  }
  if (col < 0) continue;
  if (/^\|[\s:|-]+\|$/.test(t)) continue;      // 分隔行
  if (cells.length !== width) continue;

  const id = heads[1] || heads[0];
  if (!/^[CMX]\d{2}$/.test(id)) continue;
  if (!WORK[id]) continue;
  if (heads[col] === WORK[id]) continue;

  changed.push(id + ': ' + heads[col] + ' → ' + WORK[id]);
  cells[col] = ' ' + WORK[id] + ' ';
  lines[i] = cells.join('|');
  n++;
}
fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('同步 ' + n + ' 行（仅出处列）');
changed.forEach(c => console.log('  ' + c));

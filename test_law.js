const fs=require("fs"),vm=require("vm");
const h=fs.readFileSync("脑机接口功能想象_Wiki.html","utf8");
const src=h.match(/<script>([\s\S]*?)<\/script>/)[1];
try{new Function(src)}catch(e){console.log("SYNTAX ERROR: "+e.message);process.exit(1)}
const mk=()=>({innerHTML:"",textContent:"",value:"",classList:{toggle(){},add(){},remove(){},contains(){return false}},addEventListener(){},focus(){},blur(){},select(){},getAttribute(){return ""},querySelector(){return null},querySelectorAll(){return []},dataset:{},style:{}});
const els={};
const document={getElementById(id){return els[id]||(els[id]=mk())},querySelector(s){return els[s]||(els[s]=mk())},querySelectorAll(){return []},addEventListener(){}};
const ctx={document,window:{addEventListener(){},scrollTo(){}},location:{hash:"#/"},URLSearchParams,console};
vm.createContext(ctx);vm.runInContext(src,ctx);
const go=x=>{ctx.location.hash=x;vm.runInContext("route()",ctx);return els["#view"].innerHTML};
const q=c=>vm.runInContext(c,ctx);
console.log("syntax=OK");
console.log("law dims="+q("DB.law.dims.length")+" levels="+q("DB.law.levels.length")+" | V="+q("DB.law.levels.map(l=>l.k+':'+l.ids.length).join(' ')"));

const L=go("#/law");
console.log("law page: "+L.length+" chars | Jcards="+(L.match(/href="#\/law\/J\d"/g)||[]).length+" | matrix="+(L.match(/class="mtx"/g)||[]).length+" | vpill="+(L.match(/class="epill"/g)||[]).length);
console.log("  五条结论="+/先读这五条结论/.test(L)+" 边界表="+/判断边界/.test(L)+" 局限="+/五条局限/.test(L)+" 免责="+/不构成对任何具体行为的合法性判断/.test(L));

let bad=[];
q('DB.law.dims.map(x=>x.k).join(" ")').split(" ").forEach(k=>{
  const v=go("#/law/"+k);
  if(v.indexOf("本议题下的条目")<0||v.indexOf("现行法依据")<0)bad.push(k);
});
console.log("8 议题页: "+(bad.length?"FAIL "+bad.join(","):"OK"));
const j4=go("#/law/J4");
console.log("  J4 rows="+(j4.match(/<tr>/g)||[]).length+" itemLinks="+(j4.match(/href="#\/item\//g)||[]).length);

bad=[];let noBadge=[];
q('DB.items.map(d=>d.id).join(" ")').split(" ").forEach(id=>{
  const v=go("#/item/"+id);
  if(v.indexOf("法律评估")<0)bad.push(id);
  const it=q('DB.items.filter(d=>d.id==="'+id+'")[0]');
  if(it.law.v>=3&&v.indexOf("未作判断")<0)noBadge.push(id);
});
console.log("67 条目页含法律评估: "+(bad.length?"FAIL "+bad.join(","):"OK"));
console.log("V3/V4 页标注「未作判断」: "+(noBadge.length?"FAIL "+noBadge.join(","):"OK ("+q('DB.items.filter(d=>d.law.v>=3).length')+" 条)"));
const c09=go("#/item/C09");
console.log("C09 判词="+(/故意杀人/.test(c09)?"OK":"MISS")+" | 依据="+(/刑法》第232条/.test(c09)?"OK":"MISS")+" | tags="+(c09.match(/class="ntag"/g)||[]).length);
const m10=go("#/item/M10");
console.log("M10 (V4) badge="+(/未作判断/.test(m10)?"OK":"MISS")+" | basis="+(/无对应行为类型/.test(m10)?"OK":"MISS"));

// 表格筛选
ctx.location.hash="#/table";vm.runInContext("route()",ctx);
const th=els["#view"].innerHTML;
console.log("表格表头含法律="+/<th>法律<\/th>/.test(th)+" | V筛选组="+/id="tv"/.test(th)+" | cols="+(th.match(/<th>/g)||[]).length);
const pick=v=>{vm.runInContext("TBL.q='';TBL.g='ALL';TBL.lv='ALL';TBL.e='ALL';TBL.v='"+v+"';drawTable()",ctx);return els["#tc"].textContent+" | rows="+((els["#tbody"].innerHTML.match(/<tr>/g)||[]).length)+" | 未判断标记="+((els["#tbody"].innerHTML.match(/未判断/g)||[]).length)};
["V0","V1","V2","V3","V4","ALL"].forEach(v=>console.log("  filter "+v+" -> "+pick(v)));

// 搜索法条与议题名
const s=(t)=>{vm.runInContext("TBL.q="+JSON.stringify(t)+";TBL.v='ALL';drawTable()",ctx);return els["#tc"].textContent};
["医疗器械","刑法","个人信息保护","精神隐私","杀人","不进入评价"].forEach(t=>console.log("  search «"+t+"» -> "+s(t)));

// 首页 / 目录 / 索引 / 搜索
const hm=go("#/");
console.log("首页: 法律分布块="+/法律状态分布/.test(hm)+" | tile="+/法律分类标准/.test(hm)+" | 结论含不判断="+/条不判断/.test(hm));
console.log("目录树: "+(els["#tree"].innerHTML.indexOf("法律分类标准")>=0?"OK":"MISS")+" | 法律入口="+(els["#tree"].innerHTML.indexOf("法律分类标准")>=0?"OK":"MISS"));
const ix=go("#/index");
console.log("索引: 按法律议题="+/按法律议题/.test(ix)+" 按法律状态="+/按法律状态/.test(ix));
go("#/");vm.runInContext('suggest("法律")',ctx);
console.log("suggest 法律 hits="+((els["#suggest"].innerHTML.match(/#\/law/g)||[]).length));
vm.runInContext('suggest("网络安全")',ctx);
console.log("suggest 网络安全 hits="+((els["#suggest"].innerHTML.match(/<a href=/g)||[]).length));

// 全站回归
bad=[];
q('DB.items.map(d=>d.id).join(" ")').split(" ").forEach(id=>{if(go("#/item/"+id).indexOf("参见")<0)bad.push(id)});
q('DB.works.map(w=>w.key).join(" ")').split(" ").forEach(k=>{if(go("#/work/"+k).indexOf("作品清单")<0)bad.push("work:"+k)});
q('DB.glossary.map(c=>c.key).join(" ")').split(" ").forEach(k=>{if(go("#/concept/"+k).indexOf("关联条目")<0)bad.push("concept:"+k)});
q('DB.groups.map(g=>g.key).join(" ")').split(" ").forEach(k=>{if(go("#/group/"+k).indexOf("组内互为参见")<0)bad.push("group:"+k)});
q('DB.hot.concat(DB.lib).map(w=>w.key).join(" ")').split(" ").forEach(k=>{if(go("#/hot/"+k).indexOf("核心脑机想象")<0)bad.push("hot:"+k)});
q('DB.ethics.dims.map(x=>x.k).join(" ")').split(" ").forEach(k=>{if(go("#/ethics/"+k).indexOf("本议题下的条目")<0)bad.push("eth:"+k)});
["#/","#/scale","#/reality","#/about","#/glossary","#/index","#/table","#/ethics","#/law"].forEach(r=>{const v=go(r);if(v.length<500)bad.push("page:"+r)});
console.log("全站回归 broken="+bad.length+(bad.length?" "+bad.join(","):""));
console.log("meta created-2026-11-04="+/name="created" content="2026-11-04"/.test(h)+" size="+(Buffer.byteLength(h)/1024).toFixed(1)+"KB");

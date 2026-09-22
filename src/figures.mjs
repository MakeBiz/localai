// Считает цифры для статических страниц тем же движком, что и калькулятор
import fs from 'fs'; import vm from 'vm';
const code=fs.readFileSync(new URL('./engine.js',import.meta.url),'utf8');
const ctx={location:{search:'',hash:''},console};vm.createContext(ctx);
vm.runInContext(code+'\n;globalThis.API={rngS,calc,payback,DEF,PACKS,EMP,mm,rng,rub,CFG,TASKS};',ctx);
const {rngS,calc,payback,DEF,PACKS,EMP,mm,rng,rub,CFG,TASKS}=ctx.API;
const st=o=>({...JSON.parse(JSON.stringify(DEF)),...o,integr:o.integr||[]});
const one=o=>{const s=st(o),r=calc(s),p=payback(r,s);return {lo:r.lo,hi:r.hi,range:rng(r.lo,r.hi),short:rngS(r.lo,r.hi),from:'от '+mm(r.lo)+' ₽',title:r.title,nodes:r.nodes.map(n=>(n.q>1?n.q+'× ':'')+n.l),now:rub(p.now),year:rub(p.now*12),time:rub(p.time),yearTime:rub(p.time*12),m:p.m||null,mSubs:p.mSubs||null,y3:p.y3best>0?rub(p.y3best):null,support:rub(r.support)};};
const out={packs:PACKS.map(p=>({id:p.id,n:p.n,w:p.w,inc:p.inc,tag:p.tag||'',...one(p.s)})),econ:[],cases:{},seatPrice:CFG.seatPrice};
for(const [i,mode] of [[4,'work'],[6,'247'],[9,'247'],[11,'247']]){const e=EMP[i];out.econ.push({emp:e,empIdx:i,...one({emp:i,tasks:['chat','kb','docs'],mode,seats:String(e),price:String(CFG.seatPrice)})});}
out.cases.distr=one({emp:5,tasks:['chat','kb','docs','sales'],mode:'247',integr:['crm','onec'],seats:'40',price:'2500'});
out.cases.cc=one({emp:9,tasks:['chat','kb','sales','calls'],calls:'750',mode:'nodown',integr:['crm','tel'],seats:'100',price:'2500',api:'150000'});
out.cases.prod=one({emp:10,tasks:['chat','kb','docs','code','data'],quality:'high',mode:'247',integr:['onec'],seats:'150',price:'2500'});
out.art=one({emp:6,tasks:['chat','kb','docs'],mode:'247',seats:'100',price:'2500'});
process.stdout.write(JSON.stringify(out));

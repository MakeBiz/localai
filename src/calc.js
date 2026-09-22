/* ===================== СТРАНИЦА «РАСЧЁТ» ===================== */
const L=document.getElementById('c2Left'),R=document.getElementById('c2Right'),MB=document.getElementById('c2Bar');
function chips(key,opts,multi){
  const cur=S[key];
  return '<div class="chips">'+opts.map(o=>{const on=multi?cur.includes(o[0]):cur===o[0];return '<button type="button" class="chip'+(on?' on':'')+'" data-k="'+key+'" data-v="'+o[0]+'"'+(multi?' data-multi="1"':'')+'>'+(multi&&on?'✓ ':'')+o[1]+(o[2]?'<small>'+o[2]+'</small>':'')+'</button>';}).join('')+'</div>';
}
const row=(label,body,hint)=>'<div class="c2-row"><div class="c2-lab">'+label+(hint?'<span>'+hint+'</span>':'')+'</div>'+body+'</div>';
function payInputs(){
  const st=cur();
  return '<div class="c2-sep">Окупаемость: сколько тратите сейчас</div><p class="c2-note">Если подписок пока нет, оставьте как есть: посчитаем, сколько стоили бы подписки на эту команду. Часы и стоимость часа это допущения, поменяйте под себя</p>'+
   '<div class="pay-in"><label>Платных подписок<input type="number" min="0" data-pay="seats" value="'+(S.seats||'')+'" placeholder="'+seatsAuto(st)+'"></label>'+
   '<label>Подписка, ₽ в месяц<input type="number" min="0" data-pay="price" value="'+(S.price||'')+'" placeholder="'+fN(CFG.seatPrice)+'"></label>'+
   '<label>API и боты, ₽ в месяц<input type="number" min="0" data-pay="api" value="'+(S.api||'')+'" placeholder="0"></label>'+
   '<label>Экономия времени, часов в неделю<input type="number" min="0" step="0.5" data-pay="hrs" value="'+(S.hrs||'')+'" placeholder="'+CFG.hrsDefault+'"></label>'+
   '<label>Стоимость часа сотрудника, ₽<input type="number" min="0" data-pay="rate" value="'+(S.rate||'')+'" placeholder="'+CFG.rateDefault+'"></label></div>';
}
function renderCustom(){
  const e=EMP[S.emp];
  let h=row('Сколько сотрудников будут пользоваться ИИ','<div class="emp"><b>'+(S.emp===EMP.length-1?'5 000+':fN(e))+'</b> человек</div><input type="range" min="0" max="'+(EMP.length-1)+'" value="'+S.emp+'" id="c2Emp" aria-label="Сотрудники"><div class="rng-l"><span>5</span><span>100</span><span>1 000</span><span>5 000+</span></div>');
  h+=row('Что должен делать ИИ','<div class="tasks2">'+Object.entries(TASKS).map(([k,x])=>'<button type="button" class="t2'+(S.tasks.includes(k)?' on':'')+'" data-task="'+k+'"><span class="t2i">'+IC[x.ic]+'</span><span><b>'+x.t+'</b><small>'+x.d+'</small></span></button>').join('')+'</div>','можно несколько');
  const sub=[];
  if(S.tasks.includes('bot'))sub.push(row('Сколько сообщений от клиентов в месяц',chips('bot',OPT.bot)));
  if(S.tasks.includes('calls'))sub.push(row('Сколько минут звонков в месяц',chips('calls',OPT.calls)));
  if(S.tasks.includes('voice'))sub.push(row('Сколько разговоров робот ведёт одновременно',chips('voice',OPT.voice)));
  if(S.tasks.includes('media'))sub.push(row('Сколько картинок и видео',chips('media',OPT.media)));
  if(sub.length)h+='<div class="c2-sub">'+sub.join('')+'</div>';
  h+='<div class="c2-sep">Требования</div>';
  h+=row('Когда должна работать система',chips('mode',OPT.mode));
  h+=row('Качество ответов',chips('quality',OPT.quality),'чем сложнее задачи, тем мощнее сервер');
  h+=row('Рост нагрузки за год',chips('growth',OPT.growth));
  h+=row('С чем связать',chips('integr',OPT.integr,true),'по желанию');
  h+='<div class="c2-sep">Оборудование и поддержка</div>';
  h+=row('Сервер',chips('supply',OPT.supply));
  h+=row('Сопровождение',chips('support',OPT.support));
  h+=payInputs();
  L.innerHTML=h;
  L.querySelector('#c2Emp').oninput=ev=>{S.emp=+ev.target.value;L.querySelector('.emp b').textContent=S.emp===EMP.length-1?'5 000+':fN(EMP[S.emp]);const ph=L.querySelector('[data-pay="seats"]');if(ph)ph.placeholder=seatsAuto(S);renderRight();};
}
function renderPacks(){
  const P0=PACKS[PK.i];const st=packState();
  let h='<div class="packs2">'+PACKS.map((p,i)=>{const r=calc({...DEF,...p.s,integr:p.s.integr||[]});return '<button type="button" class="pk2'+(i===PK.i?' on':'')+'" data-pk="'+i+'">'+(p.tag?'<span class="tag">'+p.tag+'</span>':'')+'<b>'+p.n+'</b><small>'+p.w+'</small><span class="pr">от '+mm(r.lo)+' ₽</span><ul>'+p.inc.map(x=>'<li>'+x+'</li>').join('')+'</ul></button>';}).join('')+'</div>';
  const adds=ADDONS.filter(k=>!P0.s.tasks.includes(k));
  if(adds.length)h+='<div class="c2-lab" style="margin-top:22px">Добавить к пакету</div><div class="addons2">'+adds.map(k=>{const on=PK.add.includes(k);const w=on?st.tasks:[...st.tasks,k],wo=st.tasks.filter(x=>x!==k);const d=calc({...st,tasks:w}).lo-calc({...st,tasks:wo}).lo;return '<button type="button" class="ad2'+(on?' on':'')+'" data-add="'+k+'"><span>'+(on?'✓ ':'+ ')+TASKS[k].t+'</span><i>+'+mm(Math.max(d,0.05))+' ₽</i></button>';}).join('')+'</div>';
  h+=payInputs();
  h+='<button type="button" class="btn btn-ghost c2-tune" data-tune="1">Настроить этот пакет под себя →</button>';
  L.innerHTML=h;
}
function packState(){const p=PACKS[PK.i];return {...JSON.parse(JSON.stringify(DEF)),...JSON.parse(JSON.stringify(p.s)),integr:[...(p.s.integr||[])],tasks:[...new Set([...p.s.tasks,...PK.add])],seats:S.seats,price:S.price,api:S.api,hrs:S.hrs,rate:S.rate};}
function cur(){return S.view==='packs'?packState():S;}
function renderRight(){
  const s=cur(),r=calc(s),pb=payback(r,s);
  const sup=OPT.support.find(o=>o[0]===s.support)[1];
  const cut=x=>x.replace('от ','').replace(' до ','-');
  let h='<div class="c2-res"><div class="l">'+(S.view==='packs'?'Пакет «'+PACKS[PK.i].n+'»':'Ориентировочно под ключ')+'</div>';
  h+='<div class="p">'+(r.indiv.length?'от '+mm(r.lo)+' ₽':rng(r.lo,r.hi))+'</div><div class="c">'+r.title+'</div>';
  if(r.indiv.length)h+='<div class="indiv">Нужен индивидуальный расчёт: '+r.indiv.join(', ')+'</div>';
  h+='<table class="c2-t">';
  h+='<tr><td>Оборудование, сборка, тест</td><td>'+(r.inc?rngS(r.eq[0],r.eq[1]):s.supply==='own'?'ваше':'в аренде')+'</td></tr>';
  h+='<tr><td>Установка и подключение задач</td><td>'+rngS(r.svc[0],r.svc[1])+'</td></tr>';
  if(r.ha[1])h+='<tr><td>Резервирование сети и питания</td><td>'+rngS(r.ha[0],r.ha[1])+'</td></tr>';
  if(r.rent)h+='<tr><td>Аренда сервера в месяц</td><td>'+rub(r.rent[0])+'-'+rub(r.rent[1])+'</td></tr>';
  h+='<tr class="mo"><td>'+sup+', в месяц</td><td>'+rub(r.support)+'</td></tr></table>';
  // окупаемость
  const mTxt=m=>(m[0]===m[1]?m[0]:m[0]+'-'+m[1])+' '+plural(m[1],'месяц','месяца','месяцев');
  h+='<div class="pb"><div class="pb-h">Окупаемость</div>';
  h+='<div class="pb-r"><span>Подписки и API сейчас</span><b>'+rub(pb.now)+' в мес</b></div>';
  h+='<div class="pb-r"><span>Время сотрудников, которое освободит ИИ</span><b>'+rub(pb.time)+' в мес</b></div>';
  h+='<div class="pb-r"><span>Сопровождение'+(r.rent?' и аренда':'')+'</span><b>−'+rub(pb.own)+' в мес</b></div>';
  if(pb.m){h+='<div class="pb-big">Окупится за '+mTxt(pb.m)+'</div>';if(pb.y3best>0)h+='<div class="pb-s">Эффект за 3 года: '+(pb.y3>0?'от '+rub(pb.y3)+' до ':'до ')+rub(pb.y3best)+'</div>';}
  else h+='<div class="pb-big sm">С такими допущениями не окупается</div>';
  h+='<div class="pb-s">'+(pb.mSubs?'Только за счёт подписок: '+mTxt(pb.mSubs):'Только за счёт подписок сервер не окупится, основной эффект даёт время сотрудников и безопасность данных')+'</div>';
  h+='</div>';
  h+='<div class="c2-nodes">'+r.nodes.map(n=>'<span>'+(n.q>1?n.q+'× ':'')+n.l+(EXPERT?' · '+CFG.vram[n.k]:'')+'</span>').join('')+'<span>Установка 300 000 ₽</span></div>';
  h+='<button type="button" class="btn btn-primary btn-block" data-lead="1">Получить точный расчёт</button>';
  h+='<div class="fine">Предварительная вилка на '+CFG.priceDate+'. Окупаемость сценарная и зависит от допущений по часам и стоимости часа. Доставка и подготовка площадки считаются отдельно</div>';
  if(EXPERT)h+='<pre class="xp">'+r.why.join('\n')+'\n'+r.nodes.map(n=>n.q+'× '+n.k+' '+CFG.vram[n.k]).join('\n')+'</pre>';
  R.innerHTML=h+'</div>';
  if(MB)MB.innerHTML='<div><small>Ориентировочно'+(pb.m?' · окупится за '+pb.m[0]+'-'+pb.m[1]+' мес':'')+'</small><b>'+(r.indiv.length?'от '+mm(r.lo)+' ₽':rng(r.lo,r.hi))+'</b></div><button type="button" class="btn btn-primary" data-goto="1">Подробнее</button>';
}
function plural(n,a,b,c){n=Math.abs(n)%100;const m=n%10;if(n>10&&n<20)return c;if(m>1&&m<5)return b;if(m===1)return a;return c;}
function render(){
  document.querySelectorAll('#calcMode button').forEach(b=>b.classList.toggle('on',b.dataset.mode===S.view));
  S.view==='packs'?renderPacks():renderCustom();renderRight();
  try{localStorage.setItem('mb_localai_v3',JSON.stringify({S,PK}));}catch(e){}
}
document.getElementById('calcMode').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;S.view=b.dataset.mode;render();});
L.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.task){const k=b.dataset.task;S.tasks=S.tasks.includes(k)?(S.tasks.length>1?S.tasks.filter(x=>x!==k):S.tasks):[...S.tasks,k];return render();}
  if(b.dataset.k){const k=b.dataset.k,v=b.dataset.v;if(b.dataset.multi)S[k]=S[k].includes(v)?S[k].filter(x=>x!==v):[...S[k],v];else S[k]=v;return render();}
  if(b.dataset.pk){PK={i:+b.dataset.pk,add:[]};return render();}
  if(b.dataset.add){const k=b.dataset.add;PK.add=PK.add.includes(k)?PK.add.filter(x=>x!==k):[...PK.add,k];return render();}
  if(b.dataset.tune){S={...packState(),view:'custom'};return render();}
});
L.addEventListener('input',e=>{const el=e.target;if(el.dataset.pay){S[el.dataset.pay]=el.value;renderRight();try{localStorage.setItem('mb_localai_v3',JSON.stringify({S,PK}));}catch(x){}}});
function goLead(){const f=document.getElementById('leadForm');f.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{const n=document.getElementById('lfName');n&&n.focus({preventScroll:true});},500);}
R.addEventListener('click',e=>{if(e.target.closest('[data-lead]'))goLead();});
if(MB){MB.addEventListener('click',e=>{if(e.target.closest('[data-goto]'))R.scrollIntoView({behavior:'smooth',block:'start'});});
  const calcEl=document.getElementById('calc');
  if('IntersectionObserver' in window)new IntersectionObserver(en=>{MB.classList.toggle('show',en[0].isIntersecting&&innerWidth<=900);},{threshold:.05}).observe(calcEl);}

/* ---------- заявка → Bitrix24 ---------- */
function utm(){const p=new URLSearchParams(location.search);const o={};['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k=>{if(p.get(k))o[k.toUpperCase()]=p.get(k);});return o;}
async function submitLead(){
  const g=id=>((document.getElementById(id)||{}).value||'').trim();
  const err=document.getElementById('lfErr');err.textContent='';
  const name=g('lfName'),phone=g('lfPhone'),company=g('lfCompany'),email=g('lfEmail');
  if(!name||!(phone||email)){err.textContent='Укажите имя и телефон или email';return;}
  if(!document.getElementById('lfConsent').checked){err.textContent='Нужно согласие на обработку данных';return;}
  const s=cur(),r=calc(s),pb=payback(r,s);
  const opt=(k,v)=>((OPT[k]||[]).find(o=>o[0]===v)||[,v])[1];
  const lines=[
    'Режим: '+(S.view==='packs'?'пакет «'+PACKS[PK.i].n+'»':'индивидуально'),
    'Сотрудников: '+EMP[s.emp],'Задачи: '+s.tasks.map(k=>TASKS[k].t).join('; '),
    'Работа: '+opt('mode',s.mode)+', качество: '+opt('quality',s.quality)+', рост: '+opt('growth',s.growth),
    s.tasks.includes('bot')?'Бот: '+opt('bot',s.bot):'',s.tasks.includes('calls')?'Звонки: '+opt('calls',s.calls):'',s.tasks.includes('voice')?'Голос: '+opt('voice',s.voice):'',s.tasks.includes('media')?'Медиа: '+opt('media',s.media):'',
    'Интеграции: '+(s.integr.map(k=>opt('integr',k)).join(', ')||'нет'),'Сервер: '+opt('supply',s.supply)+', сопровождение: '+opt('support',s.support),
    'Вилка: '+rng(r.lo,r.hi)+(r.indiv.length?' (ИНДИВИДУАЛЬНО: '+r.indiv.join(', ')+')':''),
    'Сейчас на ИИ-сервисы: '+rub(pb.now)+'/мес ('+pb.seats+' подписок × '+rub(pb.price)+(pb.api?' + API '+rub(pb.api):'')+')'+(pb.m?', окупаемость '+pb.m[0]+'-'+pb.m[1]+' мес (время '+pb.hrs+' ч/нед по '+pb.rate+' ₽)':''),
    'Состав: '+r.nodes.map(n=>n.q+'× '+n.k+' '+CFG.vram[n.k]).join(', '),'Версия: '+CFG.version
  ].filter(Boolean).join('\n');
  const fields={TITLE:'Калькулятор локального ИИ: '+(company||name),NAME:name,COMPANY_TITLE:company,SOURCE_ID:'WEB',SOURCE_DESCRIPTION:'Калькулятор локального ИИ',COMMENTS:lines,OPPORTUNITY:Math.round(r.lo*1e6),CURRENCY_ID:'RUB',PHONE:phone?[{VALUE:phone,VALUE_TYPE:'WORK'}]:[],EMAIL:email?[{VALUE:email,VALUE_TYPE:'WORK'}]:[],...utm()};
  const btn=document.getElementById('lfSubmit');btn.disabled=true;btn.textContent='Отправляем...';
  try{
    if(CFG.bitrixWebhook){const res=await fetch(CFG.bitrixWebhook.replace(/\/?$/,'/')+'crm.lead.add.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields})});if(!res.ok)throw 0;}
    else console.log('[MakeBiz] Заявка (демо, вебхук не задан):',fields);
    document.getElementById('leadForm').innerHTML='<div class="form-ok"><div class="ic">'+IC.check+'</div><h3>Заявка принята</h3><p>Инженер проверит расчёт и свяжется с вами, чтобы назначить техническую встречу.</p></div>';
  }catch(e){btn.disabled=false;btn.textContent='Получить точный расчёт';err.textContent='Не получилось отправить, попробуйте ещё раз или позвоните нам';}
}
document.getElementById('lfSubmit').onclick=submitLead;

/* старт: восстановление, параметры из ссылки (?packs, ?emp=, ?tasks=) */
try{const sv=JSON.parse(localStorage.getItem('mb_localai_v3')||'null');if(sv&&sv.S&&Array.isArray(sv.S.tasks)){S={...S,...sv.S};PK=sv.PK||PK;}}catch(e){}
(function(){const q=new URLSearchParams(location.search);
  if(q.has('packs'))S.view='packs';
  if(q.get('pack')){const i=PACKS.findIndex(p=>p.id===q.get('pack'));if(i>=0){S.view='packs';PK={i,add:[]};}}
  if(q.get('emp')){S.emp=Math.max(0,Math.min(EMP.length-1,+q.get('emp')));S.view='custom';}
  if(q.get('tasks')){const t=q.get('tasks').split(',').filter(k=>TASKS[k]);if(t.length){S.tasks=t;S.view='custom';}}
  if(q.get('seats'))S.seats=q.get('seats');if(q.get('price'))S.price=q.get('price');})();
render();

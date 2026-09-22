
'use strict';
/* =====================================================================
   MakeBiz · Калькулятор локального ИИ v3 (простой: индивидуально + пакеты)
   Все цены в CFG (аналог админки). Внутренний технический режим: ?expert=1
   ===================================================================== */
const CFG={
  version:'2026.09-v3', priceDate:'сентябрь 2026',
  bitrixWebhook:'', // https://portal.bitrix24.ru/rest/1/xxxx/  (пусто = демо-режим)
  eq:{A:[1.2,1.7],B:[2.2,3.2],C:[3.2,4.8],D:[5,7.5],E:[9.5,15],F:[13,20]}, // оборудование, млн ₽
  asm:{A:.1,B:.15,C:.15,D:.15,E:.15,F:.25},                               // сборка и тест, млн ₽
  speech:{S1:[2.2,3.2],S2:[3.4,4.8],S4:[5.5,8]},
  vram:{A:'1×32 ГБ',B:'1×32 ГБ ECC',C:'1×48 ГБ ECC',D:'1×96 ГБ ECC',E:'2×96 ГБ',F:'4×96 ГБ',S1:'1×32 ГБ',S2:'2×32 ГБ',S4:'4×32 ГБ'},
  names:{A:'Рабочая станция для небольшой команды',B:'Бизнес-сервер начального уровня',C:'Универсальный бизнес-сервер',D:'Корпоративный AI-сервер',E:'Корпоративный multi-GPU сервер',F:'Высоконагруженный AI-контур'},
  install:.3,                  // базовая установка и настройка, млн ₽
  integr:{crm:.2,onec:.25,tel:.1,mail:.1},
  ha:{infra:[1.5,4],svc:.25},
  rent:[.035,.05],             // аренда в месяц, доля от стоимости оборудования
  support:{self:50000,help:120000,sla:250000},
  svcSpread:1.3                // верхняя граница услуг = нижняя × 1,3
};
const TASKS={
  chat:{t:'AI-чат для сотрудников',d:'Письма, тексты, идеи, ответы на рабочие вопросы',svc:0,ic:'chat'},
  kb:{t:'База знаний',d:'Ответы по регламентам и документам компании',svc:.2,ic:'book'},
  docs:{t:'Документы, договоры, КП',d:'Подготовка и проверка по шаблонам',svc:.2,ic:'doc'},
  sales:{t:'Продажи и CRM',d:'Ассистент менеджеров, заполнение CRM',svc:.2,ic:'deal'},
  bot:{t:'Бот для клиентов',d:'Сайт и мессенджеры, круглосуточно',svc:.15,ic:'bot'},
  calls:{t:'Анализ звонков',d:'Расшифровка, резюме, контроль скрипта',svc:.25,ic:'phone'},
  voice:{t:'Голосовой робот',d:'Сам звонит и отвечает клиентам',svc:.35,ic:'voice'},
  media:{t:'Картинки и видео',d:'Креативы, редактирование фото, ролики',svc:.25,ic:'image'},
  code:{t:'Помощь разработчикам',d:'Код, тесты, документация',svc:.15,ic:'code'},
  data:{t:'Аналитика данных',d:'Вопросы к CRM, 1С и таблицам обычным языком',svc:.2,ic:'chart'}
};
const EMP=[5,10,20,30,50,75,100,150,200,300,500,750,1000,2000,5000];
const OPT={
  mode:[['work','Рабочее время','Для сотрудников в офисе'],['247','Круглосуточно','Перерыв на обслуживание допустим'],['nodown','Без остановок','Запасной сервер, простой недопустим']],
  quality:[['std','Стандартное','Письма, ответы, простые документы'],['high','Высокое','Сложные документы, анализ, код'],['max','Максимальное','Самые мощные модели']],
  growth:[['0','Без роста'],['.5','+50% за год'],['1','В 2 раза']],
  calls:[['50','до 50 тыс. минут'],['250','50-250 тыс.'],['750','250-750 тыс.'],['1500','больше 750 тыс.']],
  bot:[['100','до 100 тыс. сообщений'],['500','до 500 тыс.'],['1000','до 1 млн'],['5000','больше 1 млн']],
  voice:[['10','до 10 линий'],['40','до 40'],['100','до 100'],['300','больше 100']],
  media:[['low','Немного, до 5 тыс. в месяц'],['mid','Много, до 50 тыс.'],['high','Очень много или видео']],
  integr:[['crm','Bitrix24 / amoCRM'],['onec','1С'],['tel','Телефония'],['mail','Почта']],
  supply:[['turnkey','Подберите и поставьте','Оборудование под ключ'],['own','Уже есть сервер','Проверим и установим'],['rent','Аренда','Без покупки, помесячно']],
  support:[['self','Справимся сами','Мониторинг по желанию'],['help','Нужна поддержка','Обновления и помощь'],['sla','24×7','Дежурство и SLA']]
};
const PACKS=[
  {id:'start',n:'Старт',w:'Команда до 30 человек, пилот',s:{emp:3,tasks:['chat','kb'],mode:'work'},inc:['AI-чат и база знаний','Рабочая станция','Установка под ключ']},
  {id:'biz',n:'Бизнес',w:'Компания 30-100 человек',s:{emp:6,tasks:['chat','kb','docs','sales'],mode:'247',integr:['crm']},inc:['Чат, база знаний, документы','Ассистент в CRM','Круглосуточно'],tag:'Чаще выбирают'},
  {id:'corp',n:'Корпорация',w:'100-300 человек, клиентский сервис',s:{emp:9,tasks:['chat','kb','docs','sales','bot'],mode:'247',integr:['crm','onec']},inc:['Всё из «Бизнес»','Бот для клиентов','Интеграция с 1С']},
  {id:'ent',n:'Enterprise',w:'300+ человек, без простоя',s:{emp:12,tasks:['chat','kb','docs','sales','bot','data'],mode:'nodown',quality:'high',integr:['crm','onec']},inc:['Всё из «Корпорации»','Аналитика данных','Запасной сервер 24×7']}
];
const ADDONS=['calls','voice','media','code','data','bot'];
const DEF={emp:6,tasks:['chat'],mode:'work',quality:'std',growth:'.5',calls:'50',bot:'100',voice:'10',media:'low',integr:[],supply:'turnkey',support:'help',seats:'',price:'',api:'',hrs:'',rate:''};
let S={view:'custom',...JSON.parse(JSON.stringify(DEF))};
let PK={i:1,add:[]};
const EXPERT=/expert=1/.test(location.search+location.hash);

/* ---------- иконки ---------- */
const P='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const IC={
  chat:P+'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/></svg>',
  book:P+'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/></svg>',
  doc:P+'<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6"/></svg>',
  deal:P+'<path d="M3 7h18v12H3z"/><path d="M8 7V5h8v2M3 12h18"/></svg>',
  bot:P+'<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 13h.01M15 13h.01"/></svg>',
  phone:P+'<path d="M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
  voice:P+'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  image:P+'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/></svg>',
  code:P+'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/></svg>',
  chart:P+'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15l3-3 2 2 5-5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* ===================== ДВИЖОК ===================== */
const LV=['B','C','D','E','F'];
function calc(s){
  const t=k=>s.tasks.includes(k);
  const emp=EMP[s.emp]; const why=[]; let indiv=[];
  let i=emp<=30?0:emp<=100?1:emp<=300?2:emp<=1000?3:4; why.push(emp+' сотрудников → уровень '+(i+1));
  if((t('bot')||t('sales'))&&i<3){i++;why.push('Продажи или клиентский бот → +1 уровень');}
  if(t('code')&&emp>100)i=Math.max(i,3);
  if(t('bot')){const m=+s.bot;if(m>=1000){i=Math.max(i,3);why.push('Бот до 1 млн сообщений → минимум уровень 4');}if(m>1000){i=Math.max(i,4);indiv.push('больше 1 млн сообщений бота');}}
  if(s.quality==='high'){i=Math.min(4,i+1);why.push('Высокое качество → +1 уровень');}
  if(s.quality==='max'){i=Math.min(4,Math.max(i+2,3));indiv.push('максимальные модели');why.push('Максимальное качество → +2 уровня');}
  if(s.growth==='1'&&i<4){i++;why.push('Рост в 2 раза → +1 уровень');}
  let main=LV[i];
  if(i===0&&s.mode==='work'&&!t('bot')&&!t('voice'))main='A';
  const txt=['chat','kb','docs','sales','bot','code','data'].some(t);const nodes=txt?[{k:main,q:s.mode==='nodown'?2:1,l:'Основной сервер'}]:[];
  const g=s.growth==='0'?1:s.growth==='.5'?1.5:2;
  if(t('calls')){const m=+s.calls;const sp=m<=50?null:m<=250?'S1':m<=750?'S2':'S4';if(sp)nodes.push({k:sp,q:1,l:'Сервер для звонков',sp:1});else why.push('Звонки до 50 тыс. минут помещаются на основной сервер');if(+s.calls>=1500)indiv.push('больше 750 тыс. минут звонков');}
  if(t('voice')){const n=+s.voice*1.5;const sp=n<=10?'S1':n<=40?'S2':'S4';nodes.push({k:sp,q:s.mode==='nodown'?2:1,l:'Голосовой сервер',sp:1});if(+s.voice>100)indiv.push('больше 100 голосовых линий');}
  if(t('media')){let k=s.media==='low'?(emp<=100&&txt?null:'B'):s.media==='mid'?'D':'E';if(k)nodes.push({k,q:!txt&&s.mode==='nodown'?2:1,l:'Сервер для картинок и видео'});else why.push('Небольшой объём картинок идёт на основной сервер в очереди');if(s.media==='high')indiv.push('генерация видео');}
  if(!nodes.length)nodes.push({k:main,q:s.mode==='nodown'?2:1,l:'Основной сервер'});
  nodes.forEach(n=>{if(n.k==='A'&&(nodes.length>1||s.mode!=='work'))n.k='B';});
  // деньги (млн ₽)
  let eqLo=0,eqHi=0,asm=0;
  nodes.forEach(n=>{const e=n.sp?CFG.speech[n.k]:CFG.eq[n.k];eqLo+=e[0]*n.q;eqHi+=e[1]*n.q;asm+=(n.sp?(n.k==='S4'?.25:.15):CFG.asm[n.k])*n.q;});
  const inc=s.supply==='turnkey';
  let svc=CFG.install+s.tasks.reduce((a,k)=>a+TASKS[k].svc,0)+s.integr.reduce((a,k)=>a+CFG.integr[k],0);
  if(s.mode==='nodown')svc+=CFG.ha.svc;
  const svcR=[svc,svc*CFG.svcSpread];
  const haR=s.mode==='nodown'?CFG.ha.infra:[0,0];
  const lo=(inc?eqLo+asm:0)+svcR[0]+haR[0], hi=(inc?eqHi+asm:0)+svcR[1]+haR[1];
  const nq=nodes.reduce((a,n)=>a+n.q,0);
  const title=nq>1?'AI-контур из '+nq+' серверов':(nodes[0].sp?'Речевой сервер':CFG.names[nodes[0].k]||CFG.names[main]);
  return {lo,hi,eq:[eqLo+asm,eqHi+asm],inc,svc:svcR,ha:haR,nodes,title,indiv:[...new Set(indiv)],why,main,
    rent:s.supply==='rent'?[eqLo*1e6*CFG.rent[0],eqHi*1e6*CFG.rent[1]]:null,support:CFG.support[s.support]};
}

/* ---------- формат ---------- */
const fN=n=>Number(n).toLocaleString('ru-RU');
const m1=x=>(Math.round(x*10)/10).toString().replace('.',',');
const mm=x=>x<1?fN(Math.round(x*1000/10)*10)+' тыс.':m1(x)+' млн';
const rng=(a,b)=>'от '+mm(a)+' до '+mm(b)+' ₽';
const rngS=(a,b)=>{const x=mm(a),y=mm(b);const u=t=>t.split(' ').slice(1).join(' ');return (u(x)===u(y)?x.split(' ')[0]:x)+'-'+y+' ₽';};
const rub=x=>x>=1e6?m1(x/1e6)+' млн ₽':fN(Math.round(x/1000))+' тыс. ₽';


/* ---------- окупаемость ---------- */
CFG.seatPrice=2500;  // ₽/мес за подписку на зарубежный ИИ-сервис на человека (по умолчанию)
CFG.hrsDefault=2;    // часов в неделю, которые ИИ экономит активному сотруднику (допущение)
CFG.rateDefault=700; // стоимость часа сотрудника с налогами, ₽ (допущение)
function seatsAuto(s){return Math.max(1,Math.round(EMP[s.emp]*0.5));}
function payback(r,s){
  const seats=+s.seats>0?+s.seats:seatsAuto(s), price=+s.price>0?+s.price:CFG.seatPrice, api=+s.api>0?+s.api:0;
  const hrs=(s.hrs===''||s.hrs==null||isNaN(+s.hrs))?CFG.hrsDefault:+s.hrs, rate=+s.rate>0?+s.rate:CFG.rateDefault;
  const now=seats*price+api, time=Math.round(seats*hrs*4.33*rate);
  const own=r.support+(r.rent?(r.rent[0]+r.rent[1])/2:0);
  const res={seats,price,api,hrs,rate,now,time,own,yearNow:now*12,yearTime:time*12};
  const mm_=(save)=>{if(save<=0)return null;const a=Math.max(1,Math.round(r.lo*1e6/save)),b=Math.max(1,Math.round(r.hi*1e6/save));return a>120?null:[a,Math.min(b,999)];};
  res.saveSubs=now-own; res.mSubs=mm_(res.saveSubs);
  res.saveAll=now+time-own; res.m=mm_(res.saveAll);
  res.y3=res.saveAll*36-r.hi*1e6; res.y3best=res.saveAll*36-r.lo*1e6;
  return res;
}

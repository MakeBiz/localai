/* ===== общие скрипты всех страниц ===== */
(function(){
  const bg=document.getElementById('burger'),mm_=document.getElementById('mobileMenu');
  if(bg&&mm_){bg.onclick=()=>mm_.classList.toggle('open');mm_.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mm_.classList.remove('open')));}
  document.querySelectorAll('.faq-item .faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')));
  // плавающая кнопка расчёта: прячется, пока видны первый экран, калькулятор или финальный блок
  const fc=document.getElementById('floatCta');
  if(fc&&'IntersectionObserver' in window){
    if(location.pathname.replace(/\/$/,'')==='/raschet'){fc.remove();}
    else{const vis=new Set();const io=new IntersectionObserver(es=>{es.forEach(x=>x.isIntersecting?vis.add(x.target):vis.delete(x.target));fc.classList.toggle('show',vis.size===0);},{threshold:.02});
      document.querySelectorAll('[data-nofloat],footer').forEach(el=>io.observe(el));}
  }
})();

/* ===== главная: «Сколько вы сэкономите» ===== */
(function(){
  const el=document.getElementById('heroPay');if(!el||typeof calc!=='function')return;
  const E=[[3,'до 30'],[6,'30-100'],[9,'100-300'],[12,'300+']];
  const PR=[[2000,'2 000 ₽'],[2500,'2 500 ₽'],[4000,'4 000 ₽']];
  const hp={e:6,price:2500};
  const mTxt=m=>(m[0]===m[1]?m[0]:m[0]+'-'+m[1])+' мес';
  function draw(){
    const emp=EMP[hp.e];
    const s={...JSON.parse(JSON.stringify(DEF)),emp:hp.e,tasks:['chat','kb','docs'],mode:hp.e>=6?'247':'work',seats:String(emp),price:String(hp.price)};
    const r=calc(s),pb=payback(r,s);
    const link='/raschet?emp='+hp.e+'&tasks=chat,kb,docs&seats='+emp+'&price='+hp.price;
    el.innerHTML='<div class="hc-top"><b>Сколько вы сэкономите</b><i>считается сразу</i></div>'+
      '<div class="hc-q">Сотрудников в компании</div><div class="hc-o">'+E.map(x=>'<button type="button" data-e="'+x[0]+'" class="'+(x[0]===hp.e?'on':'')+'">'+x[1]+'</button>').join('')+'</div>'+
      '<div class="hc-q">Подписка на ИИ на человека в месяц</div><div class="hc-o t3">'+PR.map(x=>'<button type="button" data-p="'+x[0]+'" class="'+(x[0]===hp.price?'on':'')+'">'+x[1]+'</button>').join('')+'</div>'+
      '<div class="hp-rows"><div><span>Подписки на всех в год</span><b>'+rub(pb.now*12)+'</b></div><div><span>Время сотрудников в год</span><b>'+rub(pb.time*12)+'</b></div><div><span>Свой ИИ под ключ</span><b>'+rngS(r.lo,r.hi)+'</b></div></div>'+
      '<div class="hc-res"><small>Окупаемость</small><b>'+(pb.m?'за '+mTxt(pb.m):'дольше 10 лет')+'</b><span>'+(pb.mSubs?'только за счёт подписок: '+mTxt(pb.mSubs):'основной эффект: время сотрудников и защита данных')+'</span></div>'+
      '<a href="'+link+'" class="btn btn-primary btn-lg">Подробный расчёт →</a><div class="hc-fine">Сотрудник экономит 2 часа в неделю, час стоит 700 ₽. Всё можно поменять в калькуляторе</div>';
  }
  el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.e)hp.e=+b.dataset.e;if(b.dataset.p)hp.price=+b.dataset.p;draw();});
  draw();
})();

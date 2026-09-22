#!/usr/bin/env python3
"""Сборка многостраничного сайта MakeBiz · Локальный ИИ.
Запуск: python3 src/build.py  → пишет всё в public/
Цифры (пакеты, окупаемость, примеры) считает тот же движок, что и калькулятор (src/engine.js через node).
Новость добавить: дописать словарь в ARTICLES ниже и пересобрать."""
import json, subprocess, pathlib, html, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'src', ROOT / 'public'
BASE = 'https://localai-dusky.vercel.app'   # поменять при переезде на свой домен
PHONE, PHONE_HREF, EMAIL = '+7 495 000-00-00', 'tel:+74950000000', 'ai@makebiz.ru'
TODAY = datetime.date.today().isoformat()
F = json.loads(subprocess.check_output(['node', str(SRC / 'figures.mjs')]))

def esc(s): return html.escape(s, quote=True)
def nr(n): return f'{n:,}'.replace(',', ' ')
def months(m):
    if not m: return None
    a, b = m
    n = b % 100; w = 'месяцев' if 10 < n < 20 else ('месяц' if n % 10 == 1 else ('месяца' if 1 < n % 10 < 5 else 'месяцев'))
    return (f'{a}' if a == b else f'{a}-{b}') + ' ' + w

# ---------------------------------------------------------------- каркас
NAV = [('/', 'Главная'), ('/#problemy', 'Почему локально'), ('/#bezopasnost', 'Безопасность'), ('/keysy', 'Кейсы'), ('/novosti', 'Новости'), ('/#faq', 'Вопросы')]

def head(title, desc, path, ld=None, noindex=False):
    lds = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in (ld or []))
    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{BASE}{path}">
{'<meta name="robots" content="noindex">' if noindex else ''}
<meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{BASE}{path}"><meta property="og:locale" content="ru_RU">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
{lds}
</head>
<body>
'''

def header(active):
    ACT = ' class="act"'
    links = ''.join(f'<a href="{h}"{ACT if h == active else ""}>{t}</a>' for h, t in NAV)
    return f'''<header>
  <div class="wrap nav">
    <a href="/" class="logo"><span class="mark">M</span><span>MakeBiz<small>Локальный ИИ</small></span></a>
    <nav class="nav-links">{links}</nav>
    <div class="nav-cta">
      <a class="nav-phone" href="{PHONE_HREF}">{PHONE}</a>
      <a href="/raschet" class="btn btn-primary">Рассчитать стоимость</a>
      <button class="burger" id="burger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobileMenu">{links}<a href="/raschet" class="btn btn-primary">Рассчитать стоимость</a></div>
'''

def footer(scripts=('site',)):
    sc = ''.join(f'<script src="/assets/{s}.js"></script>' for s in scripts)
    return f'''<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a href="/" class="logo"><span class="mark">M</span><span>MakeBiz<small>Локальный ИИ</small></span></a>
        <p style="margin-top:16px;max-width:340px">Внедряем корпоративный ИИ на серверах компании: подбираем оборудование, устанавливаем модели, подключаем CRM и 1С, сопровождаем.</p>
      </div>
      <div>
        <h5>Разделы</h5>
        <a href="/raschet">Расчёт стоимости</a>
        <a href="/raschet?packs">Готовые пакеты</a>
        <a href="/keysy">Кейсы</a>
        <a href="/novosti">Новости</a>
        <a href="/#faq">Вопросы</a>
      </div>
      <div>
        <h5>Контакты</h5>
        <a href="{PHONE_HREF}">{PHONE}</a>
        <a href="mailto:{EMAIL}">{EMAIL}</a>
        <a href="/raschet#leadForm">Оставить заявку</a>
      </div>
    </div>
    <div class="foot-legal">
      ООО «МейкБиз» (демо-реквизиты) · ИНН 0000000000 · ОГРН 0000000000000 · Москва
      <div class="disc">Стоимость и окупаемость на сайте предварительные и не являются офертой. Локальное размещение помогает контролировать обработку данных, но само по себе не гарантирует соответствие требованиям закона: оно обеспечивается архитектурой, регламентами и документами. Информация о законодательстве носит справочный характер и не является юридической консультацией.</div>
      <div class="foot-links"><a href="#">Политика обработки персональных данных</a><a href="#">Согласие на обработку</a><a href="#">Политика cookie</a></div>
    </div>
  </div>
</footer>
<a href="/raschet" class="float-cta" id="floatCta">Рассчитать стоимость</a>
{sc}
</body>
</html>
'''

def page_hero(eyebrow, h1, lead, crumbs):
    cr = ' <span>/</span> '.join(f'<a href="{h}">{t}</a>' if h else f'<span>{t}</span>' for h, t in crumbs)
    return f'''<section class="phero" data-nofloat>
  <div class="wrap">
    <div class="crumbs">{cr}</div>
    <span class="eyebrow">{eyebrow}</span>
    <h1>{h1}</h1>
    <p class="lead">{lead}</p>
  </div>
</section>
'''

def crumbs_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + p} for i, (p, n) in enumerate(items)]}

ORG = {"@context": "https://schema.org", "@type": "Organization", "name": "MakeBiz", "url": BASE, "email": EMAIL, "telephone": PHONE}
FAQ_HOME = [
    ('Чем свой ИИ отличается от ChatGPT?', 'Для сотрудника почти ничем: такой же чат, который пишет тексты, отвечает на вопросы и работает с документами. Разница в том, где он живёт. Свой ИИ стоит на вашем сервере или в выделенном ЦОД в России, данные не уходят во внешний сервис, а платить за каждый запрос и подписку на человека не нужно.'),
    ('Это поможет соблюдать 152-ФЗ?', 'Локальный ИИ убирает главный риск: персональные данные клиентов и сотрудников не передаются в зарубежный сервис. Но соответствие закону обеспечивает вся система: права доступа, журналирование, регламенты и документы. Их мы помогаем выстроить вместе с вашим юристом.'),
    ('Как сотрудник может вынести данные, и что мешает это сделать?', 'В публичном чате сотрудник сам решает, что туда вставить, и никто этого не видит. В своём ИИ доступ настраивается по ролям, каждый запрос и ответ записывается в журнал, выгрузки ограничиваются правилами, а при увольнении доступ закрывается вместе с корпоративной учётной записью.'),
    ('Сколько стоит и когда окупится?', f'Установка и настройка системы стоит 300 000 ₽, решение под ключ вместе с сервером начинается от 1,8 млн ₽. Окупаемость зависит от числа сотрудников: за счёт подписок и сэкономленного времени компания на 100 человек окупает систему примерно за {months(F["econ"][1]["m"])}. Точно посчитать под себя можно в калькуляторе.'),
    ('А если модели устареют?', 'Бизнес-логика, данные, права и интеграции отделены от конкретной модели. Когда выходит модель лучше, мы проверяем её на ваших задачах и заменяем без перестройки системы.'),
    ('Можно без покупки сервера?', 'Да. Если сервер уже есть, проверим совместимость и установим систему. Для пилота можно арендовать сервер помесячно в российском дата-центре.'),
    ('Кто будет это обслуживать?', 'Мы. Сопровождение включает мониторинг, обновления, резервное копирование и помощь пользователям. Если есть свой администратор, обучим его и останемся на второй линии.'),
]

def faq_html(items):
    return ''.join(f'<div class="faq-item"><div class="faq-q">{esc(q)}<span class="fx">+</span></div><div class="faq-a"><p>{esc(a)}</p></div></div>' for q, a in items)
def faq_ld(items):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}

def packs_html():
    out = []
    for p in F['packs']:
        tag = f'<span class="tag">{esc(p["tag"])}</span>' if p['tag'] else ''
        inc = ''.join(f'<li>{esc(x)}</li>' for x in p['inc'])
        out.append(f'<a class="pp" href="/raschet?pack={p["id"]}">{tag}<b>{esc(p["n"])}</b><small>{esc(p["w"])}</small><span class="pr">{p["from"]}</span><ul>{inc}</ul><span class="go">Посчитать →</span></a>')
    return ''.join(out)

# ---------------------------------------------------------------- ГЛАВНАЯ
def home():
    econ_rows = ''.join(f'<tr><td>{nr(e["emp"])} сотрудников</td><td>{e["year"]}</td><td>{e["yearTime"]}</td><td>{e["short"]}</td><td><b>{months(e["m"]) or "не окупается"}</b></td></tr>' for e in F['econ'])
    ld = [ORG, faq_ld(FAQ_HOME), {"@context": "https://schema.org", "@type": "Service", "name": "Корпоративный ИИ на серверах компании под ключ", "provider": {"@type": "Organization", "name": "MakeBiz"}, "areaServed": "RU", "offers": {"@type": "Offer", "price": "300000", "priceCurrency": "RUB", "description": "Базовая установка и настройка системы"}}]
    return head('Корпоративный ИИ на ваших серверах: данные внутри компании · MakeBiz',
                'Свой аналог ChatGPT на сервере компании: данные не уходят во внешние сервисы, нет оплаты за каждый запрос, проще соблюдать 152-ФЗ. Установка от 300 000 ₽, расчёт стоимости и окупаемости за 30 секунд.', '/', ld) + header('/') + f'''
<section class="hero" id="top" data-nofloat>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">Корпоративный ИИ под ключ</span>
      <h1>ИИ для компании, который не выносит данные наружу</h1>
      <p class="lead">Сотрудники уже копируют договоры, базы клиентов и переписку в зарубежные нейросети. Мы ставим такой же ИИ на ваш сервер: работает как ChatGPT, данные остаются внутри компании, а за каждый запрос и подписку на человека платить не нужно.</p>
      <div class="hero-cta">
        <a href="/raschet" class="btn btn-primary btn-lg">Рассчитать стоимость и окупаемость</a>
        <a href="#problemy" class="btn btn-ghost btn-lg">Зачем это бизнесу</a>
      </div>
      <div class="hero-points"><span>Данные внутри компании</span><span>Проще соблюдать 152-ФЗ</span><span>Без оплаты за каждый запрос</span></div>
    </div>
    <div class="hero-calc" id="heroPay"></div>
  </div>
  <a href="#problemy" class="scroll-hint" aria-label="Листать дальше"><span>Почему это важно</span><i></i></a>
</section>

<section class="strip">
  <div class="wrap strip-grid">
    <div><b>1-3% выручки</b><span>оборотный штраф за повторную утечку персональных данных</span></div>
    <div><b>0 ₽</b><span>за запросы и подписки после запуска своего ИИ</span></div>
    <div><b>300 000 ₽</b><span>установка и настройка системы</span></div>
    <div><b>от 1,8 млн ₽</b><span>решение под ключ вместе с сервером</span></div>
  </div>
</section>

<section class="section" id="problemy">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Почему это важно сейчас</span>
      <h2>Публичные нейросети удобны. Но у компании с ними четыре проблемы</h2>
      <p>Запретить сотрудникам ИИ уже не получится: он экономит часы работы. Вопрос в том, где этот ИИ работает и кто видит ваши данные.</p>
    </div>
    <div class="pains">
      <div class="pain"><span class="pn">01</span><h3>Данные уходят за периметр</h3><p>Менеджер вставляет в чат договор, бухгалтер загружает выгрузку из 1С, разработчик копирует код. Всё это оказывается на серверах зарубежного сервиса, и вы не контролируете, что с этим происходит дальше.</p></div>
      <div class="pain"><span class="pn">02</span><h3>Риски по закону о персональных данных</h3><p>С 1 марта 2023 года передавать персональные данные за рубеж можно только после уведомления Роскомнадзора. С 30 мая 2025 года за утечки выросли штрафы, а за повторную утечку он оборотный: 1-3% выручки, от 25 до 500 млн ₽.</p><a class="src" href="https://www.consultant.ru/law/hotdocs/87300.html" target="_blank" rel="noopener">Закон 420-ФЗ, КонсультантПлюс</a></div>
      <div class="pain"><span class="pn">03</span><h3>Расходы растут вместе с командой</h3><p>Подписка на каждого сотрудника плюс оплата API за каждый запрос бота. Чем активнее пользуются ИИ, тем больше счёт, а цены привязаны к курсу доллара.</p></div>
      <div class="pain"><span class="pn">04</span><h3>Зависимость от чужого сервиса</h3><p>Доступ могут ограничить, условия и цены поменять в любой момент. Часть сервисов доступна только через обходные пути, и это ещё одна брешь в безопасности.</p></div>
    </div>
  </div>
</section>

<section class="section section--soft" id="reshenie">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Решение</span>
      <h2>Свой ИИ на вашем сервере закрывает все четыре</h2>
      <p>Для сотрудников это такой же чат с ИИ, только он знает ваши регламенты и продукты. Для компании это контролируемая система с понятной стоимостью.</p>
    </div>
    <div class="sol">
      <div><span class="sol-k">Данные</span><h3>Не покидают компанию</h3><p>Сервер стоит у вас или в выделенном ЦОД в России. Можно работать вообще без выхода в интернет.</p></div>
      <div><span class="sol-k">Закон</span><h3>Проще соблюдать 152-ФЗ</h3><p>Нет передачи персональных данных во внешние ИИ-сервисы. Права, журналы и регламенты выстраиваем вместе с вашим юристом.</p></div>
      <div><span class="sol-k">Деньги</span><h3>Фиксированная стоимость</h3><p>Платите один раз за сервер и установку, дальше только сопровождение. Никаких токенов и подписок на каждого.</p></div>
      <div><span class="sol-k">Контроль</span><h3>Независимость от поставщика</h3><p>Открытые модели работают без внешних API. Появится модель лучше, заменим без перестройки системы.</p></div>
    </div>
  </div>
</section>

<section class="section sec-dark" id="bezopasnost">
  <div class="wrap sec-grid">
    <div>
      <span class="eyebrow">Безопасность</span>
      <h2>Сотрудник не унесёт то, к чему у него нет доступа</h2>
      <p class="lead">В публичном чате сотрудник сам решает, что туда вставить, и никто этого не видит. В своём ИИ всё наоборот: доступы, журналы и правила настраивает компания.</p>
      <a href="/raschet" class="btn btn-primary btn-lg">Рассчитать для своей компании</a>
    </div>
    <ul class="sec-list">
      <li><b>Доступ по ролям</b><span>Менеджер видит только свои сделки и документы, бухгалтерия свои, руководитель всё</span></li>
      <li><b>Журнал каждого запроса</b><span>Видно, кто, когда и что спрашивал у ИИ и что получил в ответ</span></li>
      <li><b>Контроль выгрузок</b><span>Правила, какие данные можно копировать и выгружать, а какие нет</span></li>
      <li><b>Вход через корпоративную учётку</b><span>Сотрудник уволился, доступ к ИИ закрылся вместе с учётной записью</span></li>
      <li><b>Закрытый контур</b><span>Сервер может работать совсем без интернета, данным просто некуда уйти</span></li>
      <li><b>Подтверждение действий</b><span>ИИ-агент не изменит CRM или 1С без согласования человеком</span></li>
    </ul>
  </div>
</section>

<section class="section" id="effekt">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Эффект</span>
      <h2>Сколько вы сэкономите и когда окупится</h2>
      <p>Считаем две вещи: подписки и API, которые больше не нужны, и время, которое ИИ освобождает у сотрудников. В примере сотрудник экономит 2 часа в неделю, час стоит 700 ₽, подписка {nr(F['seatPrice'])} ₽ в месяц.</p>
    </div>
    <div class="tbl-wrap"><table class="cmp econ-t">
      <thead><tr><th>Компания</th><th>Подписки в год</th><th>Время сотрудников в год</th><th>Свой ИИ под ключ</th><th>Окупаемость</th></tr></thead>
      <tbody>{econ_rows}</tbody>
    </table></div>
    <p class="note-s">Пример для задач «чат, база знаний, документы». Окупаемость сценарная: подставьте свои цифры в калькуляторе. Если считать только подписки, небольшим командам сервер окупается дольше, основной эффект даёт время сотрудников и безопасность данных.</p>
    <a href="/raschet" class="btn btn-primary btn-lg" style="margin-top:24px">Посчитать свою окупаемость</a>
  </div>
</section>

<section class="section section--soft" id="vozmozhnosti">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Что умеет</span>
      <h2>Один ИИ для всей компании</h2>
      <p>Начинают обычно с чата и базы знаний, потом подключают продажи, звонки и документы на том же сервере.</p>
    </div>
    <div class="grid g3 abil">
      <div class="card"><h3>Чат для сотрудников</h3><p>Письма, тексты, идеи, анализ информации. Как ChatGPT, только внутри компании</p></div>
      <div class="card"><h3>База знаний</h3><p>Отвечает по регламентам, инструкциям и договорам со ссылкой на источник</p></div>
      <div class="card"><h3>Документы и КП</h3><p>Готовит договоры и коммерческие предложения по вашим шаблонам, проверяет риски</p></div>
      <div class="card"><h3>Продажи и CRM</h3><p>Разбирает заявки, готовит ответы, заполняет карточки в Bitrix24 или amoCRM</p></div>
      <div class="card"><h3>Звонки</h3><p>Расшифровывает разговоры, проверяет скрипт, достаёт договорённости</p></div>
      <div class="card"><h3>Бот для клиентов</h3><p>Отвечает на сайте и в мессенджерах круглосуточно, передаёт заявки менеджерам</p></div>
    </div>
  </div>
</section>

<section class="section" id="pakety">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Готовые пакеты</span>
      <h2>Выберите пакет под размер компании</h2>
      <p>Цены под ключ, вместе с сервером, установкой и подключением задач. Любой пакет можно донастроить в калькуляторе.</p>
    </div>
    <div class="pps">{packs_html()}</div>
  </div>
</section>

<section class="section section--soft" id="kak">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">Как внедряем</span>
      <h2>От расчёта до работающей системы</h2>
      <p>Сначала проверяем, что задача работает на ваших данных, и только потом закупаем оборудование.</p>
    </div>
    <div class="timeline">
      <div class="tl-step"><div class="dot">1</div><h4>Расчёт</h4><ul><li>Задачи и объёмы</li><li>Требования к данным</li><li>Вилка стоимости</li></ul></div>
      <div class="tl-step"><div class="dot">2</div><h4>Проверка</h4><ul><li>Тест моделей на ваших задачах</li><li>Скорость и качество</li><li>Точная смета</li></ul></div>
      <div class="tl-step"><div class="dot">3</div><h4>Пилот</h4><ul><li>Первые пользователи</li><li>Подключение CRM и 1С</li><li>Замер эффекта</li></ul></div>
      <div class="tl-step"><div class="dot">4</div><h4>Запуск</h4><ul><li>Сервер и установка</li><li>Права и журналы</li><li>Обучение</li></ul></div>
      <div class="tl-step"><div class="dot">5</div><h4>Сопровождение</h4><ul><li>Обновления моделей</li><li>Мониторинг</li><li>Новые задачи</li></ul></div>
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap">
    <div class="section-head center"><span class="eyebrow">Вопросы</span><h2>Частые вопросы</h2></div>
    <div class="faq">{faq_html(FAQ_HOME)}</div>
  </div>
</section>

<section class="section" id="final" data-nofloat>
  <div class="wrap">
    <div class="final-cta">
      <span class="eyebrow">Следующий шаг</span>
      <h2>Узнайте стоимость и окупаемость для своей компании</h2>
      <p>30 секунд в калькуляторе, без регистрации. Точную конфигурацию подтвердим на технической встрече.</p>
      <div class="hero-cta"><a href="/raschet" class="btn btn-primary btn-lg">Рассчитать стоимость</a><a href="/raschet?packs" class="btn btn-ghost btn-lg">Готовые пакеты</a></div>
    </div>
  </div>
</section>
''' + footer(('engine', 'site'))

# ---------------------------------------------------------------- РАСЧЁТ
def raschet():
    faq = [FAQ_HOME[3], ('Что входит в цену?', 'Сервер под ваши задачи, его сборка и тестирование, базовая установка и настройка системы за 300 000 ₽ (ОС, среда моделей, основная модель, API, веб-интерфейс, мониторинг, роли доступа, документация, обучение администратора) и подключение выбранных задач и интеграций. Доставка и подготовка площадки считаются отдельно.'), ('Почему вилка, а не точная цена?', 'Цена оборудования зависит от курса, наличия, гарантии и НДС, а мощность подтверждается тестом на ваших задачах. Поэтому до технической встречи показываем честный диапазон, а точную сумму фиксируем в коммерческом предложении.'), FAQ_HOME[5]]
    ld = [ORG, crumbs_ld([('/', 'Главная'), ('/raschet', 'Расчёт стоимости')]), faq_ld(faq)]
    return head('Калькулятор стоимости и окупаемости корпоративного ИИ · MakeBiz',
                'Рассчитайте стоимость своего ИИ на сервере компании и срок окупаемости за 30 секунд: выберите размер компании и задачи или готовый пакет. Установка от 300 000 ₽.', '/raschet', ld) + header('/raschet') + page_hero(
        'Калькулятор', 'Стоимость и окупаемость вашего ИИ', 'Выберите размер компании и задачи или готовый пакет. Цена и срок окупаемости пересчитываются сразу, без регистрации.', [('/', 'Главная'), (None, 'Расчёт стоимости')]) + '''
<section class="calc-section" id="calc">
  <div class="wrap">
    <div class="calc2">
      <div class="seg" id="calcMode"><button type="button" data-mode="custom" class="on">Собрать под себя</button><button type="button" data-mode="packs">Готовые пакеты</button></div>
      <div class="c2-body"><div id="c2Left"></div><aside class="c2-right" id="c2Right"></aside></div>
    </div>
    <div class="lead-form c2-lead" id="leadForm">
      <h3>Получить точный расчёт</h3>
      <p>Инженер проверит вашу конфигурацию, подберёт модели и оборудование и назначит техническую встречу. Выбранные параметры придут вместе с заявкой.</p>
      <div class="two-col"><div class="field"><label>Имя</label><input type="text" id="lfName" placeholder="Как к вам обращаться"></div><div class="field"><label>Телефон</label><input type="tel" id="lfPhone" placeholder="+7 ..."></div></div>
      <div class="two-col"><div class="field"><label>Компания</label><input type="text" id="lfCompany" placeholder="Название компании"></div><div class="field"><label>Email</label><input type="email" id="lfEmail" placeholder="you@company.ru"></div></div>
      <label class="consent"><input type="checkbox" id="lfConsent"> Согласен на обработку персональных данных. Расчёт предварительный и не является офертой.</label>
      <div class="lf-row"><button class="btn btn-primary btn-lg" id="lfSubmit" type="button">Получить точный расчёт</button><span id="lfErr"></span></div>
    </div>
  </div>
</section>
<div class="c2bar" id="c2Bar"></div>
<section class="section">
  <div class="wrap">
    <div class="section-head center"><span class="eyebrow">Вопросы</span><h2>Про стоимость</h2></div>
    <div class="faq">''' + faq_html(faq) + '''</div>
  </div>
</section>
''' + footer(('engine', 'calc', 'site'))

# ---------------------------------------------------------------- КЕЙСЫ
def keysy():
    C = F['cases']
    def case(k, tag, h, task, inputs, what):
        c = C[k]
        nodes = ', '.join(c['nodes']).lower()
        return f'''<article class="case">
  <div class="case-h"><span class="case-tag">{tag}</span><span class="case-lbl">Расчётный пример</span></div>
  <h2>{h}</h2>
  <p class="case-t">{task}</p>
  <div class="case-g">
    <div><h4>Исходные данные</h4><ul>{''.join(f'<li>{x}</li>' for x in inputs)}</ul></div>
    <div><h4>Что ставим</h4><ul>{''.join(f'<li>{x}</li>' for x in what)}<li>Состав: {esc(nodes)}</li></ul></div>
  </div>
  <div class="case-n">
    <div><small>Бюджет под ключ</small><b>{c['range']}</b></div>
    <div><small>Подписки и API сейчас</small><b>{c['now']} в мес</b></div>
    <div><small>Окупаемость с учётом времени</small><b>{months(c['m']) or 'дольше 10 лет'}</b></div>
    <div><small>Эффект за 3 года</small><b>{('до ' + c['y3']) if c['y3'] else 'в ноль'}</b></div>
  </div>
</article>'''
    body = case('distr', 'Дистрибуция', 'Дистрибьютор, 75 сотрудников: ИИ для отдела продаж', 'Менеджеры тратят часы на ответы клиентам, КП и заполнение CRM, а договоры и прайсы гуляют по публичным чатам.',
                ['75 сотрудников, 40 из них платят за ChatGPT', 'Bitrix24 и 1С', 'Работа круглосуточно'], ['Чат, база знаний по продуктам и прайсам', 'Ассистент в CRM: ответы, КП, карточки', 'Интеграция с Bitrix24 и 1С']) + \
           case('cc', 'Контакт-центр', 'Контакт-центр, 300 сотрудников: звонки и база знаний', 'Персональные данные клиентов в каждом разговоре, отправлять записи во внешние сервисы нельзя.',
                ['300 сотрудников, 100 подписок', 'До 750 тыс. минут звонков в месяц', 'Облачная речевая аналитика и боты: 150 тыс. ₽ в месяц', 'Без остановок, запасной сервер'], ['Расшифровка и аналитика всех звонков', 'Подсказки и база знаний для операторов', 'Интеграция с CRM и телефонией']) + \
           case('prod', 'Производство', 'Производственная компания, 500 сотрудников: закрытый контур', 'Техническая документация и код не должны покидать компанию, часть сотрудников работает в закрытой сети.',
                ['500 сотрудников, 150 подписок', 'Высокое качество: сложные документы и код', 'Интеграция с 1С'], ['Чат и база знаний по техдокументации', 'Помощник разработчиков', 'Аналитика данных из 1С'])
    ld = [ORG, crumbs_ld([('/', 'Главная'), ('/keysy', 'Кейсы')])]
    return head('Кейсы и расчётные примеры внедрения корпоративного ИИ · MakeBiz', 'Расчётные примеры внедрения своего ИИ на сервере компании: дистрибуция, контакт-центр, производство. Бюджет, состав решения и окупаемость.', '/keysy', ld) + header('/keysy') + page_hero(
        'Кейсы', 'Как это выглядит в цифрах', 'Три расчётных примера для типовых компаний: что ставим, сколько стоит и когда окупается. Реальные кейсы клиентов публикуем здесь после согласования с ними.', [('/', 'Главная'), (None, 'Кейсы')]) + f'''
<section class="section"><div class="wrap cases">{body}
<p class="note-s">Расчётные примеры, не клиентские кейсы. Цифры посчитаны тем же калькулятором, что на сайте: сотрудник экономит 2 часа в неделю, час стоит 700 ₽, подписка {nr(F['seatPrice'])} ₽ в месяц.</p>
<div class="cta-box"><div><h3>Посчитайте для своей компании</h3><p>Выберите размер и задачи, окупаемость пересчитается сразу</p></div><a href="/raschet" class="btn btn-primary btn-lg">Рассчитать стоимость</a></div>
</div></section>
''' + footer()

# ---------------------------------------------------------------- НОВОСТИ
A = F['art']
ARTICLES = [
    dict(slug='152-fz-i-nejroseti', date='2026-09-22', tag='Закон и данные',
         title='Нейросети и 152-ФЗ: что компании важно знать до того, как сотрудники загрузят данные в ChatGPT',
         desc='Персональные данные, трансграничная передача, оборотные штрафы за утечки: какие риски несёт компании использование зарубежных нейросетей и как их снизить.',
         body=f'''<p>Сотрудники пользуются нейросетями каждый день: пишут письма, разбирают договоры, анализируют выгрузки. Удобно, но вместе с текстом в зарубежный сервис часто уходят персональные данные клиентов и сотрудников. Разберём, что об этом говорит закон и что делать компании.</p>
<h2>Что считается персональными данными</h2>
<p>ФИО, телефон, email, адрес, паспортные данные, история заказов, запись разговора. Если сотрудник вставил в чат договор с физлицом, выгрузку клиентов из CRM или расшифровку звонка, он передал персональные данные внешнему сервису.</p>
<h2>Передача за рубеж требует уведомления</h2>
<p>С 1 марта 2023 года оператор обязан уведомить Роскомнадзор до начала трансграничной передачи персональных данных. Большинство популярных нейросетей работают на серверах за пределами России, поэтому загрузка в них персональных данных без уведомления и правового основания создаёт риск для компании.</p>
<h2>Штрафы за утечки выросли</h2>
<p>С 30 мая 2025 года действуют изменения, внесённые законом 420-ФЗ: штрафы за утечки персональных данных зависят от их масштаба, а за повторную утечку для компаний введён оборотный штраф, от 1 до 3% выручки, но не менее 25 и не более 500 млн ₽.</p>
<h2>Что делать компании</h2>
<ul>
<li>Принять правила использования ИИ: какие данные нельзя отправлять во внешние сервисы.</li>
<li>Обезличивать данные перед обработкой, если без внешнего сервиса не обойтись.</li>
<li>Перенести работу с чувствительными данными в собственный контур: свой ИИ на сервере компании или в выделенном ЦОД в России, где данные не покидают периметр, а доступы и журналы под контролем.</li>
</ul>
<p>Локальное размещение снимает главный риск, передачу данных во внешний сервис, но соответствие закону обеспечивает вся система: права доступа, журналирование, регламенты и документы. Их стоит выстраивать вместе с юристом.</p>
<p class="art-note">Материал носит справочный характер и не является юридической консультацией. Источники: <a href="https://www.consultant.ru/law/hotdocs/87300.html" target="_blank" rel="noopener">закон 420-ФЗ на КонсультантПлюс</a>, <a href="https://vfs.consulting/ai/transgranichnaya-peredacha-dannyh-v-ii-servisah/" target="_blank" rel="noopener">разбор трансграничной передачи в AI-сервисы</a>.</p>'''),
    dict(slug='okupaemost-lokalnogo-ii', date='2026-09-22', tag='Экономика',
         title='Свой ИИ или подписки на ChatGPT: как посчитать окупаемость',
         desc='Из чего складывается стоимость своего ИИ на сервере компании, что он экономит и как посчитать срок окупаемости на примере компании на 100 человек.',
         body=f'''<p>Подписка на нейросеть кажется копеечной, пока их не становится сотня, а к ним не добавляется оплата API за бота на сайте. Разберём, как сравнить это со своим ИИ на сервере компании.</p>
<h2>Что вы платите сейчас</h2>
<ul><li>Подписки: число сотрудников × цена подписки в месяц. В расчётах берём {nr(F['seatPrice'])} ₽ на человека.</li><li>API: оплата за запросы ботов и автоматизаций, растёт вместе с нагрузкой.</li><li>Скрытое: курсовые риски, оплата через посредников, время на обходы блокировок.</li></ul>
<h2>Сколько стоит свой ИИ</h2>
<ul><li>Сервер под ваши задачи, его сборка и тестирование.</li><li>Установка и настройка системы: 300 000 ₽.</li><li>Подключение задач и интеграций: CRM, 1С, телефония.</li><li>Сопровождение: мониторинг, обновления, помощь пользователям, ежемесячно.</li></ul>
<h2>Что он экономит</h2>
<p>Подписки и API перестают быть нужны. Но главный эффект в другом: ИИ освобождает время сотрудников. Если человек экономит хотя бы 2 часа в неделю, а час его работы стоит компании 700 ₽, это около {A['time']} в месяц на 100 активных пользователей.</p>
<h2>Пример: компания на 100 человек</h2>
<p>Задачи: чат, база знаний и документы, работа круглосуточно. Решение под ключ стоит {A['range']}. Подписки обходятся примерно в {A['now']} в месяц, время сотрудников ещё около {A['time']}. С учётом сопровождения система окупается примерно за {months(A['m'])}.</p>
<p>Если считать только подписки, срок заметно дольше: небольшим командам сервер за счёт одних подписок не окупается. Поэтому окупаемость стоит считать вместе со временем сотрудников и ценой риска утечки.</p>
<p>Посчитать под свою компанию можно в <a href="/raschet">калькуляторе</a>: там можно поменять число подписок, цену, часы экономии и стоимость часа.</p>''')
]

def news_index():
    cards = ''.join(f'<a class="news-c" href="/novosti/{a["slug"]}"><span class="news-t">{a["tag"]} · {datetime.date.fromisoformat(a["date"]).strftime("%d.%m.%Y")}</span><h3>{esc(a["title"])}</h3><p>{esc(a["desc"])}</p><span class="go">Читать →</span></a>' for a in ARTICLES)
    ld = [ORG, crumbs_ld([('/', 'Главная'), ('/novosti', 'Новости')])]
    return head('Новости и статьи о корпоративном ИИ и локальных LLM · MakeBiz', 'Новости о локальных нейросетях, законодательстве о данных и экономике корпоративного ИИ.', '/novosti', ld) + header('/novosti') + page_hero(
        'Новости', 'Новости и статьи', 'Локальные модели, законы о данных, экономика корпоративного ИИ. Пишем коротко и по делу.', [('/', 'Главная'), (None, 'Новости')]) + f'<section class="section"><div class="wrap"><div class="news-g">{cards}</div></div></section>' + footer()

def article(a):
    ld = [ORG, crumbs_ld([('/', 'Главная'), ('/novosti', 'Новости'), (f'/novosti/{a["slug"]}', a['title'])]),
          {"@context": "https://schema.org", "@type": "Article", "headline": a['title'], "description": a['desc'], "datePublished": a['date'], "dateModified": a['date'], "author": {"@type": "Organization", "name": "MakeBiz"}, "publisher": {"@type": "Organization", "name": "MakeBiz"}, "mainEntityOfPage": f'{BASE}/novosti/{a["slug"]}'}]
    return head(a['title'] + ' · MakeBiz', a['desc'], f'/novosti/{a["slug"]}', ld) + header('/novosti') + page_hero(
        a['tag'], esc(a['title']), esc(a['desc']), [('/', 'Главная'), ('/novosti', 'Новости'), (None, a['tag'])]) + f'''
<section class="section"><div class="wrap"><article class="article">{a["body"]}
<div class="cta-box"><div><h3>Посчитайте свой ИИ</h3><p>Стоимость и окупаемость для вашей компании за 30 секунд</p></div><a href="/raschet" class="btn btn-primary btn-lg">Рассчитать стоимость</a></div>
</article></div></section>
''' + footer()

# ---------------------------------------------------------------- запись
def w(path, text):
    p = OUT / path; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text, encoding='utf-8')

w('index.html', home()); w('raschet.html', raschet()); w('keysy.html', keysy()); w('novosti/index.html', news_index())
for a in ARTICLES: w(f'novosti/{a["slug"]}.html', article(a))
w('assets/site.css', (SRC / 'base.css').read_text(encoding='utf-8') + (SRC / 'pages.css').read_text(encoding='utf-8'))
w('assets/engine.js', (SRC / 'engine.js').read_text(encoding='utf-8'))
w('assets/calc.js', (SRC / 'calc.js').read_text(encoding='utf-8'))
w('assets/site.js', (SRC / 'site.js').read_text(encoding='utf-8'))
urls = ['/', '/raschet', '/keysy', '/novosti'] + [f'/novosti/{a["slug"]}' for a in ARTICLES]
w('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{BASE}{u}</loc><lastmod>{TODAY}</lastmod></url>' for u in urls) + '</urlset>\n')
w('robots.txt', f'User-agent: *\nAllow: /\nDisallow: /variants\nClean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid\nSitemap: {BASE}/sitemap.xml\n')
print('built', len(urls), 'pages')

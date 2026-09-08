# MASTER PROMPT — RigZIP (дать агенту в репо RigZip25/RigZipnew)

Скопируй **весь** текст ниже в нового Cloud Agent, запущенного из репозитория **RigZip25/RigZipnew** (не AllByRent).

---

Ты строишь **RigZIP** — премиальный marketplace аренды **коммерческого** транспорта для профессионалов США.

## 0. Контекст и правила

1. Старое приложение подрядчиков (RigZip-UAT, ~42 TestFlight, rigzip.com на CRA) — **не продолжать и не копировать UI**. Оттуда берём только **домен и флоу**.
2. В репо уже есть monorepo после env-setup: `server/` (Express) + `web/` (Vite/React) + `.cursor/environment.json`. **Замени демо-`web/`** на продукт ниже. `server/` оставь как API-заготовку и расширяй под домен.
3. Handoff с уже начатым премиум-фронтом и брифом (если доступен fetch):
   - https://github.com/RigZip25/AllByRent/tree/cursor/rigzip-handoff-6cb4/rigzip-handoff
   - Обязательно: `docs/PRODUCT.md`, `docs/HANDOFF.md`
   - Код UI: `src/` в том пакете → перенеси в `web/src`
   - `docs/refs/` — скрины старого флоу (не визуальный эталон)
4. Если handoff недоступен — строй по этому промпту с нуля в `web/`. Не останавливайся из‑за отсутствия zip.
5. Email OTP only. **Twilio/SMS не подключать.**
6. Цель v1 UI: премиальный фронт + понятные состояния. Бэкенд — каркас API под те же сущности; полный прод-бэк можно итерациями.
7. В конце: typecheck/lint/build зелёные, UI показан в браузере, коммит + PR в RigZipnew.

---

## 1. Что это за продукт

**RigZIP ≈ Turo для коммерческой техники** (траки, трейлеры, specialized, EV work fleet).

**Для кого:** мелкие овнеры с простаивающим флотом, индивидуалы, небольшие компании США — инструмент «как у Penske/Ryder», но для small players.

**Две стороны:**
- **Tenant / Rent** — арендовать технику под работу
- **Owner / List** — сдать idle fleet в аренду

**Ключевое отличие от consumer rental:** на время аренды юнит садится на **страховку арендатора** (loss payee + additional insured, unit-specific COI). Платформа ведёт PTI, документы и damage claim pack для страховой.

**Commercial only:** листить может individual или business; **арендовать** — только с commercial authority (MC/DOT где нужно) и подходящей страховкой.

Не делай «мини-Penske с сетью депо». Делай прямой marketplace + ops-инструменты.

---

## 2. Как должно ВЫГЛЯДЕТЬ (дизайн)

Премиум industrial, не индийский корпоративный шаблон:

- Фон/атмосфера: ink/steel (`#0A0C0F`, графит), не плоский белый каталог
- Акцент: янтарь `#F2B90D` (ZIP energy), не purple gradients
- Шрифты: **Syne** (display) + **DM Sans** (body) — не Inter/Roboto/system
- Бренд **RigZIP** — hero-level на первом экране, не мелкая надпись в навбаре
- Первый экран = одна композиция: бренд + один сильный заголовок + одна фраза + CTA
- Без: emoji в приветствиях, cartoon «мужик с планшетом», плотных 3-колоночных карточек как главного UI, glow, rounded-full pills, multi-shadow cards ради карточек
- Mobile-first; на десктопе можно phone-frame
- Движение: 2–3 осознанных анимации (rise/fade), не шум
- Старый UI в refs = только карта экранов/полей

Тон копирайта: уверенный, короткий, B2B US English в UI (можно EN; не детский onboarding).

---

## 3. Как должно РАБОТАТЬ (сквозной флоу)

### 3.1 Вход
1. Splash / brand entry  
2. Choose path: **I want to Rent** | **I want to List**  
3. Commercial gate: checkbox «понимаю — commercial only» → Continue  
4. Login: Individual | Business + email  
5. OTP: 6 цифр на email, expire ~10 min, resend cooldown, masked email  
6. После успеха → app shell по роли

### 3.2 Tenant — поиск и бронь
1. Explore: классы GVWR / trailers / specialized (editorial rows или rail, не убогий grid ради grid)  
2. Drill-down: класс → подтип → список юнитов → Vehicle Detail  
3. Detail показывает: specs/VIN, availability, rates **hour/day/week/month**, CDL flag, insurance mins, loss payee summary, reviews, cancellation vs PTI, Book Now  
4. Выбор дат/времени (hourly с min charge, напр. 10h; early return без partial refund)  
5. Driver: «I will drive» | «Assign driver» (assigned без аккаунта; verify email после брони)  
6. Insurance requirements: MC Authority + Profile COI + expiry; unit COI ≤ **5h** до старта; sample COI; owner approve  
7. Checkout: dates, duration, promo, deposit + fees → Stripe (платежи)  
8. My Bookings: фильтры All / Request / Closure / Up-Coming / On-Going / Cancelled / Past / Extension; статусы вроде PTI Pending  

### 3.3 Trip lifecycle (ядро)
`Request → (COI approved) → Up-Coming → PTI → On-Going → Return/Post-trip → Closure → Past`  
+ Extension mid-trip (если календарь свободен)  
+ Cancel по политике относительно **PTI** (не «просто start time»):  
  - 24h+ before PTI → 100%  
  - 5–24h → 75%  
  - under 5h → 10%  

### 3.4 PTI / show-up / after-hours / delivery
- Без **PTI Pass** → trip не стартует, ключи не выдаются  
- PTI outcomes:
  - **Pass** → start  
  - **Minor defect** → hold, repair + re-PTI в окне  
  - **DOT/safety fail** → cancel **owner fault**, full refund tenant, **штраф овнеру**, юнит Unavailable  
- After-hours: lockbox/smart lock/code (овнер включает явно)  
- Delivery: опциональный fee + окно (можно v1.1, но модель заложить)  
- Post-trip vs PTI photos = evidence для disputes/claims  

### 3.5 Owner — листинг
Nav: Home / Chat / + / Bookings / Profile (или эквивалент)  
Empty home → Add Vehicle  

Create Vehicle (логика 8 шагов, UX можно сжать, поля сохранить):
1. Category: Light ≤14k / Medium ≤26k / Heavy >26k / Semi-Trailers / Specialized → subtype  
2. VIN verify → auto-fill make/model/year/transmission/fuel/engine + description  
3–5. Photos, location, rates (H/D/W/M), availability calendar, after-hours, delivery  
6. Loss payee & valuation (business name/address, vehicle value, remarks)  
7. Insurance/CDL requirements for renters  
8. Review & publish  

Owner также: approve COI, chat, bookings, share listing (deep link / social), damage claims inbox.

### 3.6 Drivers
- Booker ≠ обязательно driver  
- Assign / replace mid-trip → re-verify + обновить контракт/страховку при необходимости  

### 3.7 Damage & insurance pack
Заявление о damage + фото + incident/police + пакет: contract, PTI/return, COI, loss payee, valuation → «готово для страховой».

### 3.8 Auth/alerts
OTP и critical alerts: email + **in-app inbox/push** (не полагаться только на почту). SMS нет.

---

## 4. Данные / сущности (минимальная модель)

Реализуй хотя бы типы + mock store или API stubs:

- User (role path, accountType individual|business, MC/DOT docs, profile COI)  
- Unit (class, subtype, VIN, specs, rates, location, calendar, afterHours, cdlRequired, insuranceReqs, lossPayee, valuation, status)  
- Booking / Trip (status machine выше, dates, driver, pricing breakdown, deposit)  
- COI documents (profile + unit-specific, expiry, approval)  
- PTI / PostTrip inspection (pass/fail/minor, photos, defects)  
- Driver (verification state)  
- Claim (damage pack)  
- Message/Inbox  

API stubs на `server/`: `/api/health` + черновые REST под units/bookings. Web может пока на mock, но контракты совпадать.

---

## 5. Экраны, которые должны быть в UI сейчас (MVP shell)

Обязательный кликабельный путь:

1. Splash  
2. Choose path  
3. Commercial gate  
4. Email + OTP  
5. Explore (классы + nearby list + bottom nav)  
6. Vehicle detail (хотя бы один mock unit со всеми блоками: specs, rates, insurance, cancel policy, Book Now)  
7. Bookings list (фильтры + empty/mock cards)  
8. Owner empty → stub Add Vehicle step 1–2 (category + VIN UI)

Остальное можно как placeholder screens с правильными заголовками, но навигация живая.

---

## 6. Чего НЕ делать

- Не копировать старый navy/white catalog UI и cartoon illustrations  
- Не тащить Twilio  
- Не мержить это в AllByRent  
- Не оставлять env-setup демо «register a rig» как продукт  
- Не блокироваться из‑за отсутствия zip — этот промпт самодостаточен; handoff в AllByRent — ускоритель  
- Не выдумывать consumer moving-truck позиционирование  

---

## 7. Критерии готовности этого этапа

- [ ] `web/` = премиальный RigZIP shell по флоу выше  
- [ ] Дизайн industrial premium (Syne/DM Sans, ink + amber)  
- [ ] Email OTP path работает в UI (mock verify ok)  
- [ ] Explore + detail + bookings + owner add stub  
- [ ] PRODUCT rules отражены в copy/состояниях (COI, PTI, commercial only)  
- [ ] `npm run typecheck && npm run lint && npm run build` зелёные  
- [ ] Dev server: web + server по `.cursor/environment.json`  
- [ ] PR в RigZipnew с кратким описанием  

Начни с чтения handoff-ветки если доступна, затем внедряй в `web/`, потом добей недостающие экраны. Не спрашивай «что делать» — этот документ и есть задание.

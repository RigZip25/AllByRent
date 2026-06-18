# Какие картинки переделать (AllByRent → Evorios)

Полный манифест: [SCREEN_OVERHAUL.md](SCREEN_OVERHAUL.md)

**Как менять:** положить новый PNG **с тем же именем файла** в ту же папку — код трогать не нужно.

---

## Срочно (видно в онбординге и листинге)

| Файл | Где видно | Что нарисовать |
|------|-----------|----------------|
| `src/imports/onboarding/evorios_garage_roles.png` | Первый экран | Гараж vs прогулка по кварталу (без AllByRent) |
| `src/imports/onboarding/evorios_stock_garage.png` | Онбординг | Кладёшь вещь на полку гаража |
| `src/imports/onboarding/evorios_browse_block.png` | Онбординг | Смотришь гаражи соседей |
| `src/imports/onboarding/evorios_on_block.png` | «Где ты живёшь» | Дом / квартал, GPS |
| `src/imports/onboarding/evorios_trip_destination.png` | Поездка | Карта / другой район |
| `src/imports/onboarding/evorios_mr_full.png` | Mr. Evorios | Персонаж в зелёной куртке |
| `src/imports/listing_snap.png` | Добавление вещи, слайд 1 | Фото на полке гаража |
| `src/imports/listing_magic.png` | Слайд 2 | Mr. Evorios + карточка вещи |
| `src/imports/listing_share.png` | Слайд 3 | Соседи смотрят гараж |
| `src/imports/qr_story_1.png` … `3.png` | После публикации | QR-наклейка, Mr. Evorios |
| `public/pwa-192.png`, `pwa-512.png` | Иконка на телефоне | Логотип Evorios |

---

## Уже ок / можно позже

| Файл | Статус |
|------|--------|
| `evorios_splash_garage.png` | ✅ оставить |
| `No_back_rentano.png` | 🟡 заменить на аватар Mr. Evorios (круглый) |
| `qr_item.png` | 🟡 добавить бренд Evorios на стикер |

---

## Старые — удалить после замены

`earn.png`, `save.png`, `rentano_full.png`, `allbyrent_roles.png` — если ещё лежат в проекте.

---

## Share-карточки и PDF

- Share cards в соцсети — шаблоны в коде (`shareCards.ts`), фон без AllByRent
- QR PDF — имена уже `Evorios-QR-*.pdf`; проверить, что внутри PDF нет старого логотипа

import type { Destination } from "../types";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const DESTINATIONS: Destination[] = [
  {
    id: "wadi-rum",
    name: "Вади Рам",
    country: "Иордания",
    lat: 29.57,
    lng: 35.42,
    categories: ["hiking", "culture", "safari"],
    bestSeasons: ["осень", "зима", "весна"],
    safetyRating: 4.6,
    visaInfo: "Виза по прибытии",
    temperatureRange: "12–28°C",
    description:
      "Красные пустыни и роскошные lodges под звёздным небом. Место, где созерцание важнее спешки.",
    photos: [
      img("photo-1458966480398-cdad9a4d9f5a"),
      img("photo-1509316785289-025f5b846b35"),
    ],
    highlights: [
      "Закаты над красными дюнами с панорамной террасы lodge",
      "Ночёвка в купольном люксе с прозрачным куполом",
      "Тихий джип-сафари без толп и расписаний",
    ],
    accommodations: [
      {
        id: "rum-bubble",
        name: "Martian Dome Suite",
        type: "Luxury lodge",
        pricePerNight: 620,
        photo: img("photo-1566073771259-6a8506099945", 600),
        rating: 4.9,
      },
      {
        id: "rum-camp",
        name: "Desert Whisper Camp",
        type: "Boutique camp",
        pricePerNight: 380,
        photo: img("photo-1520250497591-112f2f40a3f4", 600),
        rating: 4.7,
      },
    ],
    seasonBadge: "Сейчас идеально",
    rating: 4.9,
    activities: ["Дюны", "Звёзды", "Lodge"],
  },
  {
    id: "amalfi",
    name: "Амальфи",
    country: "Италия",
    lat: 40.63,
    lng: 14.6,
    categories: ["gastronomy", "beaches", "yachting", "culture"],
    bestSeasons: ["весна", "осень"],
    safetyRating: 4.8,
    visaInfo: "Шенген",
    temperatureRange: "18–26°C",
    description:
      "Скалы над бирюзой, частные яхты и ужины в семейных trattoria вне туристических троп.",
    photos: [
      img("photo-1534117628672-77857c7a0fdb"),
      img("photo-1516483638261-f4dbaf036963"),
    ],
    highlights: [
      "Частный катер вдоль побережья на рассвете",
      "Дегустация у местных виноделов в холмах",
      "Скрытые пляжи, куда не ходят круизные группы",
    ],
    accommodations: [
      {
        id: "amalfi-cliff",
        name: "Cliffside Belvedere",
        type: "5★ hotel",
        pricePerNight: 780,
        photo: img("photo-1582719508461-905c673771fd", 600),
        rating: 4.8,
      },
    ],
    seasonBadge: "Жемчужина сезона",
    rating: 4.8,
    activities: ["Яхтинг", "Гастрономия", "Пляжи"],
  },
  {
    id: "kyoto",
    name: "Киото",
    country: "Япония",
    lat: 35.01,
    lng: 135.77,
    categories: ["culture", "gastronomy", "hiking"],
    bestSeasons: ["весна", "осень"],
    safetyRating: 4.9,
    visaInfo: "Без визы до 90 дней",
    temperatureRange: "10–22°C",
    description:
      "Храмы в тумане, чайные церемонии и ryokan с онсэн — созерцательный ритм Востока.",
    photos: [
      img("photo-1493976040374-85c8e12f0c0e"),
      img("photo-1528164344705-47542687000d"),
    ],
    highlights: [
      "Частная чайная церемония в саду храма",
      "Ночёвка в ryokan с завтраком кайсэки",
      "Тропа философов без утренних толп",
    ],
    accommodations: [
      {
        id: "kyoto-ryokan",
        name: "Hiiragiya Annex",
        type: "Ryokan",
        pricePerNight: 540,
        photo: img("photo-1545569341-9eb8b30979d9", 600),
        rating: 4.9,
      },
    ],
    seasonBadge: "Кленовый сезон",
    rating: 4.95,
    activities: ["Храмы", "Онсэн", "Кайсэки"],
  },
  {
    id: "patagonia",
    name: "Патагония",
    country: "Чили / Аргентина",
    lat: -50.94,
    lng: -73.25,
    categories: ["hiking", "extreme", "safari"],
    bestSeasons: ["лето", "осень"],
    safetyRating: 4.5,
    visaInfo: "Без визы",
    temperatureRange: "5–18°C",
    description:
      "Ледники, ветра и люксовые eco-lodges у подножия Торрес дель Пайне.",
    photos: [
      img("photo-1483728642387-6c3bdd6cf93b"),
      img("photo-1469474968028-56623f02e42e"),
    ],
    highlights: [
      "Рассвет у Torres del Paine с гидом-натуралистом",
      "Eco-lodge с видом на ледник",
      "Тихий день на озере без трекинговых групп",
    ],
    accommodations: [
      {
        id: "pata-explora",
        name: "Explora Patagonia",
        type: "Eco lodge",
        pricePerNight: 890,
        photo: img("photo-1506905925346-21bda4d32df4", 600),
        rating: 4.9,
      },
    ],
    seasonBadge: "Сезон света",
    rating: 4.85,
    activities: ["Хайкинг", "Ледники", "Wildlife"],
  },
  {
    id: "maldives",
    name: "Мальдивы",
    country: "Мальдивы",
    lat: 3.2,
    lng: 73.2,
    categories: ["beaches", "diving", "yachting"],
    bestSeasons: ["зима", "весна"],
    safetyRating: 4.7,
    visaInfo: "Виза по прибытии",
    temperatureRange: "27–31°C",
    description:
      "Приватные overwater villas, рифы и ужины на песке — комфорт без массового туризма.",
    photos: [
      img("photo-1514282401047-d79a71aba5b5"),
      img("photo-1573843981267-be1999ff37cd"),
    ],
    highlights: [
      "Вилла с частным бассейном над лагуной",
      "Ночной дайвинг с биолюминесценцией",
      "Закат на dhoni без расписания курорта",
    ],
    accommodations: [
      {
        id: "mald-soneva",
        name: "Soneva Fushi",
        type: "Private island",
        pricePerNight: 1200,
        photo: img("photo-1439066615861-d1af74d74000", 600),
        rating: 4.95,
      },
    ],
    seasonBadge: "Спокойное море",
    rating: 4.92,
    activities: ["Дайвинг", "Виллы", "Спа"],
  },
  {
    id: "marrakech",
    name: "Марракеш",
    country: "Марокко",
    lat: 31.63,
    lng: -8.0,
    categories: ["culture", "gastronomy", "roadtrip"],
    bestSeasons: ["осень", "зима", "весна"],
    safetyRating: 4.3,
    visaInfo: "Без визы до 90 дней",
    temperatureRange: "15–28°C",
    description:
      "Риады с двориками, Атлас на рассвете и рынки, где гид знает тихие переулки.",
    photos: [
      img("photo-1489749798305-4fea3ae63d43"),
      img("photo-1539020140153-e479b8c22e70"),
    ],
    highlights: [
      "Ночёвка в riad с внутренним садом",
      "День в Атласе с обедом у берберов",
      "Кулинарный класс с шефом вне медiny throngs",
    ],
    accommodations: [
      {
        id: "marr-riad",
        name: "Riad Farnatchi",
        type: "Riad",
        pricePerNight: 420,
        photo: img("photo-1564501049412-61c2a3083791", 600),
        rating: 4.8,
      },
    ],
    seasonBadge: "Мягкий климат",
    rating: 4.7,
    activities: ["Риады", "Атлас", "Гастрономия"],
  },
];

export function getDestination(id: string) {
  return DESTINATIONS.find((d) => d.id === id);
}

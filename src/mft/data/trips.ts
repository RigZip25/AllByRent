import type { Trip } from "../types";
import { DESTINATIONS } from "./destinations";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const DEMO_TRIPS: Trip[] = [
  {
    id: "trip-wadi-rum",
    destinationId: "wadi-rum",
    title: "Красные пустыни Вади Рам",
    startDate: daysFromNow(18),
    endDate: daysFromNow(24),
    status: "preparing",
    participantCount: 2,
    totalCost: 6840,
    heroPhoto: DESTINATIONS[0].photos[0],
    itinerary: [
      {
        id: "s1",
        dayNumber: 1,
        location: "Амман → Вади Рам",
        accommodation: "Martian Dome Suite",
        activities: ["Трансфер на джипе", "Закат на дюнах", "Ужин под звёздами"],
        photo: img("photo-1509316785289-025f5b846b35"),
      },
      {
        id: "s2",
        dayNumber: 2,
        location: "Каньон Барра",
        accommodation: "Martian Dome Suite",
        activities: ["Тихий трек", "Фото на красных скалах", "Спа в lodge"],
        photo: img("photo-1458966480398-cdad9a4d9f5a"),
      },
      {
        id: "s3",
        dayNumber: 3,
        location: "Долина Луны",
        accommodation: "Desert Whisper Camp",
        activities: ["Верблюдий маршрут", "Астрономия", "Завтрак на террасе"],
        photo: img("photo-1469854523086-cc02fe5d8800"),
      },
    ],
    bookings: [
      {
        id: "b1",
        type: "flight",
        provider: "Royal Jordanian",
        reference: "RJ-4421",
        status: "confirmed",
        cost: 1840,
        details: "Москва → Амман, туда-обратно",
      },
      {
        id: "b2",
        type: "hotel",
        provider: "Martian Domes",
        reference: "MD-882",
        status: "confirmed",
        cost: 3720,
        details: "3 ночи, купольный люкс",
      },
      {
        id: "b3",
        type: "transfer",
        provider: "Desert Private",
        reference: "DP-119",
        status: "pending",
        cost: 420,
        details: "Частный джип Амман — Вади Рам",
      },
      {
        id: "b4",
        type: "excursion",
        provider: "Viator",
        reference: "VT-551",
        status: "confirmed",
        cost: 860,
        details: "Ночная астрономия + ужин",
      },
    ],
    packing: [
      { id: "p1", category: "documents", item: "Паспорт", checked: true },
      { id: "p2", category: "documents", item: "Страховка", checked: true },
      { id: "p3", category: "documents", item: "Ваучер lodge", checked: false },
      { id: "p4", category: "health", item: "Аптечка", checked: false },
      { id: "p5", category: "health", item: "Солнцезащитный крем SPF50", checked: true, aiSuggested: true },
      { id: "p6", category: "clothes", item: "Лёгкая куртка на вечер", checked: false, aiSuggested: true },
      { id: "p7", category: "clothes", item: "Закрытая обувь для дюн", checked: true },
      { id: "p8", category: "tech", item: "Пауэрбанк", checked: true },
      { id: "p9", category: "tech", item: "Адаптер EU", checked: false },
    ],
    members: [
      {
        id: "m1",
        name: "Вы",
        role: "owner",
        interests: ["Сафари", "Культура"],
        packingProgress: 67,
        avatarColor: "#d97706",
      },
      {
        id: "m2",
        name: "Анна",
        role: "co-host",
        interests: ["Гастрономия", "Фото"],
        packingProgress: 40,
        avatarColor: "#e2b05e",
      },
    ],
    activityFeed: [
      {
        id: "a1",
        userName: "AI Companion",
        type: "ai",
        content: "Напомните Анне про лёгкую куртку — ночи в пустыне до 12°C.",
        createdAt: "2 ч назад",
      },
      {
        id: "a2",
        userName: "Анна",
        type: "member",
        content: "Добавила страховку в документы ✓",
        createdAt: "5 ч назад",
      },
      {
        id: "a3",
        userName: "Вы",
        type: "member",
        content: "Подтвердили купольный люкс",
        createdAt: "Вчера",
      },
    ],
    restaurants: [
      {
        id: "r1",
        name: "Bait Al Karama",
        cuisine: "Иорданская",
        rating: 4.8,
        distance: "0.4 км",
        price: "$$$",
        photo: img("photo-1414235077428-338989a2e8c0", 500),
      },
      {
        id: "r2",
        name: "Desert Fire Table",
        cuisine: "Авторская",
        rating: 4.9,
        distance: "на территории",
        price: "$$$$",
        photo: img("photo-1559339352-11d035aa65de", 500),
      },
      {
        id: "r3",
        name: "Bedouin Oven",
        cuisine: "Местная",
        rating: 4.6,
        distance: "1.2 км",
        price: "$$",
        photo: img("photo-1504674900247-0877df9cc836", 500),
      },
    ],
    photos: [],
    highlights: [],
    aiTip: "За 3 дня до вылета проверьте трансфер — сейчас он в статусе pending.",
  },
  {
    id: "trip-amalfi",
    destinationId: "amalfi",
    title: "Тихая Амальфи",
    startDate: daysFromNow(45),
    endDate: daysFromNow(52),
    status: "planning",
    participantCount: 2,
    totalCost: 9200,
    heroPhoto: DESTINATIONS[1].photos[0],
    itinerary: [
      {
        id: "am1",
        dayNumber: 1,
        location: "Позитано",
        accommodation: "Cliffside Belvedere",
        activities: ["Заезд", "Аperitivo на террасе"],
        photo: DESTINATIONS[1].photos[0],
      },
    ],
    bookings: [],
    packing: [],
    members: [
      {
        id: "m1",
        name: "Вы",
        role: "owner",
        interests: ["Яхтинг"],
        packingProgress: 0,
        avatarColor: "#d97706",
      },
    ],
    activityFeed: [],
    restaurants: [],
    photos: [],
    highlights: [],
  },
  {
    id: "trip-kyoto-done",
    destinationId: "kyoto",
    title: "Осень в Киото",
    startDate: daysFromNow(-40),
    endDate: daysFromNow(-33),
    status: "completed",
    participantCount: 2,
    totalCost: 7800,
    heroPhoto: DESTINATIONS[2].photos[0],
    itinerary: [],
    bookings: [],
    packing: [],
    members: [],
    activityFeed: [],
    restaurants: [],
    photos: [
      {
        id: "ph1",
        url: img("photo-1493976040374-85c8e12f0c0e"),
        locationTag: "Фусими Инари",
      },
      {
        id: "ph2",
        url: img("photo-1528164344705-47542687000d"),
        locationTag: "Арасияма",
      },
      {
        id: "ph3",
        url: img("photo-1545569341-9eb8b30979d9"),
        locationTag: "Ryokan",
      },
      {
        id: "ph4",
        url: img("photo-1490806843957-31f4c9a91c65"),
        locationTag: "Гинкаку-дзи",
      },
      {
        id: "ph5",
        url: img("photo-1524413840807-0c3cb6fa808d"),
        locationTag: "Бамбуковая роща",
      },
      {
        id: "ph6",
        url: img("photo-1480796927426-f609979314bd"),
        locationTag: "Киото ночь",
      },
    ],
    highlights: [
      "Рассвет на тропе философов без единого туриста",
      "Кайсэки в ryokan — семь перемен с видом на сад",
      "Случайный чайный дом в переулке Гиона",
    ],
    stats: { days: 7, cities: 2, km: 84, photos: 146 },
  },
];

export function getTrip(id: string) {
  return DEMO_TRIPS.find((t) => t.id === id);
}

export function createTripFromDestination(
  destinationId: string,
  title?: string,
): Trip {
  const dest = DESTINATIONS.find((d) => d.id === destinationId)!;
  const id = `trip-${destinationId}-${Date.now()}`;
  return {
    id,
    destinationId,
    title: title ?? dest.name,
    startDate: daysFromNow(21),
    endDate: daysFromNow(28),
    status: "planning",
    participantCount: 2,
    totalCost:
      dest.accommodations[0].pricePerNight * 5 +
      2200 +
      Math.round(Math.random() * 800),
    heroPhoto: dest.photos[0],
    itinerary: dest.highlights.map((h, i) => ({
      id: `${id}-s${i}`,
      dayNumber: i + 1,
      location: dest.name,
      accommodation: dest.accommodations[0].name,
      activities: [h],
      photo: dest.photos[i % dest.photos.length],
    })),
    bookings: [
      {
        id: `${id}-b1`,
        type: "flight",
        provider: "Partner Airlines",
        reference: "PA-NEW",
        status: "pending",
        cost: 1600,
        details: "Перелёт туда-обратно",
      },
      {
        id: `${id}-b2`,
        type: "hotel",
        provider: dest.accommodations[0].name,
        reference: "HT-NEW",
        status: "pending",
        cost: dest.accommodations[0].pricePerNight * 5,
        details: `5 ночей · ${dest.accommodations[0].type}`,
      },
    ],
    packing: [
      { id: `${id}-p1`, category: "documents", item: "Паспорт", checked: false },
      { id: `${id}-p2`, category: "documents", item: "Страховка", checked: false },
      {
        id: `${id}-p3`,
        category: "health",
        item: "Аптечка",
        checked: false,
        aiSuggested: true,
      },
      {
        id: `${id}-p4`,
        category: "clothes",
        item: "По сезону: слои",
        checked: false,
        aiSuggested: true,
      },
      { id: `${id}-p5`, category: "tech", item: "Пауэрбанк", checked: false },
    ],
    members: [
      {
        id: "m1",
        name: "Вы",
        role: "owner",
        interests: dest.activities.slice(0, 2),
        packingProgress: 0,
        avatarColor: "#d97706",
      },
    ],
    activityFeed: [
      {
        id: `${id}-a1`,
        userName: "AI Companion",
        type: "ai",
        content: `План для ${dest.name} готов. Можно бронировать или уточнить маршрут.`,
        createdAt: "Только что",
      },
    ],
    restaurants: [
      {
        id: `${id}-r1`,
        name: "Local Table",
        cuisine: "Местная",
        rating: 4.7,
        distance: "0.5 км",
        price: "$$$",
        photo: img("photo-1414235077428-338989a2e8c0", 500),
      },
    ],
    photos: [],
    highlights: [],
    aiTip: `Лучший сезон для ${dest.name}: ${dest.bestSeasons.join(", ")}.`,
  };
}

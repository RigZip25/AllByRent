import type { InterestId } from "../types";

export const INTERESTS: {
  id: InterestId;
  label: string;
  emoji: string;
}[] = [
  { id: "diving", label: "Дайвинг", emoji: "🤿" },
  { id: "hiking", label: "Хайкинг", emoji: "🥾" },
  { id: "safari", label: "Сафари", emoji: "🦁" },
  { id: "beaches", label: "Пляжи", emoji: "🏖️" },
  { id: "yachting", label: "Яхтинг", emoji: "⛵" },
  { id: "gastronomy", label: "Гастрономия", emoji: "🍷" },
  { id: "culture", label: "Культура", emoji: "🏛️" },
  { id: "extreme", label: "Экстрим", emoji: "🪂" },
  { id: "roadtrip", label: "Автопутешествия", emoji: "🚗" },
];

export const COMPANIONS = [
  { id: "solo" as const, label: "Один" },
  { id: "couple" as const, label: "Пара" },
  { id: "family" as const, label: "Семья" },
  { id: "friends" as const, label: "Друзья" },
  { id: "group" as const, label: "Группа" },
];

export const PACES = [
  { id: "active" as const, label: "Активный" },
  { id: "contemplative" as const, label: "Созерцательный" },
  { id: "mix" as const, label: "Микс" },
];

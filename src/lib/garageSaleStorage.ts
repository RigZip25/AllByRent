const OPEN_WINDOW_KEY = "abr_garage_sale_open_window";

export type GarageSaleOpenWindow = "today" | "saturday" | "weekend";

export const GARAGE_SALE_OPEN_OPTIONS: Array<{
  id: GarageSaleOpenWindow;
  label: string;
  hours: string;
}> = [
  { id: "today", label: "Today", hours: "8am – 2pm" },
  { id: "saturday", label: "This Saturday", hours: "9am – 1pm" },
  { id: "weekend", label: "This weekend", hours: "Sat–Sun · 8am – 12pm" },
];

export function getGarageSaleOpenWindow(): GarageSaleOpenWindow {
  try {
    const raw = localStorage.getItem(OPEN_WINDOW_KEY);
    if (raw === "today" || raw === "saturday" || raw === "weekend") return raw;
  } catch {
    /* */
  }
  return "saturday";
}

export function setGarageSaleOpenWindow(window: GarageSaleOpenWindow): void {
  try {
    localStorage.setItem(OPEN_WINDOW_KEY, window);
  } catch {
    /* */
  }
}

export function garageSaleOpenLabel(window: GarageSaleOpenWindow): string {
  const option = GARAGE_SALE_OPEN_OPTIONS.find((item) => item.id === window);
  return option ? `${option.label} · ${option.hours}` : "Open soon";
}

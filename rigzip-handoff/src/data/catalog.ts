export type DutyClassId =
  | "light"
  | "medium"
  | "heavy"
  | "trailers"
  | "specialized";

export type DutyClass = {
  id: DutyClassId;
  label: string;
  subtitle: string;
  count: number;
};

export type UnitType = {
  id: string;
  classId: DutyClassId;
  name: string;
  fromRate: number;
  unit: "hour" | "day";
  available: number;
};

export const DUTY_CLASSES: DutyClass[] = [
  {
    id: "light",
    label: "Light-Duty",
    subtitle: "Up to 14,000 lbs",
    count: 48,
  },
  {
    id: "medium",
    label: "Medium-Duty",
    subtitle: "Up to 26,000 lbs",
    count: 36,
  },
  {
    id: "heavy",
    label: "Heavy-Duty",
    subtitle: "Over 26,000 lbs",
    count: 29,
  },
  {
    id: "trailers",
    label: "Semi-Trailers",
    subtitle: "Dry van, flatbed, reefer & more",
    count: 54,
  },
  {
    id: "specialized",
    label: "Specialized",
    subtitle: "Jobsite & specialty units",
    count: 22,
  },
];

export const FEATURED_UNITS: UnitType[] = [
  {
    id: "box-truck",
    classId: "medium",
    name: "Box Truck 26 ft",
    fromRate: 89,
    unit: "day",
    available: 12,
  },
  {
    id: "day-cab",
    classId: "heavy",
    name: "Day Cab Tractor",
    fromRate: 189,
    unit: "day",
    available: 7,
  },
  {
    id: "dry-van",
    classId: "trailers",
    name: "Dry Van Trailer",
    fromRate: 65,
    unit: "day",
    available: 18,
  },
  {
    id: "cargo-van",
    classId: "light",
    name: "Cargo Van",
    fromRate: 42,
    unit: "hour",
    available: 21,
  },
];

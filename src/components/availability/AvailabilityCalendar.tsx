import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { enUS, es, cs } from "date-fns/locale";
import { Calendar } from "../../app/components/ui/calendar";
import { useLocale, useMessages } from "../../lib/i18n/react";
import type { AppLocale } from "../../lib/i18n/types";
import {
  DEFAULT_MAX_ADVANCE_MONTHS,
  expandBusyToDisabledMatchers,
  isDateInBusyIntervals,
  maxBookableIso,
  parseIsoDateLocal,
  toIsoDateLocal,
  todayIsoLocal,
  type BusyInterval,
} from "../../lib/availabilityBusy";
import { cn } from "../../app/components/ui/utils";

const DAY_PICKER_LOCALE: Record<AppLocale, typeof enUS> = {
  en: enUS,
  es,
  cs,
};

export type AvailabilityCalendarProps = {
  busyIntervals: BusyInterval[];
  /** When true, days are not selectable (public / host occupancy view). */
  readOnly?: boolean;
  mode?: "single" | "range";
  selected?: Date | DateRange | undefined;
  onSelectSingle?: (iso: string | undefined) => void;
  onSelectRange?: (range: { start?: string; end?: string }) => void;
  maxAdvanceMonths?: number;
  className?: string;
  /** Optional loading state for busy intervals. */
  loading?: boolean;
};

function startOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function AvailabilityCalendar({
  busyIntervals,
  readOnly = false,
  mode = "single",
  selected,
  onSelectSingle,
  onSelectRange,
  maxAdvanceMonths = DEFAULT_MAX_ADVANCE_MONTHS,
  className,
  loading = false,
}: AvailabilityCalendarProps) {
  const t = useMessages();
  const locale = useLocale();
  const [month, setMonth] = useState(() => startOfTodayLocal());

  const today = useMemo(() => startOfTodayLocal(), []);
  const maxDate = useMemo(() => {
    const iso = maxBookableIso(maxAdvanceMonths);
    return parseIsoDateLocal(iso) ?? today;
  }, [maxAdvanceMonths, today]);

  const busyDays = useMemo(
    () => expandBusyToDisabledMatchers(busyIntervals),
    [busyIntervals],
  );

  const unavailableMatcher = useMemo(
    () => [
      { before: today },
      { after: maxDate },
      ...busyDays,
    ],
    [busyDays, maxDate, today],
  );

  const isUnavailableDay = (day: Date): boolean => {
    const iso = toIsoDateLocal(day);
    if (iso < todayIsoLocal()) return true;
    if (iso > maxBookableIso(maxAdvanceMonths)) return true;
    return isDateInBusyIntervals(iso, busyIntervals);
  };

  const modifiers = useMemo(
    () => ({
      available: (day: Date) => !isUnavailableDay(day),
      unavailable: (day: Date) => isUnavailableDay(day),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- busyIntervals/maxAdvanceMonths covered via helpers
    [busyIntervals, maxAdvanceMonths],
  );

  useEffect(() => {
    // Keep month in view when selection jumps far ahead.
    if (!selected) return;
    if (selected instanceof Date) {
      setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
      return;
    }
    const from = selected.from;
    if (from) setMonth(new Date(from.getFullYear(), from.getMonth(), 1));
  }, [selected]);

  const dayContent = (props: { date: Date; displayMonth: Date }) => {
    const unavailable = isUnavailableDay(props.date);
    const dayNum = props.date.getDate();
    const aria = unavailable
      ? t.availabilityCalendar.dayUnavailableAria(dayNum)
      : t.availabilityCalendar.dayAvailableAria(dayNum);
    const mark = unavailable
      ? t.availabilityCalendar.markUnavailable
      : t.availabilityCalendar.markAvailable;
    return (
      <span
        className="relative flex h-full w-full flex-col items-center justify-center leading-none"
        aria-label={aria}
      >
        <span aria-hidden>{dayNum}</span>
        <span
          className={cn(
            "mt-0.5 max-w-[2.4rem] truncate text-[8px] font-semibold uppercase tracking-tight",
            unavailable ? "text-muted-foreground" : "text-[#0D5C3A]",
          )}
          aria-hidden
        >
          {mark}
        </span>
      </span>
    );
  };

  const sharedClassNames = {
    day_unavailable: "bg-muted text-muted-foreground opacity-70",
  };

  const legend = (
    <div
      className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"
      role="list"
      aria-label={`${t.availabilityCalendar.legendAvailable}; ${t.availabilityCalendar.legendUnavailable}`}
    >
      <span className="inline-flex items-center gap-2" role="listitem">
        <span
          className="inline-flex h-5 min-w-[2.5rem] items-center justify-center rounded-sm border border-[#0D5C3A]/40 bg-[#0D5C3A]/15 px-1 text-[9px] font-bold uppercase text-[#0D5C3A]"
          aria-hidden
        >
          {t.availabilityCalendar.markAvailable}
        </span>
        {t.availabilityCalendar.legendAvailable}
      </span>
      <span className="inline-flex items-center gap-2" role="listitem">
        <span
          className="inline-flex h-5 min-w-[2.5rem] items-center justify-center rounded-sm bg-muted px-1 text-[9px] font-bold uppercase text-muted-foreground"
          aria-hidden
        >
          {t.availabilityCalendar.markUnavailable}
        </span>
        {t.availabilityCalendar.legendUnavailable}
      </span>
    </div>
  );

  const calendarExtras = {
    components: {
      DayContent: dayContent,
    },
  };

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <p className="text-sm text-muted-foreground">{t.availabilityCalendar.loading}</p>
      </div>
    );
  }

  if (readOnly || (!onSelectSingle && !onSelectRange)) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-3", className)}>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          locale={DAY_PICKER_LOCALE[locale]}
          modifiers={modifiers}
          modifiersClassNames={{
            available: "bg-[#0D5C3A]/12 text-[#0D5C3A] font-medium hover:bg-[#0D5C3A]/18",
            unavailable: sharedClassNames.day_unavailable,
          }}
          disabled={unavailableMatcher}
          className="w-full"
          {...calendarExtras}
        />
        {legend}
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          {t.availabilityCalendar.publicHint}
        </p>
      </div>
    );
  }

  if (mode === "range") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-3", className)}>
        <Calendar
          mode="range"
          month={month}
          onMonthChange={setMonth}
          locale={DAY_PICKER_LOCALE[locale]}
          selected={selected as DateRange | undefined}
          onSelect={(range) => {
            onSelectRange?.({
              start: range?.from ? toIsoDateLocal(range.from) : undefined,
              end: range?.to ? toIsoDateLocal(range.to) : range?.from ? toIsoDateLocal(range.from) : undefined,
            });
          }}
          modifiers={modifiers}
          modifiersClassNames={{
            available: "bg-[#0D5C3A]/12 text-[#0D5C3A] font-medium",
            unavailable: sharedClassNames.day_unavailable,
          }}
          disabled={unavailableMatcher}
          className="w-full"
          {...calendarExtras}
        />
        {legend}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card p-3", className)}>
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        locale={DAY_PICKER_LOCALE[locale]}
        selected={selected as Date | undefined}
        onSelect={(day) => {
          onSelectSingle?.(day ? toIsoDateLocal(day) : undefined);
        }}
        modifiers={modifiers}
        modifiersClassNames={{
          available: "bg-[#0D5C3A]/12 text-[#0D5C3A] font-medium",
          unavailable: sharedClassNames.day_unavailable,
        }}
        disabled={unavailableMatcher}
        className="w-full"
        {...calendarExtras}
      />
      {legend}
    </div>
  );
}

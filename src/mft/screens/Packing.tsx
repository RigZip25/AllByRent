import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { AiCard, SectionLabel } from "../components/Ui";
import { cn } from "../lib/cn";
import { useMftStore } from "../store";
import type { PackingCategory } from "../types";

const CATEGORIES: { id: PackingCategory; label: string }[] = [
  { id: "documents", label: "Документы" },
  { id: "health", label: "Здоровье" },
  { id: "clothes", label: "Одежда" },
  { id: "tech", label: "Техника" },
];

const AI_TIP =
  "Ночи в пустыне прохладные — добавьте лёгкую куртку с капюшоном.";

export function PackingScreen() {
  const { id = "" } = useParams();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));
  const togglePackingItem = useMftStore((s) => s.togglePackingItem);
  const addPackingItem = useMftStore((s) => s.addPackingItem);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [askMore, setAskMore] = useState(false);

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Сборы" />
      </div>
    );
  }

  return (
    <div className="mft-scroll mft-screen h-full">
      <BackHeader title="Сборы" />
      <p className="mb-6 text-[13px] text-[var(--text-muted)]">{trip.title}</p>

      {!tipDismissed ? (
        <AiCard className="mb-6">
          <p>{AI_TIP}</p>
          <div className="mt-3 flex gap-2">
            <Button
              className="h-9 text-[13px]"
              onClick={() => {
                addPackingItem(trip.id, "Лёгкая куртка с капюшоном");
                setTipDismissed(true);
              }}
            >
              Добавить ✓
            </Button>
            <Button
              variant="ghost"
              className="h-9 text-[13px]"
              onClick={() => setTipDismissed(true)}
            >
              Не нужно
            </Button>
          </div>
        </AiCard>
      ) : null}

      {CATEGORIES.map((cat) => {
        const items = trip.packing.filter((p) => p.category === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id} className="mb-6">
            <SectionLabel>{cat.label}</SectionLabel>
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => togglePackingItem(trip.id, item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[12px] bg-[var(--bg-card)] px-4 py-3 text-left",
                    item.checked && "opacity-55",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border text-[11px]",
                      item.checked
                        ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[var(--text-inverse)]"
                        : "border-white/20",
                    )}
                  >
                    {item.checked ? "✓" : ""}
                  </span>
                  <span className="flex-1 text-[14px]">{item.item}</span>
                  {item.aiSuggested ? (
                    <span className="text-[10px] text-[var(--accent-gold)]">AI</span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        );
      })}

      <Button
        variant="secondary"
        fullWidth
        onClick={() => {
          setAskMore(true);
          addPackingItem(trip.id, "Солнцезащитные очки с UV-фильтром");
        }}
      >
        Спросить ещё
      </Button>
      {askMore ? (
        <p className="mt-3 text-center text-[12px] text-[var(--accent-gold)]">
          AI добавил ещё один пункт в список
        </p>
      ) : null}
    </div>
  );
}

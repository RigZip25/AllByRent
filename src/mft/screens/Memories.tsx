import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { SectionLabel } from "../components/Ui";
import { useMftStore } from "../store";

export function MemoriesScreen() {
  const { id = "" } = useParams();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));
  const updateTrip = useMftStore((s) => s.updateTrip);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([
    "Утро без расписания — лучшая роскошь.",
  ]);
  const [bookMsg, setBookMsg] = useState(false);

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Воспоминания" />
      </div>
    );
  }

  const photos =
    trip.photos.length > 0
      ? trip.photos
      : [
          {
            id: "f1",
            url: trip.heroPhoto,
            locationTag: trip.title,
          },
          ...(trip.itinerary.map((s) => ({
            id: s.id,
            url: s.photo,
            locationTag: s.location,
          })) ?? []),
        ];

  return (
    <div className="mft-scroll mft-screen h-full">
      <BackHeader title="Воспоминания" />

      <div className="columns-2 gap-2">
        {photos.map((p, i) => (
          <div
            key={p.id}
            className="relative mb-2 break-inside-avoid overflow-hidden rounded-[12px]"
          >
            <img
              src={p.url}
              alt=""
              className={i % 3 === 0 ? "h-44 w-full object-cover" : "h-32 w-full object-cover"}
            />
            <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              {p.locationTag}
            </span>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        fullWidth
        className="mt-6"
        onClick={() => {
          updateTrip(trip.id, {
            photos: [
              ...trip.photos,
              {
                id: `ph-${Date.now()}`,
                url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
                locationTag: "Новый кадр",
              },
            ],
          });
        }}
      >
        Добавить фото
      </Button>

      <section className="mt-8">
        <SectionLabel>Заметки</SectionLabel>
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n} className="rounded-[12px] bg-[var(--bg-card)] p-4 text-[14px]">
              {n}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Новая заметка…"
            className="h-11 flex-1 rounded-full bg-[var(--bg-input)] px-4 text-[14px] outline-none ring-1 ring-white/5"
          />
          <Button
            className="h-11 !px-4"
            disabled={!note.trim()}
            onClick={() => {
              setNotes((n) => [...n, note.trim()]);
              setNote("");
            }}
          >
            +
          </Button>
        </div>
      </section>

      <Button
        fullWidth
        className="mt-8"
        onClick={() => setBookMsg(true)}
      >
        Создать фотокнигу
      </Button>
      {bookMsg ? (
        <p className="mt-3 text-center text-[13px] text-[var(--accent-gold)]">
          Фотокнига собрана — демо-заказ отправлен в печать
        </p>
      ) : null}
    </div>
  );
}

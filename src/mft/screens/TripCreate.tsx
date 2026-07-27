import { Mic, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { DESTINATIONS } from "../data/destinations";
import { useMftStore } from "../store";
import type { InterestId } from "../types";

const SUGGESTIONS = [
  "Хочу красные пустыни с luxury lodges",
  "Тихий берег и яхта без толп",
  "Храмы, онсэн и созерцательный ритм",
];

function matchDestinations(query: string) {
  const q = query.toLowerCase();
  const keywordMap: { keys: string[]; cats: InterestId[] }[] = [
    { keys: ["пустын", "red", "desert", "вади", "сафари"], cats: ["safari", "hiking"] },
    { keys: ["яхт", "берег", "пляж", "море", "амальфи", "мальдив"], cats: ["beaches", "yachting"] },
    { keys: ["храм", "киото", "япони", "онсэн", "созерца"], cats: ["culture"] },
    { keys: ["патагон", "хайк", "ледник"], cats: ["hiking", "extreme"] },
    { keys: ["гастро", "еда", "вин"], cats: ["gastronomy"] },
    { keys: ["дайв", "риф"], cats: ["diving"] },
  ];
  const cats = new Set<InterestId>();
  for (const row of keywordMap) {
    if (row.keys.some((k) => q.includes(k))) row.cats.forEach((c) => cats.add(c));
  }
  const scored = DESTINATIONS.map((d) => {
    let score = 0;
    d.categories.forEach((c) => {
      if (cats.has(c)) score += 2;
    });
    if (q.includes(d.name.toLowerCase().slice(0, 4))) score += 3;
    return { d, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d);
  return scored.length ? scored.slice(0, 3) : DESTINATIONS.slice(0, 3);
}

export function TripCreateScreen() {
  const navigate = useNavigate();
  const draft = useMftStore((s) => s.aiDraftQuery);
  const setDraft = useMftStore((s) => s.setAiDraftQuery);
  const addTrip = useMftStore((s) => s.addTrip);
  const [submitted, setSubmitted] = useState(Boolean(draft));
  const [input, setInput] = useState(draft || "");

  const matches = useMemo(
    () => (submitted ? matchDestinations(input || draft) : []),
    [submitted, input, draft],
  );

  function submit(text: string) {
    const q = text.trim();
    if (!q) return;
    setInput(q);
    setDraft(q);
    setSubmitted(true);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mft-scroll flex-1 px-6 pt-6 pb-4">
        <BackHeader title="Новый трип" />
        {!submitted ? (
          <div className="mft-fade-up mt-6 space-y-4">
            <p className="text-[15px] text-[var(--text-muted)]">
              Опишите мечту своими словами — AI подберёт направления
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="w-full rounded-[12px] bg-[var(--bg-card)] px-4 py-3 text-left text-[14px] italic text-[var(--text-cream)] transition hover:bg-[var(--bg-card-hover)]"
              >
                «{s}»
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-[15px] italic text-[var(--text-muted)]">«{input}»</p>
            <div className="rounded-r-xl border-l-[3px] border-[var(--accent-gold)] bg-[var(--bg-card)] p-4 text-[14px]">
              Нашёл три направления под ваш запрос. Каждое — с комфортом и без
              массового туризма.
            </div>
            <div className="space-y-3">
              {matches.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    const id = addTrip(d.id, `${d.name}: по вашему запросу`);
                    navigate(`/trip/${id}`);
                  }}
                  className="flex w-full gap-3 overflow-hidden rounded-[12px] bg-[var(--bg-card)] text-left transition hover:bg-[var(--bg-card-hover)]"
                >
                  <img
                    src={d.photos[0]}
                    alt=""
                    className="h-28 w-24 shrink-0 object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3">
                    <div className="text-[15px] font-semibold">{d.name}</div>
                    <div className="mt-1 line-clamp-2 text-[12px] text-[var(--text-muted)]">
                      {d.highlights[0]}
                    </div>
                    <span className="mt-2 w-fit rounded-full bg-[var(--accent-amber-soft)] px-2 py-0.5 text-[10px] text-[var(--accent-gold)]">
                      {d.seasonBadge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 bg-[var(--bg-elevated)] px-4 pt-3 pb-[calc(12px+var(--safe-bottom))]">
        <div className="flex items-center gap-2 rounded-full bg-[var(--bg-input)] px-2 py-1.5 ring-1 ring-white/5">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--accent-gold)]"
            aria-label="Голос"
            onClick={() => submit(SUGGESTIONS[0])}
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(input);
            }}
            placeholder="Я хочу…"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--text-dim)]"
          />
          <Button
            className="h-10 w-10 shrink-0 !px-0"
            onClick={() => submit(input)}
            aria-label="Отправить"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

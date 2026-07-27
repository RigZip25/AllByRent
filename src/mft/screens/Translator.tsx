import { ArrowLeftRight, Mic } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { SectionLabel } from "../components/Ui";

const PHRASEBOOK: { src: string; dst: string; phonetic: string }[] = [
  {
    src: "Где ближайший ресторан?",
    dst: "أين أقرب مطعم؟",
    phonetic: "ayna aqrab mat'am?",
  },
  {
    src: "Счёт, пожалуйста",
    dst: "الحساب من فضلك",
    phonetic: "al-hisab min fadlak",
  },
  {
    src: "Спасибо, очень вкусно",
    dst: "شكراً، لذيذ جداً",
    phonetic: "shukran, ladhidh jiddan",
  },
];

export function TranslatorScreen() {
  useParams();
  const [from, setFrom] = useState("Русский");
  const [to, setTo] = useState("Арабский");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<(typeof PHRASEBOOK)[0] | null>(null);
  const [history, setHistory] = useState(PHRASEBOOK.slice(0, 2));

  function translate(text: string) {
    const q = text.trim().toLowerCase();
    if (!q) return;
    const hit =
      PHRASEBOOK.find((p) => p.src.toLowerCase().includes(q.slice(0, 8))) ??
      {
        src: text.trim(),
        dst: "مرحباً بكم في وادي رم",
        phonetic: "marhaban bikum fi wadi rum",
      };
    setResult(hit);
    setHistory((h) => [hit, ...h.filter((x) => x.src !== hit.src)].slice(0, 8));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mft-scroll flex-1 px-6 pt-6 pb-4">
        <BackHeader title="Переводчик" />

        <div className="mb-5 flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex-1 rounded-full bg-[var(--bg-card)] px-4 py-2.5 text-[13px]"
            onClick={() => setFrom(from === "Русский" ? "Арабский" : "Русский")}
          >
            {from}
          </button>
          <button
            type="button"
            aria-label="Поменять языки"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--accent-gold)]"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-[var(--bg-card)] px-4 py-2.5 text-[13px]"
            onClick={() => setTo(to === "Арабский" ? "Русский" : "Арабский")}
          >
            {to}
          </button>
        </div>

        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Введите фразу…"
          rows={3}
          className="w-full resize-none rounded-[12px] bg-[var(--bg-input)] p-4 text-[15px] outline-none ring-1 ring-white/5"
        />

        {result ? (
          <div className="mt-4 rounded-[12px] bg-[var(--accent-amber-soft)] p-4 ring-1 ring-[var(--accent-gold)]/30">
            <div className="text-[18px] font-medium text-[var(--accent-gold)]">
              {result.dst}
            </div>
            <div className="mt-2 text-[13px] text-[var(--text-muted)] italic">
              {result.phonetic}
            </div>
          </div>
        ) : null}

        <section className="mt-8">
          <SectionLabel>История</SectionLabel>
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.src}
                type="button"
                onClick={() => {
                  setSource(h.src);
                  setResult(h);
                }}
                className="w-full rounded-[12px] bg-[var(--bg-card)] px-4 py-3 text-left"
              >
                <div className="text-[13px]">{h.src}</div>
                <div className="mt-0.5 text-[12px] text-[var(--accent-gold)]">
                  {h.dst}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="flex items-center gap-3 border-t border-white/5 px-4 pt-3 pb-[calc(12px+var(--safe-bottom))]">
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--accent-gold)]"
          aria-label="Микрофон"
          onClick={() => {
            setSource(PHRASEBOOK[0].src);
            translate(PHRASEBOOK[0].src);
          }}
        >
          <Mic className="h-5 w-5" />
        </button>
        <Button fullWidth onClick={() => translate(source)}>
          Перевести
        </Button>
      </div>
    </div>
  );
}

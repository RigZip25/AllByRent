import { useMemo, useState } from "react";
import { HelpCircle, MessageCircle, Search } from "lucide-react";
import { searchFaq, type FaqItem } from "../../data/rentanoFaq";

const PRIMARY_GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function RentanoFaqPanel({
  onAskRentano,
}: {
  onAskRentano: (prefill?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = useMemo(() => searchFaq(query), [query]);

  const byCategory = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const item of results) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [results]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-2 rounded-2xl border bg-[#F9FAFB] px-3 py-2.5"
        style={{ borderColor: BORDER }}
      >
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help…"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
          aria-label="Search FAQ"
        />
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-4 py-6 text-center" style={{ borderColor: BORDER }}>
          <HelpCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-[15px] font-medium text-gray-700">No matches</p>
          <p className="mt-1 text-[13px] text-gray-500">
            Try different words, or ask Rentano directly.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {[...byCategory.entries()].map(([category, items]) => (
            <section key={category}>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                {category}
              </h3>
              <ul className="flex flex-col gap-2">
                {items.map((item) => {
                  const open = expandedId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(open ? null : item.id)}
                        className="flex w-full flex-col rounded-2xl border bg-white px-4 py-3 text-left transition-colors active:bg-[#F9FAFB]"
                        style={{ borderColor: BORDER }}
                        aria-expanded={open}
                      >
                        <span className="text-[15px] font-semibold" style={{ color: PRIMARY_GREEN }}>
                          {item.question}
                        </span>
                        {open ? (
                          <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{item.answer}</p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onAskRentano(query.trim() || undefined)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-90"
        style={{ backgroundColor: PRIMARY_GREEN }}
      >
        <MessageCircle className="h-5 w-5" strokeWidth={2} />
        {query.trim() ? "Ask Rentano about this" : "Didn't find an answer? Ask Rentano"}
      </button>
    </div>
  );
}

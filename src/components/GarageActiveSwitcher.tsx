import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import {
  getManageableHostIds,
  isGaragePrimaryOwner,
  onActiveGarageChanged,
  resolveGarageHostId,
  setActiveGarageHostId,
} from "../lib/hostAccess";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { useMessages } from "../lib/i18n/react";
import { fetchGarageStorefrontsByHostIds } from "../lib/garageStorefrontSync";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type Option = {
  hostId: string;
  label: string;
  isMine: boolean;
};

/**
 * Shown when you own a garage and also help in another (invite accepted).
 * Selecting changes where + / shelf / Live chrome apply.
 */
export function GarageActiveSwitcher({ onChanged }: { onChanged?: () => void }) {
  const auth = useAuth();
  const t = useMessages();
  const ownId = resolveHostAccountId(auth.userId);
  const [activeId, setActiveId] = useState(() =>
    resolveGarageHostId(auth.userId, auth.userEmail),
  );
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>({});

  const hostIds = useMemo(
    () => getManageableHostIds(auth.userId, auth.userEmail),
    [auth.userId, auth.userEmail, activeId],
  );

  useEffect(() => {
    setActiveId(resolveGarageHostId(auth.userId, auth.userEmail));
    return onActiveGarageChanged((id) => {
      setActiveId(id || resolveGarageHostId(auth.userId, auth.userEmail));
    });
  }, [auth.userId, auth.userEmail]);

  useEffect(() => {
    if (hostIds.length < 2) return;
    let cancelled = false;
    void fetchGarageStorefrontsByHostIds(hostIds).then((map) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const id of hostIds) {
        const name = map[id]?.shopName?.trim();
        next[id] = name || (id === ownId ? t.garageUi.switcherMyGarage : t.garageUi.switcherSharedGarage);
      }
      setLabels(next);
    });
    return () => {
      cancelled = true;
    };
  }, [hostIds, ownId, t.garageUi.switcherMyGarage, t.garageUi.switcherSharedGarage]);

  if (hostIds.length < 2) return null;

  const options: Option[] = hostIds.map((hostId) => ({
    hostId,
    isMine: hostId === ownId,
    label:
      labels[hostId] ||
      (hostId === ownId ? t.garageUi.switcherMyGarage : t.garageUi.switcherSharedGarage),
  }));

  const active = options.find((o) => o.hostId === activeId) ?? options[0]!;
  const helping = !isGaragePrimaryOwner(auth.userId, active.hostId);

  const select = (hostId: string) => {
    setActiveGarageHostId(hostId);
    setActiveId(hostId);
    setOpen(false);
    onChanged?.();
  };

  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {t.garageUi.switcherLabel}
      </p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2.5 text-left"
          style={{ borderColor: BORDER }}
          aria-expanded={open}
        >
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold" style={{ color: GREEN }}>
              {active.label}
            </span>
            <span className="block text-[11px] text-gray-500">
              {helping ? t.garageUi.switcherHelpingHint : t.garageUi.switcherMineHint}
            </span>
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open ? (
          <ul
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg"
            style={{ borderColor: BORDER }}
          >
            {options.map((opt) => {
              const selected = opt.hostId === active.hostId;
              return (
                <li key={opt.hostId}>
                  <button
                    type="button"
                    onClick={() => select(opt.hostId)}
                    className="flex w-full flex-col px-3 py-2.5 text-left hover:bg-[#F0F4F2]"
                    style={{ backgroundColor: selected ? "#E8F5EE" : undefined }}
                  >
                    <span className="text-[13px] font-bold text-gray-900">{opt.label}</span>
                    <span className="text-[11px] text-gray-500">
                      {opt.isMine ? t.garageUi.switcherMineHint : t.garageUi.switcherHelpingHint}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

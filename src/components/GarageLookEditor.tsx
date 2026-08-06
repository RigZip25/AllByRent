import { useState } from "react";
import {
  accentsForKind,
  type GarageAccentId,
  type GarageShopKind,
} from "../lib/garageIdentity";
import { loadUserProfile, updateGarageIdentity } from "../lib/userProfileStorage";
import { useMessages } from "../lib/i18n/react";

const BORDER = "#E8E6E0";

export function GarageLookEditor({ onChanged }: { onChanged?: () => void }) {
  const t = useMessages();
  const initial = loadUserProfile().garageIdentity;
  const [shopKind, setShopKind] = useState<GarageShopKind>(initial.shopKind);
  const [accentId, setAccentId] = useState<GarageAccentId>(initial.accentId);
  const [shopName, setShopName] = useState(initial.shopName);

  const accents = accentsForKind(shopKind);

  const persist = (patch: {
    shopKind?: GarageShopKind;
    accentId?: GarageAccentId;
    shopName?: string;
  }) => {
    updateGarageIdentity(patch);
    onChanged?.();
  };

  const setKind = (kind: GarageShopKind) => {
    setShopKind(kind);
    const nextAccents = accentsForKind(kind);
    const keep = nextAccents.some((a) => a.id === accentId);
    const nextAccent = keep ? accentId : nextAccents[0]!.id;
    setAccentId(nextAccent);
    persist({ shopKind: kind, accentId: nextAccent });
  };

  return (
    <div className="rounded-2xl border bg-white p-3.5" style={{ borderColor: BORDER }}>
      <p className="text-[13px] font-bold text-gray-900">{t.garageUi.lookTitle}</p>
      <p className="mt-0.5 text-[12px] text-gray-500">{t.garageUi.lookHint}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {(
          [
            { id: "personal" as const, label: t.garageUi.lookPersonal },
            { id: "pro" as const, label: t.garageUi.lookPro },
          ] as const
        ).map((opt) => {
          const active = shopKind === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setKind(opt.id)}
              className="rounded-xl border px-3 py-2.5 text-[13px] font-bold"
              style={{
                borderColor: active ? "#0D5C3A" : BORDER,
                backgroundColor: active ? "#E8F5EE" : "#fff",
                color: active ? "#0D5C3A" : "#374151",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {t.garageUi.lookAccent}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {accents.map((accent) => {
          const active = accentId === accent.id;
          return (
            <button
              key={accent.id}
              type="button"
              onClick={() => {
                setAccentId(accent.id);
                persist({ accentId: accent.id });
              }}
              className="h-9 w-9 rounded-full border-2"
              style={{
                backgroundColor: accent.color,
                borderColor: active ? "#111827" : "#fff",
                boxShadow: active ? `0 0 0 2px ${accent.color}` : "none",
              }}
              aria-label={accent.id}
              aria-pressed={active}
            />
          );
        })}
      </div>

      <label className="mt-3 block">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {t.garageUi.lookShopName}
        </span>
        <input
          type="text"
          maxLength={40}
          value={shopName}
          placeholder={t.garageUi.lookShopNamePlaceholder}
          onChange={(e) => setShopName(e.target.value)}
          onBlur={() => persist({ shopName: shopName.trim() })}
          className="mt-1.5 w-full rounded-xl border bg-[#F9FAFB] px-3 py-2.5 text-[14px] outline-none"
          style={{ borderColor: BORDER }}
        />
      </label>
    </div>
  );
}

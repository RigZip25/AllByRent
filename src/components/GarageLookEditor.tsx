import { useEffect, useState } from "react";
import {
  accentsForKind,
  resolveGarageAccent,
  slugifyGarageName,
  type GarageAccentId,
  type GarageShopKind,
} from "../lib/garageIdentity";
import { loadUserProfile, updateGarageIdentity } from "../lib/userProfileStorage";
import { useMessages } from "../lib/i18n/react";
import { useAuth } from "../hooks/AuthProvider";
import { resolveGarageHostId } from "../lib/hostAccess";
import {
  emitGarageIdentityChanged,
  isGarageSlugAvailable,
  pushGarageStorefrontRemote,
} from "../lib/garageStorefrontSync";

const BORDER = "#E8E6E0";

/**
 * Optional garage look (colors + name + neighborhood).
 * Name is usually set on first garage open; editable here anytime.
 */
export function GarageLookEditor({ onChanged }: { onChanged?: () => void }) {
  const t = useMessages();
  const auth = useAuth();
  const initial = loadUserProfile().garageIdentity;
  const [shopKind, setShopKind] = useState<GarageShopKind>(initial.shopKind);
  const [accentId, setAccentId] = useState<GarageAccentId>(initial.accentId);
  const [shopName, setShopName] = useState(initial.shopName);
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood);
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugBusy, setSlugBusy] = useState(false);

  const accents = accentsForKind(shopKind);
  const activeAccent = resolveGarageAccent({ shopKind, accentId });
  const slugPreview = slugifyGarageName(shopName);

  const persist = async (patch: {
    shopKind?: GarageShopKind;
    accentId?: GarageAccentId;
    shopName?: string;
    shopSlug?: string;
    neighborhood?: string;
  }) => {
    const next = updateGarageIdentity(patch).garageIdentity;
    emitGarageIdentityChanged(next);
    const hostId = (resolveGarageHostId(auth.userId, auth.userEmail) || auth.userId || loadUserProfile().id).trim();
    const remote = await pushGarageStorefrontRemote(hostId, next);
    if (!remote.ok) {
      setNameError(remote.reason);
      return next;
    }
    setNameError(null);
    onChanged?.();
    return next;
  };

  const setKind = (kind: GarageShopKind) => {
    const nextAccents = accentsForKind(kind);
    const keep = nextAccents.some((a) => a.id === accentId);
    const nextAccent = keep ? accentId : nextAccents[0]!.id;
    setShopKind(kind);
    setAccentId(nextAccent);
    void persist({ shopKind: kind, accentId: nextAccent });
  };

  const setAccent = (id: GarageAccentId) => {
    setAccentId(id);
    void persist({ accentId: id });
  };

  const commitShopName = async () => {
    const trimmed = shopName.trim();
    setShopName(trimmed);
    if (!trimmed) {
      setNameError(null);
      await persist({ shopName: "", shopSlug: "" });
      return;
    }
    const slug = slugifyGarageName(trimmed);
    if (!slug) {
      setNameError(t.garageUi.lookShopNameRequired);
      return;
    }
    setSlugBusy(true);
    try {
      const hostId = (resolveGarageHostId(auth.userId, auth.userEmail) || auth.userId || loadUserProfile().id).trim();
      const free = await isGarageSlugAvailable(slug, hostId);
      if (!free) {
        setNameError(t.garageUi.lookShopNameTaken);
        return;
      }
      await persist({ shopName: trimmed, shopSlug: slug });
    } finally {
      setSlugBusy(false);
    }
  };

  useEffect(() => {
    setNameError(null);
  }, [shopName]);

  return (
    <div className="rounded-2xl border bg-white p-3.5" style={{ borderColor: BORDER }}>
      <p className="text-[13px] font-bold text-gray-900">{t.garageUi.lookTitle}</p>
      <p className="mt-0.5 text-[12px] text-gray-500">{t.garageUi.lookHint}</p>

      <div
        className="mt-3 overflow-hidden rounded-xl border"
        style={{ borderColor: `${activeAccent.color}44` }}
        aria-hidden
      >
        <div
          className="flex items-center gap-2 px-3 py-2.5"
          style={{ backgroundColor: activeAccent.soft }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
            style={{ backgroundColor: "#fff", color: activeAccent.color }}
          >
            {shopKind === "pro" ? "🏢" : "🏠"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold" style={{ color: activeAccent.color }}>
              {shopName.trim() || t.garageUi.lookShopNamePlaceholder}
            </p>
            <p className="truncate text-[11px] font-semibold text-gray-500">
              {neighborhood.trim()
                ? neighborhood.trim()
                : shopKind === "pro"
                  ? t.garageUi.lookPro
                  : t.garageUi.lookPersonal}
              {slugPreview ? ` · @${slugPreview}` : ""}
            </p>
          </div>
        </div>
      </div>

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
                borderColor: active ? activeAccent.color : BORDER,
                backgroundColor: active ? activeAccent.soft : "#fff",
                color: active ? activeAccent.color : "#374151",
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
      <div className="mt-2 flex flex-wrap gap-2.5" role="radiogroup" aria-label={t.garageUi.lookAccent}>
        {accents.map((accent) => {
          const active = accentId === accent.id;
          return (
            <button
              key={accent.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={accent.id}
              onClick={() => setAccent(accent.id)}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0"
              style={{
                minHeight: 40,
                minWidth: 40,
                padding: 0,
                backgroundColor: accent.color,
                boxShadow: active
                  ? `0 0 0 2px #fff, 0 0 0 4px ${accent.color}`
                  : `0 0 0 2px ${BORDER}`,
              }}
            >
              {active ? (
                <span className="block h-2.5 w-2.5 rounded-full bg-white" aria-hidden />
              ) : null}
            </button>
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
          onBlur={() => void commitShopName()}
          className="mt-1.5 w-full rounded-xl border bg-[#F9FAFB] px-3 py-2.5 text-[14px] outline-none"
          style={{ borderColor: nameError ? "#FCA5A5" : BORDER }}
        />
        <p className="mt-1 text-[11px] leading-snug text-gray-500">{t.garageUi.lookShopNameWhen}</p>
        {slugPreview ? (
          <p className="mt-0.5 text-[11px] text-gray-500">
            {t.garageUi.lookShopSlugHint(slugPreview)}
            {slugBusy ? "…" : ""}
          </p>
        ) : null}
        {nameError ? <p className="mt-1 text-[12px] font-semibold text-red-600">{nameError}</p> : null}
      </label>

      <label className="mt-3 block">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          {t.garageUi.lookNeighborhood}
        </span>
        <input
          type="text"
          maxLength={40}
          value={neighborhood}
          placeholder={t.garageUi.lookNeighborhoodPlaceholder}
          onChange={(e) => setNeighborhood(e.target.value)}
          onBlur={() => {
            const trimmed = neighborhood.trim();
            setNeighborhood(trimmed);
            void persist({ neighborhood: trimmed });
          }}
          className="mt-1.5 w-full rounded-xl border bg-[#F9FAFB] px-3 py-2.5 text-[14px] outline-none"
          style={{ borderColor: BORDER }}
        />
        <p className="mt-1 text-[11px] leading-snug text-gray-500">{t.garageUi.lookNeighborhoodHint}</p>
      </label>
    </div>
  );
}

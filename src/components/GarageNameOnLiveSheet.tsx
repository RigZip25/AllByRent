import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  garageNeedsPublicName,
  slugifyGarageName,
  suggestHouseholdGarageNames,
} from "../lib/garageIdentity";
import { loadUserProfile, updateGarageIdentity } from "../lib/userProfileStorage";
import {
  emitGarageIdentityChanged,
  isGarageSlugAvailable,
  pushGarageStorefrontRemote,
} from "../lib/garageStorefrontSync";
import { useAuth } from "../hooks/AuthProvider";
import { useMessages } from "../lib/i18n/react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type Props = {
  open: boolean;
  onNamed: () => void;
  onCancel: () => void;
};

/**
 * Soft naming step when the household first goes Live.
 * Suggestions lean family/household (shared account), not one person’s name only.
 */
export function GarageNameOnLiveSheet({ open, onNamed, onCancel }: Props) {
  const t = useMessages();
  const auth = useAuth();
  const profile = loadUserProfile();
  const suggestions = useMemo(
    () =>
      suggestHouseholdGarageNames(
        profile.displayName || auth.userEmail?.split("@")[0] || "",
        auth.userId ?? profile.id ?? "",
      ),
    [profile.displayName, profile.id, auth.userEmail, auth.userId],
  );

  const [shopName, setShopName] = useState(suggestions[0] ?? "");
  const [neighborhood, setNeighborhood] = useState(profile.garageIdentity.neighborhood ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const current = loadUserProfile().garageIdentity;
    if (!garageNeedsPublicName(current) && current.shopName.trim()) {
      setShopName(current.shopName);
    } else if (suggestions[0]) {
      setShopName(suggestions[0]);
    }
    setNeighborhood(current.neighborhood ?? "");
    setError(null);
  }, [open, suggestions]);

  if (!open) return null;

  const save = async () => {
    const trimmed = shopName.trim();
    if (!trimmed) {
      setError(t.garageUi.nameLiveRequired);
      return;
    }
    const slug = slugifyGarageName(trimmed);
    if (!slug) {
      setError(t.garageUi.nameLiveRequired);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const hostId = (auth.userId ?? loadUserProfile().id).trim();
      const free = await isGarageSlugAvailable(slug, hostId);
      if (!free) {
        setError(t.garageUi.lookShopNameTaken);
        return;
      }
      const next = updateGarageIdentity({
        shopName: trimmed,
        shopSlug: slug,
        neighborhood: neighborhood.trim(),
      }).garageIdentity;
      emitGarageIdentityChanged(next);
      const remote = await pushGarageStorefrontRemote(hostId, next);
      if (!remote.ok) {
        setError(remote.reason);
        return;
      }
      onNamed();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-10 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garage-name-live-title"
    >
      <div className="w-full max-w-[390px] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b px-5 pb-4 pt-5" style={{ borderColor: BORDER }}>
          <p id="garage-name-live-title" className="text-[17px] font-extrabold" style={{ color: GREEN }}>
            {t.garageUi.nameLiveTitle}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{t.garageUi.nameLiveBody}</p>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((idea) => {
              const active = shopName.trim() === idea;
              return (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setShopName(idea);
                    setError(null);
                  }}
                  className="rounded-full border px-3 py-1.5 text-[12px] font-bold"
                  style={{
                    borderColor: active ? GREEN : BORDER,
                    backgroundColor: active ? "#E8F5EE" : "#fff",
                    color: active ? GREEN : "#374151",
                  }}
                >
                  {idea}
                </button>
              );
            })}
          </div>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {t.garageUi.lookShopName}
            </span>
            <input
              type="text"
              maxLength={40}
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder={t.garageUi.lookShopNamePlaceholder}
              className="mt-1.5 w-full rounded-xl border bg-[#F9FAFB] px-3 py-2.5 text-[14px] font-semibold outline-none"
              style={{ borderColor: error ? "#FCA5A5" : BORDER }}
              autoFocus
            />
            {slugifyGarageName(shopName) ? (
              <p className="mt-1 text-[11px] text-gray-500">
                {t.garageUi.lookShopSlugHint(slugifyGarageName(shopName))}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {t.garageUi.lookNeighborhood}
            </span>
            <input
              type="text"
              maxLength={40}
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder={t.garageUi.lookNeighborhoodPlaceholder}
              className="mt-1.5 w-full rounded-xl border bg-[#F9FAFB] px-3 py-2.5 text-[14px] outline-none"
              style={{ borderColor: BORDER }}
            />
            <p className="mt-1 text-[11px] leading-snug text-gray-500">{t.garageUi.lookNeighborhoodHint}</p>
          </label>

          {error ? <p className="text-[12px] font-semibold text-red-600">{error}</p> : null}
        </div>

        <div className="flex gap-3 border-t px-5 py-4" style={{ borderColor: BORDER }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151] disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {busy ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.common.save}
              </span>
            ) : (
              t.garageUi.nameLiveConfirm
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

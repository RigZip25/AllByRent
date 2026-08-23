import { useMemo, useState } from "react";
import { Check, Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import {
  slugifyGarageName,
  suggestHouseholdGarageNames,
  accentsForKind,
  type GarageShopKind,
} from "../lib/garageIdentity";
import {
  hasCompletedHouseholdGarageSetup,
  markHouseholdGarageSetupDone,
} from "../lib/householdSetupStorage";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { loadUserProfile, updateGarageIdentity } from "../lib/userProfileStorage";
import {
  emitGarageIdentityChanged,
  isGarageSlugAvailable,
  pushGarageStorefrontRemote,
} from "../lib/garageStorefrontSync";
import {
  buildCoHostInviteUrlForInvite,
  type CoHostRecord,
} from "../lib/coHostStorage";
import { inviteCoHostWithSync } from "../lib/repositories/coHostRepository";
import { useMessages } from "../lib/i18n/react";
import { APP_ORIGIN } from "../lib/brand";
import { setActiveGarageHostId } from "../lib/hostAccess";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";
const MAX_EXTRA_MEMBERS = 3;

type MemberDraft = { name: string; email: string };

type Props = {
  onDone: () => void;
  onSkipAlone?: () => void;
};

/**
 * First garage open: Personal/Pro + who shares, name + neighborhood, then invites.
 * Everyone still owns this garage; invites add helpers who keep their own shops too.
 */
export function HouseholdGarageSetupScreen({ onDone, onSkipAlone }: Props) {
  const t = useMessages();
  const auth = useAuth();
  const profile = loadUserProfile();
  const hostId = resolveHostAccountId(auth.userId) || profile.id;
  const hostEmail = (auth.userEmail ?? "").trim();

  const suggestions = useMemo(
    () =>
      suggestHouseholdGarageNames(
        profile.displayName || hostEmail.split("@")[0] || "",
        hostId,
      ),
    [profile.displayName, hostEmail, hostId],
  );

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [shopKind, setShopKind] = useState<GarageShopKind>(
    profile.garageIdentity.shopKind || "personal",
  );
  const [seatHint, setSeatHint] = useState<"solo" | "few" | "more">("solo");
  const [shopName, setShopName] = useState(
    profile.garageIdentity.shopName || suggestions[0] || "",
  );
  const [neighborhood, setNeighborhood] = useState(
    profile.garageIdentity.neighborhood || "",
  );
  const [members, setMembers] = useState<MemberDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInvites, setCreatedInvites] = useState<CoHostRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const saveIdentity = async (): Promise<boolean> => {
    const trimmed = shopName.trim();
    if (!trimmed) {
      setError(t.garageUi.householdNameRequired);
      return false;
    }
    const slug = slugifyGarageName(trimmed);
    if (!slug) {
      setError(t.garageUi.householdNameRequired);
      return false;
    }
    const free = await isGarageSlugAvailable(slug, hostId);
    if (!free) {
      setError(t.garageUi.lookShopNameTaken);
      return false;
    }
    const accentId = accentsForKind(shopKind)[0]?.id ?? profile.garageIdentity.accentId;
    const next = updateGarageIdentity({
      shopKind,
      accentId,
      shopName: trimmed,
      shopSlug: slug,
      neighborhood: neighborhood.trim(),
    }).garageIdentity;
    emitGarageIdentityChanged(next);
    const remote = await pushGarageStorefrontRemote(hostId, next);
    if (!remote.ok) {
      setError(remote.reason);
      return false;
    }
    if (hostId) setActiveGarageHostId(hostId);
    return true;
  };

  const goFromKind = () => {
    setError(null);
    setStep(2);
    if (seatHint === "few" && members.length === 0) {
      setMembers([{ name: "", email: "" }]);
    }
  };

  const goMembers = async () => {
    setBusy(true);
    setError(null);
    try {
      const ok = await saveIdentity();
      if (!ok) return;
      if (seatHint === "solo") {
        markHouseholdGarageSetupDone();
        setCreatedInvites([]);
        setStep(4);
        return;
      }
      setStep(3);
    } finally {
      setBusy(false);
    }
  };

  const sendInvites = async () => {
    if (!hostId || !hostEmail) {
      setError(t.garageUi.householdSignInNeeded);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const invited: CoHostRecord[] = [];
      for (const member of members) {
        const email = member.email.trim();
        const name = member.name.trim();
        if (!email && !name) continue;
        if (!email) {
          setError(t.garageUi.householdMemberEmailRequired);
          return;
        }
        const result = await inviteCoHostWithSync(hostId, email, hostEmail, name || undefined);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        invited.push(result.record);
      }
      setCreatedInvites(invited);
      markHouseholdGarageSetupDone();
      setStep(4);
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (invite: CoHostRecord) => {
    const url = buildCoHostInviteUrlForInvite(invite.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(invite.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const title =
    step === 1
      ? t.garageUi.householdTitleKind
      : step === 2
        ? t.garageUi.householdTitleName
        : step === 3
          ? t.garageUi.householdTitlePeople
          : t.garageUi.householdTitleDone;
  const body =
    step === 1
      ? t.garageUi.householdBodyKind
      : step === 2
        ? t.garageUi.householdBodyName
        : step === 3
          ? t.garageUi.householdBodyPeople
          : t.garageUi.householdBodyDone;

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top,0px))]" style={{ borderColor: BORDER }}>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {t.garageUi.householdStep(step, 4)}
        </p>
        <h1 className="mt-1 text-[20px] font-extrabold" style={{ color: GREEN }}>
          {title}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-gray-600">{body}</p>
      </header>

      <div className="screen-scroll flex-1 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        {step === 1 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {([
                ["personal", t.garageUi.lookPersonal, t.garageUi.householdKindPersonalHint],
                ["pro", t.garageUi.lookPro, t.garageUi.householdKindProHint],
              ] as const).map(([kind, label, hint]) => {
                const active = shopKind === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setShopKind(kind)}
                    className="rounded-2xl border px-3 py-3 text-left"
                    style={{
                      borderColor: active ? GREEN : BORDER,
                      backgroundColor: active ? "#E8F5EE" : "#fff",
                    }}
                  >
                    <p className="text-[14px] font-bold" style={{ color: active ? GREEN : "#111" }}>
                      {label}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-gray-500">{hint}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {t.garageUi.householdSeatsLabel}
            </p>
            <div className="space-y-2">
              {([
                ["solo", t.garageUi.householdSeatsSolo],
                ["few", t.garageUi.householdSeatsFew],
                ["more", t.garageUi.householdSeatsMore],
              ] as const).map(([id, label]) => {
                const active = seatHint === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSeatHint(id)}
                    className="w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold"
                    style={{
                      borderColor: active ? GREEN : BORDER,
                      backgroundColor: active ? "#E8F5EE" : "#fff",
                      color: active ? GREEN : "#374151",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] leading-relaxed text-gray-500">{t.garageUi.householdSeatsNote}</p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
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
                className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-[14px] font-semibold outline-none"
                style={{ borderColor: BORDER }}
              />
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
                className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-[14px] outline-none"
                style={{ borderColor: BORDER }}
              />
              <p className="mt-1 text-[11px] text-gray-500">{t.garageUi.lookNeighborhoodHint}</p>
            </label>

            <p className="rounded-xl border bg-white px-3 py-2.5 text-[12px] leading-relaxed text-gray-600" style={{ borderColor: BORDER }}>
              {t.garageUi.householdYouAre(profile.displayName || hostEmail || "You")}
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <p className="text-[13px] text-gray-600">{t.garageUi.householdPeopleHint}</p>
            {members.map((member, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-white p-3"
                style={{ borderColor: BORDER }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] font-bold text-gray-500">
                    {t.garageUi.householdMemberN(index + 2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMembers((list) => list.filter((_, i) => i !== index))}
                    className="rounded-lg p-1.5 text-gray-400"
                    aria-label={t.common.cancel}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={40}
                  value={member.name}
                  onChange={(e) =>
                    setMembers((list) =>
                      list.map((row, i) =>
                        i === index ? { ...row, name: e.target.value } : row,
                      ),
                    )
                  }
                  placeholder={t.garageUi.householdMemberNamePh}
                  className="mb-2 w-full rounded-xl border bg-[#F9FAFB] px-3 py-2.5 text-[14px] outline-none"
                  style={{ borderColor: BORDER }}
                />
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) =>
                    setMembers((list) =>
                      list.map((row, i) =>
                        i === index ? { ...row, email: e.target.value } : row,
                      ),
                    )
                  }
                  placeholder={t.garageUi.householdMemberEmailPh}
                  className="w-full rounded-xl border bg-[#F9FAFB] px-3 py-2.5 text-[14px] outline-none"
                  style={{ borderColor: BORDER }}
                />
              </div>
            ))}

            {members.length < MAX_EXTRA_MEMBERS ? (
              <button
                type="button"
                onClick={() => setMembers((list) => [...list, { name: "", email: "" }])}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-[13px] font-bold text-gray-700"
                style={{ borderColor: BORDER }}
              >
                <Plus className="h-4 w-4" />
                {t.garageUi.householdAddMember}
              </button>
            ) : null}

            <p className="text-[12px] leading-relaxed text-gray-500">{t.garageUi.householdInviteNote}</p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3">
            <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <p className="text-[15px] font-bold" style={{ color: GREEN }}>
                {shopName.trim()}
              </p>
              {neighborhood.trim() ? (
                <p className="mt-0.5 text-[13px] font-semibold text-gray-600">{neighborhood.trim()}</p>
              ) : null}
              <p className="mt-2 text-[12px] text-gray-500">
                {t.garageUi.lookShopSlugHint(slugifyGarageName(shopName))}
              </p>
            </div>

            {createdInvites.length === 0 ? (
              <p className="text-[14px] text-gray-600">{t.garageUi.householdSoloDone}</p>
            ) : (
              <>
                <p className="text-[13px] text-gray-600">{t.garageUi.householdShareLinks}</p>
                {createdInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-2xl border bg-white p-3"
                    style={{ borderColor: BORDER }}
                  >
                    <p className="text-[14px] font-bold text-gray-900">
                      {invite.displayName || invite.email}
                    </p>
                    <p className="text-[12px] text-gray-500">{invite.email}</p>
                    <button
                      type="button"
                      onClick={() => void copyLink(invite)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold"
                      style={{ borderColor: GREEN, color: GREEN }}
                    >
                      {copiedId === invite.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedId === invite.id
                        ? t.garageUi.householdCopied
                        : t.garageUi.householdCopyInvite}
                    </button>
                    <a
                      href={`mailto:${invite.email}?subject=${encodeURIComponent(
                        t.garageUi.householdMailSubject,
                      )}&body=${encodeURIComponent(
                        t.garageUi.householdMailBody(
                          invite.displayName || "there",
                          shopName.trim(),
                          buildCoHostInviteUrlForInvite(invite.id),
                          APP_ORIGIN,
                        ),
                      )}`}
                      className="mt-2 block text-center text-[12px] font-semibold underline"
                      style={{ color: GREEN }}
                    >
                      {t.garageUi.householdOpenMail}
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : null}

        {error ? <p className="mt-3 text-[13px] font-semibold text-red-600">{error}</p> : null}
      </div>

      <div className="shrink-0 border-t bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]" style={{ borderColor: BORDER }}>
        {step === 1 ? (
          <button
            type="button"
            onClick={goFromKind}
            className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {t.garageUi.householdContinueName}
          </button>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void goMembers()}
              className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : seatHint === "solo" ? (
                t.garageUi.householdContinueAlone
              ) : (
                t.garageUi.householdContinuePeople
              )}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setStep(1)}
              className="w-full py-2 text-center text-[13px] font-semibold text-gray-600 underline disabled:opacity-50"
            >
              {t.common.back}
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl border py-3 text-[14px] font-semibold text-gray-700 disabled:opacity-50"
              style={{ borderColor: BORDER }}
            >
              {t.common.back}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void sendInvites()}
              className="flex-[1.4] rounded-xl py-3 text-[14px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : members.some((m) => m.email.trim()) ? (
                t.garageUi.householdSendInvites
              ) : (
                t.garageUi.householdContinueAlone
              )}
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <button
            type="button"
            onClick={onDone}
            className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {t.garageUi.householdEnterGarage}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function shouldShowHouseholdGarageSetup(opts: {
  shopName: string;
  userId?: string | null;
  email?: string | null;
}): boolean {
  if (hasCompletedHouseholdGarageSetup()) return false;
  // Already named elsewhere — don't force the wizard again.
  if (opts.shopName.trim()) {
    markHouseholdGarageSetupDone();
    return false;
  }
  // Everyone keeps their own garage — even if they also accepted a co-host invite
  // (Barbara next door to her daughter still names her own house garage).
  void opts.userId;
  void opts.email;
  return true;
}

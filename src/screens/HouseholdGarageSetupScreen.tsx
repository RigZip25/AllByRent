import { useMemo, useState } from "react";
import { Check, Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import {
  slugifyGarageName,
  suggestHouseholdGarageNames,
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
  getActiveCoHostHostIds,
  getPendingInvitesForEmail,
  type CoHostRecord,
} from "../lib/coHostStorage";
import { inviteCoHostWithSync } from "../lib/repositories/coHostRepository";
import { useMessages } from "../lib/i18n/react";
import { APP_ORIGIN } from "../lib/brand";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";
const MAX_EXTRA_MEMBERS = 3;

type MemberDraft = { name: string; email: string };

type Props = {
  onDone: () => void;
  onSkipAlone: () => void;
};

/**
 * First garage open: name the household storefront, then invite 0–3 people
 * on their own emails (each signs in / Face ID separately).
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

  const [step, setStep] = useState<1 | 2 | 3>(1);
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
    const next = updateGarageIdentity({
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
    return true;
  };

  const finishSolo = async () => {
    setBusy(true);
    setError(null);
    try {
      const ok = await saveIdentity();
      if (!ok) return;
      markHouseholdGarageSetupDone();
      onSkipAlone();
    } finally {
      setBusy(false);
    }
  };

  const goMembers = async () => {
    setBusy(true);
    setError(null);
    try {
      const ok = await saveIdentity();
      if (!ok) return;
      setStep(2);
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
      setStep(3);
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

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top,0px))]" style={{ borderColor: BORDER }}>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {t.garageUi.householdStep(step, 3)}
        </p>
        <h1 className="mt-1 text-[20px] font-extrabold" style={{ color: GREEN }}>
          {step === 1
            ? t.garageUi.householdTitleName
            : step === 2
              ? t.garageUi.householdTitlePeople
              : t.garageUi.householdTitleDone}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-gray-600">
          {step === 1
            ? t.garageUi.householdBodyName
            : step === 2
              ? t.garageUi.householdBodyPeople
              : t.garageUi.householdBodyDone}
        </p>
      </header>

      <div className="screen-scroll flex-1 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        {step === 1 ? (
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

        {step === 2 ? (
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

        {step === 3 ? (
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
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void goMembers()}
              className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t.garageUi.householdContinuePeople}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void finishSolo()}
              className="w-full py-2 text-center text-[13px] font-semibold text-gray-600 underline disabled:opacity-50"
            >
              {t.garageUi.householdJustMe}
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setStep(1)}
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

        {step === 3 ? (
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
  // Co-hosts join an existing garage — they don't create a new household.
  const uid = opts.userId?.trim() ?? "";
  const email = opts.email?.trim() ?? "";
  if (uid && getActiveCoHostHostIds(uid, email).length > 0) {
    markHouseholdGarageSetupDone();
    return false;
  }
  if (email && getPendingInvitesForEmail(email).length > 0) {
    return false;
  }
  return true;
}

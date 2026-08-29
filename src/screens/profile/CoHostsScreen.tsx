import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import { buildCoHostInviteUrl } from "../../lib/coHostStorage";
import { useMessages } from "../../lib/i18n/react";
import {
  acceptCoHostInviteWithSync,
  activateCoHostInviteWithSync,
  declineCoHostInviteWithSync,
  getCoHostsForHost,
  getPendingInvitesForEmail,
  inviteCoHostWithSync,
  removeCoHostWithSync,
  syncCoHostsFromRemote,
  type CoHostRecord,
} from "../../lib/repositories/coHostRepository";
import { resolveHostAccountEmail, resolveHostAccountId } from "../../lib/hostIdentity";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const SURFACE = "#F0F4F2";

function localizeCoHostError(
  error: string,
  t: ReturnType<typeof useMessages>["profileDeep"]["coHosts"],
): string {
  switch (error) {
    case "Enter a valid email address.":
      return t.errInvalidEmail;
    case "You cannot invite yourself.":
      return t.errSelfInvite;
    case "An invite is already pending for this email.":
      return t.errInvitePending;
    case "This person is already a co-host.":
      return t.errAlreadyCoHost;
    case "Invite not found.":
      return t.errInviteNotFound;
    case "This invite is no longer pending.":
      return t.errInviteNotPending;
    default:
      return error;
  }
}

function CoHostRow({
  record,
  onRemove,
  onActivate,
  statusActive,
  statusPending,
  markActive,
  remove,
  removeAria,
}: {
  record: CoHostRecord;
  onRemove: () => void;
  onActivate?: () => void;
  statusActive: string;
  statusPending: string;
  markActive: string;
  remove: string;
  removeAria: (email: string) => string;
}) {
  const statusLabel =
    record.status === "active"
      ? statusActive
      : record.acceptedAt
        ? statusActive
        : statusPending;

  return (
    <li
      className="flex items-center gap-3 rounded-2xl border bg-white p-4"
      style={{ borderColor: BORDER }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: SURFACE }}
      >
        <Mail className="h-5 w-5" style={{ color: GREEN_LIGHT }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-gray-900">{record.email}</p>
        <p className="text-[13px] text-gray-500">{statusLabel}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {record.status === "pending" && onActivate ? (
          <button
            type="button"
            onClick={onActivate}
            className="rounded-lg px-2 py-1 text-[12px] font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {markActive}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-red-600"
          aria-label={removeAria(record.email)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {remove}
        </button>
      </div>
    </li>
  );
}

export function CoHostsScreen({ onBack }: { onBack: () => void }) {
  const auth = useAuth();
  const { common, profileDeep } = useMessages();
  const t = profileDeep.coHosts;
  const hostId = resolveHostAccountId(auth.userId);
  const hostEmail = resolveHostAccountEmail(auth.userEmail);
  const acceptorId = auth.userId ?? hostId;

  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const inviteUrl = useMemo(() => buildCoHostInviteUrl(), []);

  const copyInviteLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyHint(t.copySuccess);
      setError(null);
    } catch {
      setCopyHint(null);
      setError(t.copyFailed);
    }
  }, [inviteUrl, t.copyFailed, t.copySuccess]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const coHosts = useMemo(() => getCoHostsForHost(hostId), [hostId, version]);
  const pendingForYou = useMemo(
    () => getPendingInvitesForEmail(hostEmail),
    [hostEmail, version],
  );

  const activeCoHosts = coHosts.filter((r) => r.status === "active");
  const pendingCoHosts = coHosts.filter((r) => r.status === "pending");

  useEffect(() => {
    void syncCoHostsFromRemote(hostId, hostEmail).then(() => refresh());
  }, [hostEmail, hostId, refresh]);

  const handleInvite = () => {
    setError(null);
    setBusy(true);
    void inviteCoHostWithSync(hostId, inviteEmail, hostEmail)
      .then((result) => {
        if (!result.ok) {
          setError(localizeCoHostError(result.error, t));
          return;
        }
        setInviteEmail("");
        if (result.emailSent) {
          setCopyHint(t.inviteEmailed);
        } else if (result.emailError) {
          setCopyHint(t.inviteSavedEmailFailed(result.emailError));
        } else {
          setCopyHint(t.inviteSaved);
        }
        refresh();
      })
      .finally(() => setBusy(false));
  };

  const handleAccept = (inviteId: string) => {
    void acceptCoHostInviteWithSync(inviteId, acceptorId).then((result) => {
      if (!result.ok) {
        setError(localizeCoHostError(result.error, t));
        return;
      }
      setError(null);
      refresh();
    });
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 flex items-center gap-3 px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold text-gray-600 active:bg-[#F9FAFB]"
          style={{ borderColor: BORDER }}
        >
          <ArrowLeft className="h-4 w-4" />
          {common.back}
        </button>
        <h1 className="text-[20px] font-bold" style={{ color: GREEN }}>
          {t.title}
        </h1>
      </header>

      <div className="screen-scroll flex-1 px-4 pb-6">
        <p className="mb-4 text-[14px] leading-relaxed text-gray-600">{t.subtitle}</p>

        {pendingForYou.length > 0 ? (
          <section className="mb-5">
            <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              {t.invitationsForYou}
            </p>
            <ul className="flex flex-col gap-2">
              {pendingForYou.map((invite) => (
                <li
                  key={invite.id}
                  className="rounded-2xl border bg-white p-4"
                  style={{ borderColor: BORDER }}
                >
                  <p className="text-[15px] font-semibold text-gray-900">{t.inviteCardTitle}</p>
                  <p className="mt-1 text-[13px] text-gray-500">{t.inviteCardBody(invite.email)}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(invite.id)}
                      className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white"
                      style={{ backgroundColor: GREEN }}
                    >
                      {t.accept}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void declineCoHostInviteWithSync(invite.id).then(() => refresh());
                      }}
                      className="flex-1 rounded-xl border py-2.5 text-[14px] font-semibold text-gray-600"
                      style={{ borderColor: BORDER }}
                    >
                      {t.decline}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-5">
          <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {t.inviteSection}
          </p>
          <div
            className="rounded-2xl border bg-white p-4"
            style={{ borderColor: BORDER }}
          >
            <label className="mb-2 block text-[13px] font-semibold text-gray-700" htmlFor="cohost-email">
              {t.emailLabel}
            </label>
            <input
              id="cohost-email"
              type="email"
              autoComplete="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="mb-3 w-full rounded-xl border px-3 py-2.5 text-[15px] outline-none focus:ring-2"
              style={{ borderColor: BORDER }}
            />
            {error ? (
              <p className="mb-3 text-[13px] text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={busy || !inviteEmail.trim()}
              onClick={handleInvite}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: GREEN }}
            >
              <UserPlus className="h-4 w-4" />
              {busy ? t.sending : t.sendInvite}
            </button>
            <div className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: BORDER }}>
              <p className="text-[12px] font-semibold text-gray-700">{t.shareInviteLink}</p>
              <p className="mt-1 break-all text-[12px] text-gray-500">{inviteUrl}</p>
              <button
                type="button"
                onClick={() => void copyInviteLink()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-white"
                style={{ backgroundColor: GREEN_LIGHT }}
              >
                <Copy className="h-3.5 w-3.5" />
                {t.copyLink}
              </button>
            </div>
            {copyHint ? (
              <p className="mt-3 text-[12px] leading-snug text-emerald-700" role="status">
                {copyHint}
              </p>
            ) : null}
            <p className="mt-3 text-[12px] leading-snug text-gray-500">{t.inviteHint}</p>
          </div>
        </section>

        {pendingCoHosts.length > 0 ? (
          <section className="mb-5">
            <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              {t.pendingInvites}
            </p>
            <ul className="flex flex-col gap-2">
              {pendingCoHosts.map((record) => (
                <CoHostRow
                  key={record.id}
                  record={record}
                  statusActive={t.statusActive}
                  statusPending={t.statusPending}
                  markActive={t.markActive}
                  remove={t.remove}
                  removeAria={t.removeAria}
                  onActivate={() => {
                    void activateCoHostInviteWithSync(hostId, record.id).then(() => refresh());
                  }}
                  onRemove={() => {
                    void removeCoHostWithSync(hostId, record.id).then(() => refresh());
                  }}
                />
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <p className="mb-2 flex items-center gap-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            <Users className="h-3.5 w-3.5" />
            {t.activeCoHosts(activeCoHosts.length)}
          </p>
          {activeCoHosts.length === 0 ? (
            <div
              className="rounded-2xl border bg-white px-4 py-8 text-center"
              style={{ borderColor: BORDER }}
            >
              <p className="text-[15px] font-semibold text-gray-800">{t.emptyTitle}</p>
              <p className="mt-1 text-[13px] text-gray-500">{t.emptyBody}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {activeCoHosts.map((record) => (
                <CoHostRow
                  key={record.id}
                  record={record}
                  statusActive={t.statusActive}
                  statusPending={t.statusPending}
                  markActive={t.markActive}
                  remove={t.remove}
                  removeAria={t.removeAria}
                  onRemove={() => {
                    void removeCoHostWithSync(hostId, record.id).then(() => refresh());
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

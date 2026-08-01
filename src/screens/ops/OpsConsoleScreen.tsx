import { useEffect, useMemo, useState } from "react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, SEO_ORIGIN, SUPPORT_EMAIL } from "../../lib/brand";
import {
  attemptOpsLogin,
  getOpsCredentials,
  isOpsSessionActive,
  opsLogout,
} from "../../lib/ops/opsAuth";
import {
  isOpsLocationIndexable,
  loadOpsSettings,
  OPS_SETTINGS_CHANGED_EVENT,
  resetOpsSettings,
  saveOpsSettings,
  slugifyMarketingLocation,
  type OpsMarketingLocation,
  type OpsSettings,
} from "../../lib/ops/opsSettings";
import { computeOpsPulse, type OpsPulse } from "../../lib/ops/opsPulse";
import {
  clearFoundingHostPromoSeen,
  isFoundingHostPromoSeen,
  markFoundingHostPromoSeen,
} from "../../lib/foundingHostPromoStorage";
import {
  formatSeoLocationLabel,
  SEO_LOCATIONS,
  type SeoLocation,
} from "../../lib/seo/seoLocations";
import { setClusterRadiusMi } from "../../lib/clusterConfig";
import {
  fetchRemoteFeedback,
  loadLocalFeedback,
  mergeFeedbackInbox,
  patchRemoteFeedbackStatus,
  PLATFORM_FEEDBACK_CHANGED_EVENT,
  updateLocalFeedbackStatus,
  type FeedbackKind,
  type FeedbackStatus,
  type PlatformFeedback,
} from "../../lib/platformFeedbackStorage";

const BORDER = "#E8E6E0";
const MUTED = "#6B7280";

function pctLabel(rate: number): string {
  return `${Math.round(rate * 1000) / 10}%`;
}

function rateFromPercentInput(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(50, Math.max(0, n)) / 100;
}

function percentInputValue(rate: number): string {
  const pct = Math.round(rate * 1000) / 10;
  return Number.isInteger(pct) ? String(pct) : String(pct);
}

function kindLabel(kind: FeedbackKind): string {
  switch (kind) {
    case "help":
      return "Помощь";
    case "complaint":
      return "Жалоба";
    case "idea":
      return "Идея";
    default:
      return "Другое";
  }
}

function statusLabel(status: FeedbackStatus): string {
  switch (status) {
    case "seen":
      return "Просмотрено";
    case "done":
      return "Закрыто";
    default:
      return "Новое";
  }
}

type OpsConsoleScreenProps = {
  onExitToApp: () => void;
};

export function OpsConsoleScreen({ onExitToApp }: OpsConsoleScreenProps) {
  const [authed, setAuthed] = useState(() => isOpsSessionActive());
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [settings, setSettings] = useState<OpsSettings>(() => loadOpsSettings());
  const [pulse, setPulse] = useState<OpsPulse>(() => computeOpsPulse());
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [promoPercent, setPromoPercent] = useState("");
  const [rentalFeeInput, setRentalFeeInput] = useState(() =>
    percentInputValue(loadOpsSettings().rentalFeeRate),
  );
  const [sellFeeInput, setSellFeeInput] = useState(() =>
    percentInputValue(loadOpsSettings().sellFeeRate),
  );
  const [clusterInput, setClusterInput] = useState(() =>
    String(loadOpsSettings().clusterDefaultMi),
  );
  const [locName, setLocName] = useState("");
  const [locDistrict, setLocDistrict] = useState("");
  const [locCountry, setLocCountry] = useState("CZ");
  const [locNotes, setLocNotes] = useState("");
  const [inbox, setInbox] = useState<PlatformFeedback[]>(() => loadLocalFeedback());
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxWarning, setInboxWarning] = useState<string | null>(null);

  const refresh = () => {
    const next = loadOpsSettings();
    setSettings(next);
    setRentalFeeInput(percentInputValue(next.rentalFeeRate));
    setSellFeeInput(percentInputValue(next.sellFeeRate));
    setClusterInput(String(next.clusterDefaultMi));
    setPulse(computeOpsPulse());
  };

  const refreshInbox = async () => {
    setInboxLoading(true);
    const local = loadLocalFeedback();
    const opsPass = getOpsCredentials().password;
    const remote = await fetchRemoteFeedback(opsPass);
    setInbox(mergeFeedbackInbox(local, remote));
    setInboxWarning(
      remote.length === 0
        ? "Удалённая очередь пуста или таблица ещё не создана в Supabase. Локальные заявки ниже всё равно видны."
        : null,
    );
    setInboxLoading(false);
  };

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(OPS_SETTINGS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(OPS_SETTINGS_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const onFb = () => {
      void refreshInbox();
    };
    window.addEventListener(PLATFORM_FEEDBACK_CHANGED_EVENT, onFb);
    void refreshInbox();
    return () => window.removeEventListener(PLATFORM_FEEDBACK_CHANGED_EVENT, onFb);
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    document.title = `${APP_NAME} · Ops`;
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute("content", "noindex,nofollow");
    } else {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex,nofollow";
      document.head.appendChild(meta);
    }
  }, [authed]);

  const flash = (msg: string) => {
    setSavedFlash(msg);
    window.setTimeout(() => setSavedFlash(null), 2200);
  };

  const persist = (patch: Partial<OpsSettings>, msg = "Сохранено"): OpsSettings => {
    const next = saveOpsSettings(patch);
    setSettings(next);
    setPulse(computeOpsPulse());
    flash(msg);
    return next;
  };

  const citiesByCountry = useMemo(() => {
    const map = new Map<string, SeoLocation[]>();
    for (const loc of SEO_LOCATIONS) {
      const list = map.get(loc.country) ?? [];
      list.push(loc);
      map.set(loc.country, list);
    }
    return [...map.entries()];
  }, []);

  const newCount = inbox.filter((r) => r.status === "new").length;

  const addMarketingLocation = () => {
    const name = locName.trim();
    if (!name) {
      flash("Укажите город или район");
      return;
    }
    const row: OpsMarketingLocation = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `ml_${Date.now()}`,
      name,
      district: locDistrict.trim(),
      country: locCountry.trim().toUpperCase() || "CZ",
      notes: locNotes.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    };
    const next = [row, ...settings.marketingLocations];
    persist({ marketingLocations: next }, "Локация добавлена");
    setLocName("");
    setLocDistrict("");
    setLocNotes("");
  };

  const setFeedbackStatus = async (row: PlatformFeedback, status: FeedbackStatus) => {
    updateLocalFeedbackStatus(row.id, status);
    await patchRemoteFeedbackStatus(getOpsCredentials().password, row.id, status);
    await refreshInbox();
    flash(statusLabel(status));
  };

  if (!authed) {
    return (
      <div className="screen screen-adaptive flex flex-col bg-[#F0F4F2] text-foreground">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: BRAND_GREEN }}
          >
            {APP_NAME} · Ops
          </p>
          <h1 className="mt-2 text-[28px] font-extrabold tracking-tight" style={{ color: BRAND_GREEN }}>
            Консоль владельца
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
            Комиссии, промо, гео для маркетинга и входящие просьбы о помощи — без тяжёлой CRM.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (attemptOpsLogin(user, password)) {
                setLoginError(null);
                setPassword("");
                setAuthed(true);
                refresh();
              } else {
                setLoginError("Неверный логин или пароль.");
              }
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Логин
              </span>
              <input
                autoComplete="username"
                className="w-full rounded-xl border bg-white px-3 py-3 text-[15px] outline-none focus:border-[var(--primary)]"
                style={{ borderColor: BORDER }}
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Пароль
              </span>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border bg-white px-3 py-3 text-[15px] outline-none focus:border-[var(--primary)]"
                style={{ borderColor: BORDER }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {loginError ? (
              <p className="text-[13px] font-medium text-red-700">{loginError}</p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              Войти
            </button>
          </form>

          <button
            type="button"
            onClick={onExitToApp}
            className="mt-6 text-[13px] font-semibold underline"
            style={{ color: MUTED }}
          >
            Вернуться в приложение
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-adaptive flex flex-col bg-[#F0F4F2] text-foreground">
      <header className="shrink-0 border-b bg-white px-4 py-3" style={{ borderColor: BORDER }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND_GREEN }}>
              {APP_NAME} Ops
            </p>
            <h1 className="mt-1 text-[20px] font-extrabold" style={{ color: BRAND_GREEN }}>
              Консоль владельца
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-1.5 text-[12px] font-semibold"
              style={{ borderColor: BORDER, color: MUTED }}
              onClick={() => {
                opsLogout();
                setAuthed(false);
              }}
            >
              Выйти
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ backgroundColor: BRAND_GREEN }}
              onClick={onExitToApp}
            >
              В приложение
            </button>
          </div>
        </div>
        {savedFlash ? (
          <p
            className="mt-2 rounded-lg px-3 py-2 text-[13px] font-bold text-white"
            style={{ backgroundColor: BRAND_GREEN }}
            role="status"
          >
            {savedFlash}
          </p>
        ) : null}
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-5 pb-16">
        {/* Inbox */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Входящие"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
                Запросы о помощи и отзывы
                {newCount > 0 ? (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                    style={{ backgroundColor: BRAND_AMBER, color: "#1a1a1a" }}
                  >
                    {newCount} новых
                  </span>
                ) : null}
              </h2>
              <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
                Из приложения: Ещё → «Помощь и отзыв». Письма также на {SUPPORT_EMAIL}.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-semibold"
              style={{ borderColor: BORDER }}
              onClick={() => void refreshInbox()}
              disabled={inboxLoading}
            >
              {inboxLoading ? "…" : "Обновить"}
            </button>
          </div>
          {inboxWarning ? (
            <p className="mt-2 text-[11px] leading-relaxed" style={{ color: MUTED }}>
              {inboxWarning}
            </p>
          ) : null}
          <ul className="mt-3 space-y-2">
            {inbox.length === 0 ? (
              <li className="rounded-xl border px-3 py-3 text-[13px]" style={{ borderColor: BORDER, color: MUTED }}>
                Пока пусто — как только кто-то напишет из приложения, заявка появится здесь.
              </li>
            ) : (
              inbox.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border px-3 py-3"
                  style={{
                    borderColor: row.status === "new" ? `${BRAND_GREEN}66` : BORDER,
                    background: row.status === "new" ? "rgba(13,92,58,0.04)" : "#fff",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                    <span>{kindLabel(row.kind)}</span>
                    <span>·</span>
                    <span>{statusLabel(row.status)}</span>
                    <span>·</span>
                    <span>{new Date(row.createdAt).toLocaleString()}</span>
                    {row.source === "remote" ? <span>· облако</span> : <span>· локально</span>}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
                    {row.message}
                  </p>
                  {(row.contactEmail || row.userEmail) && (
                    <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
                      Контакт: {row.contactEmail || row.userEmail}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {row.status !== "seen" ? (
                      <button
                        type="button"
                        className="rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                        style={{ borderColor: BORDER }}
                        onClick={() => void setFeedbackStatus(row, "seen")}
                      >
                        Просмотрено
                      </button>
                    ) : null}
                    {row.status !== "done" ? (
                      <button
                        type="button"
                        className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
                        style={{ backgroundColor: BRAND_GREEN }}
                        onClick={() => void setFeedbackStatus(row, "done")}
                      >
                        Закрыть
                      </button>
                    ) : null}
                    {row.status === "done" ? (
                      <button
                        type="button"
                        className="rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                        style={{ borderColor: BORDER }}
                        onClick={() => void setFeedbackStatus(row, "new")}
                      >
                        Вернуть в новые
                      </button>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Pulse */}
        <section aria-label="Пульс">
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Пульс (этот браузер)
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Локальные демо-данные, пока нет полного бэкенд-админа. Комиссии ниже уже влияют на расчёт здесь.
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Объявления", String(pulse.listingsTotal)],
              ["В эфире", String(pulse.listingsActive)],
              ["Брони", String(pulse.bookingsTotal)],
              ["Ожидают", String(pulse.bookingsPending)],
              ["Сейчас вне", String(pulse.bookingsActive)],
              ["Завершено", String(pulse.bookingsCompleted)],
              ["Собрано комиссий", `$${pulse.serviceFeesCapturedUsd.toFixed(2)}`],
              ["Кластер", `${pulse.clusterRadiusMi} mi`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border bg-white px-3 py-2.5"
                style={{ borderColor: BORDER }}
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                  {label}
                </dt>
                <dd className="mt-0.5 text-[18px] font-extrabold" style={{ color: BRAND_GREEN }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="mt-3 flex flex-wrap gap-2 text-[12px]">
            <StatusChip ok={pulse.supabaseConfigured} label="Supabase" />
            <StatusChip ok={pulse.stripeConfigured} label="Stripe" />
            <StatusChip ok={pulse.agentKeyConfigured} label="Agent key" />
            <StatusChip
              ok={pulse.indexableCities > 0}
              label={`${pulse.indexableCities}/${pulse.citiesTotal} городов в индексе`}
            />
          </ul>
        </section>

        {/* Marketing locations */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Маркетинг-локации"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Маркетинг: город / район
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Когда запускаете FB/TikTok в новом месте — добавьте сюда город или район. Сохранится ссылка-шаблон
            на лендинг аренды.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Город / место
              </span>
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                placeholder="например Kladno или Vinohrady"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Район (необязательно)
              </span>
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={locDistrict}
                onChange={(e) => setLocDistrict(e.target.value)}
                placeholder="район / микрорайон"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Страна
              </span>
              <select
                className="w-full rounded-xl border px-3 py-2.5 text-[15px] bg-white"
                style={{ borderColor: BORDER }}
                value={locCountry}
                onChange={(e) => setLocCountry(e.target.value)}
              >
                {["CZ", "SK", "PL", "US", "DE", "AT"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Заметка к кампании
              </span>
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={locNotes}
                onChange={(e) => setLocNotes(e.target.value)}
                placeholder="FB ads · сын-блогер · запуск"
              />
            </label>
          </div>
          <button
            type="button"
            className="mt-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
            style={{ backgroundColor: BRAND_GREEN }}
            onClick={addMarketingLocation}
          >
            Добавить локацию
          </button>

          <ul className="mt-4 space-y-2">
            {settings.marketingLocations.length === 0 ? (
              <li className="text-[13px]" style={{ color: MUTED }}>
                Пока нет своих локаций — добавьте первый город кампании.
              </li>
            ) : (
              settings.marketingLocations.map((row) => {
                const slug = slugifyMarketingLocation(row.name, row.district);
                const sampleUrl = `${SEO_ORIGIN}/rent/tools-and-diy/${slug || "city"}`;
                return (
                  <li
                    key={row.id}
                    className="rounded-xl border px-3 py-3"
                    style={{ borderColor: BORDER }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold" style={{ color: BRAND_GREEN }}>
                          {row.name}
                          {row.district ? ` · ${row.district}` : ""}{" "}
                          <span className="font-semibold text-gray-400">({row.country})</span>
                        </p>
                        {row.notes ? (
                          <p className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
                            {row.notes}
                          </p>
                        ) : null}
                        <a
                          href={sampleUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-[12px] font-semibold underline"
                          style={{ color: BRAND_GREEN }}
                        >
                          {sampleUrl}
                        </a>
                        <p className="mt-1 text-[11px]" style={{ color: MUTED }}>
                          Шаблон URL. Чтобы страница была в sitemap как канонический город — добавьте slug в
                          код SEO_LOCATIONS (или напишите агенту).
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold text-red-700"
                        style={{ borderColor: "#FECACA" }}
                        onClick={() =>
                          persist(
                            {
                              marketingLocations: settings.marketingLocations.filter(
                                (x) => x.id !== row.id,
                              ),
                            },
                            "Локация удалена",
                          )
                        }
                      >
                        Удалить
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        {/* Fees */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Комиссии"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Комиссии платформы
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Сейчас аренда: <strong>{pctLabel(pulse.rentalFeeRate)}</strong>
            {pulse.promoActive ? " (промо)" : ""} · Продажа:{" "}
            <strong>{pctLabel(pulse.sellFeeRate)}</strong>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Комиссия за аренду %
              </span>
              <input
                inputMode="decimal"
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={rentalFeeInput}
                onChange={(e) => setRentalFeeInput(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Комиссия за продажу %
              </span>
              <input
                inputMode="decimal"
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={sellFeeInput}
                onChange={(e) => setSellFeeInput(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            className="mt-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
            style={{ backgroundColor: BRAND_GREEN }}
            onClick={() => {
              const rentalFeeRate = rateFromPercentInput(rentalFeeInput, settings.rentalFeeRate);
              const sellFeeRate = rateFromPercentInput(sellFeeInput, settings.sellFeeRate);
              const next = persist({ rentalFeeRate, sellFeeRate }, "Комиссии сохранены");
              setRentalFeeInput(percentInputValue(next.rentalFeeRate));
              setSellFeeInput(percentInputValue(next.sellFeeRate));
            }}
          >
            Сохранить комиссии
          </button>
        </section>

        {/* Promos */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Промо"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Промо
          </h2>
          <label className="mt-3 flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={settings.foundingPromoEnabled}
              onChange={(e) =>
                persist({ foundingPromoEnabled: e.target.checked }, "Флаг промо обновлён")
              }
            />
            Промо «первый хост в районе» включено
          </label>
          <p className="mt-2 text-[12px]" style={{ color: MUTED }}>
            Уже показано в этом браузере: {isFoundingHostPromoSeen() ? "да" : "нет"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-[12px] font-semibold"
              style={{ borderColor: BORDER }}
              onClick={() => {
                clearFoundingHostPromoSeen();
                setPulse(computeOpsPulse());
                flash("Промо сброшено — покажется снова");
              }}
            >
              Сбросить «уже видел»
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-[12px] font-semibold"
              style={{ borderColor: BORDER }}
              onClick={() => {
                markFoundingHostPromoSeen();
                setPulse(computeOpsPulse());
                flash("Отмечено как просмотренное");
              }}
            >
              Отметить как видел
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Промо-комиссия аренды % (опционально)
              </span>
              <input
                inputMode="decimal"
                placeholder="напр. 8 — пусто = сброс"
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={
                  promoPercent !== ""
                    ? promoPercent
                    : settings.promoRentalFeeRate === null
                      ? ""
                      : percentInputValue(settings.promoRentalFeeRate)
                }
                onChange={(e) => setPromoPercent(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Название промо
              </span>
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={settings.promoLabel}
                onChange={(e) => setSettings((s) => ({ ...s, promoLabel: e.target.value }))}
                placeholder="Неделя запуска"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-[13px] font-bold"
              style={{ backgroundColor: BRAND_AMBER, color: "#1a1a1a" }}
              onClick={() => {
                const raw = promoPercent.trim();
                const promoRentalFeeRate =
                  raw === "" ? null : rateFromPercentInput(raw, settings.rentalFeeRate);
                persist(
                  { promoRentalFeeRate, promoLabel: settings.promoLabel },
                  "Промо-комиссия обновлена",
                );
                setPromoPercent("");
              }}
            >
              Применить промо
            </button>
            <button
              type="button"
              className="rounded-xl border px-4 py-2.5 text-[13px] font-semibold"
              style={{ borderColor: BORDER }}
              onClick={() => {
                persist({ promoRentalFeeRate: null, promoLabel: "" }, "Промо снято");
                setPromoPercent("");
              }}
            >
              Снять промо
            </button>
          </div>
        </section>

        {/* Geo built-in */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Гео SEO"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Гео SEO-городов
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Клик — вкл/выкл index. Shift+клик — фокус запуска (янтарная линия). Sitemap меняется только после
            деплоя кода.
          </p>

          <label className="mt-3 block space-y-1">
            <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
              Радиус поиска по умолчанию (мили)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                inputMode="numeric"
                className="w-28 rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={clusterInput}
                onChange={(e) => setClusterInput(e.target.value)}
              />
              <button
                type="button"
                className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
                style={{ backgroundColor: BRAND_GREEN }}
                onClick={() => {
                  const clusterDefaultMi = Math.min(
                    100,
                    Math.max(5, Number.parseInt(clusterInput || "25", 10) || 25),
                  );
                  persist({ clusterDefaultMi }, "Радиус сохранён");
                  setClusterInput(String(clusterDefaultMi));
                  setClusterRadiusMi(clusterDefaultMi);
                  setPulse(computeOpsPulse());
                }}
              >
                Сохранить и применить
              </button>
            </div>
          </label>

          <div className="mt-4 space-y-3">
            {citiesByCountry.map(([country, cities]) => (
              <div key={country}>
                <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: MUTED }}>
                  {country}
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {cities.map((city) => {
                    const live = isOpsLocationIndexable(city.slug, city.indexable);
                    const focused = settings.geoFocusSlugs.includes(city.slug);
                    return (
                      <li key={city.slug}>
                        <button
                          type="button"
                          className="rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold"
                          style={{
                            borderColor: live ? `${BRAND_GREEN}66` : BORDER,
                            background: live ? "rgba(13,92,58,0.08)" : "#fff",
                            color: live ? BRAND_GREEN : MUTED,
                            boxShadow: focused ? `inset 0 -2px 0 ${BRAND_AMBER}` : undefined,
                          }}
                          onClick={(e) => {
                            if (e.shiftKey) {
                              const next = focused
                                ? settings.geoFocusSlugs.filter((s) => s !== city.slug)
                                : [...settings.geoFocusSlugs, city.slug];
                              persist(
                                { geoFocusSlugs: next },
                                focused ? "Фокус снят" : "Фокус добавлен",
                              );
                              return;
                            }
                            const next = {
                              ...settings.indexableOverrides,
                              [city.slug]: !live,
                            };
                            persist(
                              { indexableOverrides: next },
                              `${formatSeoLocationLabel(city)} → ${!live ? "index" : "noindex"}`,
                            );
                          }}
                        >
                          {formatSeoLocationLabel(city)}
                          {live ? "" : " · выкл"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Заметки"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Блокнот
          </h2>
          <textarea
            className="mt-2 min-h-[120px] w-full rounded-xl border px-3 py-2.5 text-[14px] leading-relaxed"
            style={{ borderColor: BORDER }}
            value={settings.ownerNotes}
            onChange={(e) => setSettings((s) => ({ ...s, ownerNotes: e.target.value }))}
            placeholder="Идеи FB/TikTok, эксперименты с комиссией, заметки по CZ/SK…"
          />
          <button
            type="button"
            className="mt-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
            style={{ backgroundColor: BRAND_GREEN }}
            onClick={() => persist({ ownerNotes: settings.ownerNotes }, "Заметки сохранены")}
          >
            Сохранить заметки
          </button>
        </section>

        <section className="pb-4 text-[12px]" style={{ color: MUTED }}>
          <p>
            Вход: <code className="rounded bg-white px-1">/ops</code>
          </p>
          <p className="mt-1">
            Пароль можно сменить через <code className="rounded bg-white px-1">VITE_OPS_USER</code> /{" "}
            <code className="rounded bg-white px-1">VITE_OPS_PASSWORD</code> в Vercel.
          </p>
          <button
            type="button"
            className="mt-3 text-[12px] font-semibold underline"
            onClick={() => {
              if (window.confirm("Сбросить все настройки ops к значениям по умолчанию?")) {
                setSettings(resetOpsSettings());
                setPulse(computeOpsPulse());
                flash("Настройки ops сброшены");
              }
            }}
          >
            Сбросить настройки ops
          </button>
          {settings.updatedAt ? (
            <p className="mt-2">Последнее сохранение: {new Date(settings.updatedAt).toLocaleString()}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function StatusChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className="rounded-full px-2.5 py-1 font-semibold"
      style={{
        background: ok ? "rgba(13,92,58,0.1)" : "rgba(185,28,28,0.08)",
        color: ok ? BRAND_GREEN : "#B91C1C",
      }}
    >
      {ok ? "●" : "○"} {label}
    </li>
  );
}

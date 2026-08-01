import { useEffect, useMemo, useState } from "react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";
import {
  attemptOpsLogin,
  isOpsSessionActive,
  opsLogout,
} from "../../lib/ops/opsAuth";
import {
  isOpsLocationIndexable,
  loadOpsSettings,
  OPS_SETTINGS_CHANGED_EVENT,
  resetOpsSettings,
  saveOpsSettings,
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

  const refresh = () => {
    const next = loadOpsSettings();
    setSettings(next);
    setRentalFeeInput(percentInputValue(next.rentalFeeRate));
    setSellFeeInput(percentInputValue(next.sellFeeRate));
    setClusterInput(String(next.clusterDefaultMi));
    setPulse(computeOpsPulse());
  };

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener(OPS_SETTINGS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(OPS_SETTINGS_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!authed) return;
    document.title = `${APP_NAME} Ops`;
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

  const persist = (patch: Partial<OpsSettings>, msg = "Saved"): OpsSettings => {
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
            Owner console
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
            Fee %, promos, and geo signals — light controls, not a CRM.
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
                setLoginError("Wrong login or password.");
              }
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Login
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
                Password
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
              Enter console
            </button>
          </form>

          <button
            type="button"
            onClick={onExitToApp}
            className="mt-6 text-[13px] font-semibold underline"
            style={{ color: MUTED }}
          >
            Back to app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-adaptive flex flex-col bg-[#F0F4F2] text-foreground">
      <header
        className="shrink-0 border-b bg-white px-4 py-3"
        style={{ borderColor: BORDER }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND_GREEN }}>
              {APP_NAME} Ops
            </p>
            <h1 className="mt-1 text-[20px] font-extrabold" style={{ color: BRAND_GREEN }}>
              Owner console
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
              Log out
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ backgroundColor: BRAND_GREEN }}
              onClick={onExitToApp}
            >
              App
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
        {/* Pulse */}
        <section aria-label="Pulse">
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Pulse (this browser)
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Local demo data until backend admin lands. Fees below still apply to checkout math here.
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Listings", String(pulse.listingsTotal)],
              ["Live", String(pulse.listingsActive)],
              ["Bookings", String(pulse.bookingsTotal)],
              ["Pending", String(pulse.bookingsPending)],
              ["Out now", String(pulse.bookingsActive)],
              ["Done", String(pulse.bookingsCompleted)],
              ["Fees captured", `$${pulse.serviceFeesCapturedUsd.toFixed(2)}`],
              ["Cluster", `${pulse.clusterRadiusMi} mi`],
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
              label={`${pulse.indexableCities}/${pulse.citiesTotal} cities indexable`}
            />
          </ul>
        </section>

        {/* Fees */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Platform fees"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Platform fees
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Effective rental fee now: <strong>{pctLabel(pulse.rentalFeeRate)}</strong>
            {pulse.promoActive ? " (promo)" : ""} · Sell fee:{" "}
            <strong>{pctLabel(pulse.sellFeeRate)}</strong>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Rental fee %
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
                Sell fee %
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
              const next = persist({ rentalFeeRate, sellFeeRate }, "Fees saved");
              setRentalFeeInput(percentInputValue(next.rentalFeeRate));
              setSellFeeInput(percentInputValue(next.sellFeeRate));
            }}
          >
            Save fees
          </button>
        </section>

        {/* Promos */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Promos"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Promos
          </h2>
          <label className="mt-3 flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={settings.foundingPromoEnabled}
              onChange={(e) => persist({ foundingPromoEnabled: e.target.checked }, "Promo flag updated")}
            />
            Founding-host promo enabled
          </label>
          <p className="mt-2 text-[12px]" style={{ color: MUTED }}>
            Seen in this browser: {isFoundingHostPromoSeen() ? "yes" : "no"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-[12px] font-semibold"
              style={{ borderColor: BORDER }}
              onClick={() => {
                clearFoundingHostPromoSeen();
                setPulse(computeOpsPulse());
                flash("Founding promo reset — will show again");
              }}
            >
              Reset “seen”
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-[12px] font-semibold"
              style={{ borderColor: BORDER }}
              onClick={() => {
                markFoundingHostPromoSeen();
                setPulse(computeOpsPulse());
                flash("Marked founding promo as seen");
              }}
            >
              Mark seen
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
                Promo rental fee % (optional)
              </span>
              <input
                inputMode="decimal"
                placeholder="e.g. 8 — leave empty to clear"
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
                Promo label
              </span>
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
                style={{ borderColor: BORDER }}
                value={settings.promoLabel}
                onChange={(e) => setSettings((s) => ({ ...s, promoLabel: e.target.value }))}
                placeholder="Launch week"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
              style={{ backgroundColor: BRAND_AMBER, color: "#1a1a1a" }}
              onClick={() => {
                const raw = promoPercent.trim();
                const promoRentalFeeRate =
                  raw === "" ? null : rateFromPercentInput(raw, settings.rentalFeeRate);
                persist({ promoRentalFeeRate, promoLabel: settings.promoLabel }, "Promo fee updated");
                setPromoPercent("");
              }}
            >
              Apply promo fee
            </button>
            <button
              type="button"
              className="rounded-xl border px-4 py-2.5 text-[13px] font-semibold"
              style={{ borderColor: BORDER }}
              onClick={() => {
                persist({ promoRentalFeeRate: null, promoLabel: "" }, "Promo cleared");
                setPromoPercent("");
              }}
            >
              Clear promo
            </button>
          </div>
        </section>

        {/* Geo */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Geo signals"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Geo signals
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Index toggles change robots on rent pages in this app. Sitemap still needs a deploy to
            match crawl lists.
          </p>

          <label className="mt-3 block space-y-1">
            <span className="text-[12px] font-semibold" style={{ color: MUTED }}>
              Default browse radius (mi)
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
                  persist({ clusterDefaultMi }, "Cluster default saved");
                  setClusterInput(String(clusterDefaultMi));
                  setClusterRadiusMi(clusterDefaultMi);
                  setPulse(computeOpsPulse());
                }}
              >
                Save & apply
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
                          title={
                            focused
                              ? "Focus city · click to toggle index"
                              : "Click to toggle indexable"
                          }
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
                              persist({ geoFocusSlugs: next }, focused ? "Focus removed" : "Focus added");
                              return;
                            }
                            const next = {
                              ...settings.indexableOverrides,
                              [city.slug]: !live,
                            };
                            persist({ indexableOverrides: next }, `${formatSeoLocationLabel(city)} → ${!live ? "index" : "noindex"}`);
                          }}
                        >
                          {formatSeoLocationLabel(city)}
                          {live ? "" : " · off"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px]" style={{ color: MUTED }}>
            Click = toggle index · Shift+click = launch focus (amber underline)
          </p>
        </section>

        {/* Notes */}
        <section
          className="rounded-2xl border bg-white px-4 py-4"
          style={{ borderColor: BORDER }}
          aria-label="Owner notes"
        >
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Scratch pad
          </h2>
          <textarea
            className="mt-2 min-h-[120px] w-full rounded-xl border px-3 py-2.5 text-[14px] leading-relaxed"
            style={{ borderColor: BORDER }}
            value={settings.ownerNotes}
            onChange={(e) => setSettings((s) => ({ ...s, ownerNotes: e.target.value }))}
            placeholder="FB/TikTok ideas, fee experiments, CZ/SK launch notes…"
          />
          <button
            type="button"
            className="mt-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
            style={{ backgroundColor: BRAND_GREEN }}
            onClick={() => persist({ ownerNotes: settings.ownerNotes }, "Notes saved")}
          >
            Save notes
          </button>
        </section>

        <section className="pb-4 text-[12px]" style={{ color: MUTED }}>
          <p>
            Entry: <code className="rounded bg-white px-1">/ops</code> or{" "}
            <code className="rounded bg-white px-1">?screen=ops</code>
          </p>
          <p className="mt-1">
            Override login via <code className="rounded bg-white px-1">VITE_OPS_USER</code> /{" "}
            <code className="rounded bg-white px-1">VITE_OPS_PASSWORD</code>.
          </p>
          <button
            type="button"
            className="mt-3 text-[12px] font-semibold underline"
            onClick={() => {
              if (window.confirm("Reset all ops settings to defaults?")) {
                setSettings(resetOpsSettings());
                setPulse(computeOpsPulse());
                flash("Ops settings reset");
              }
            }}
          >
            Reset ops settings
          </button>
          {settings.updatedAt ? (
            <p className="mt-2">Last saved: {new Date(settings.updatedAt).toLocaleString()}</p>
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

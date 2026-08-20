import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";

const PLATFORM_PROFILE_URL = "https://dashboard.stripe.com/settings/connect/platform-profile";

/** Detect Stripe platform-profile / loss-responsibility blockers. */
export function isConnectPlatformSetupError(message: string | null | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("responsibilities") ||
    lower.includes("managing losses") ||
    lower.includes("platform-profile") ||
    lower.includes("platform profile") ||
    lower.includes("platform_profile") ||
    lower.includes("platform_config") ||
    lower.includes("destination charges") ||
    lower.includes("signed up for connect") ||
    (lower.includes("connect") && lower.includes("not enabled")) ||
    (lower.includes("dashboard.stripe.com") && lower.includes("connect"))
  );
}

export function extractStripeDashboardUrl(message: string): string | null {
  const match = message.match(/https:\/\/dashboard\.stripe\.com\/[^\s)"']+/i);
  if (!match?.[0]) return null;
  const raw = match[0].replace(/[.,;]+$/, "");
  if (raw.includes("platform") || raw.includes("connect/pla")) {
    return PLATFORM_PROFILE_URL;
  }
  return raw;
}

function isKeyConfigError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("api key problem") ||
    lower.includes("invalid api key") ||
    (lower.includes("test vs live") && lower.includes("stripe")) ||
    lower.includes("key_mismatch") ||
    lower.includes("key mode mismatch")
  );
}

function isSafeUserFacingConnectMessage(message: string): boolean {
  if (/stripe_secret|sk_live_|sk_test_|whsec_|vercel|supabase_service/i.test(message)) {
    return false;
  }
  return (
    /phone|sign in|payout|stripe|bank|connect|try again|email|unavailable|configured|country|network|fetch|failed|dashboard|account|onboarding|retry|support|api key|test vs live|already/i.test(
      message,
    )
  );
}

function sanitizeConnectMessage(message: string, fallback: string): string {
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  if (!isSafeUserFacingConnectMessage(trimmed)) return fallback;
  if (trimmed.length <= 320) return trimmed;
  return `${trimmed.slice(0, 317).trimEnd()}…`;
}

type Props = {
  message: string;
  code?: string | null;
};

export function ConnectSetupError({ message, code }: Props) {
  const copy = useMessages().paymentsUi;
  const isPlatform =
    code === "platform_profile" ||
    code === "platform_config" ||
    isConnectPlatformSetupError(message);
  const dashUrl = extractStripeDashboardUrl(message) ?? (isPlatform ? PLATFORM_PROFILE_URL : null);

  if (code === "already_connected") {
    return (
      <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
        {sanitizeConnectMessage(message, "Payouts already enabled — refresh status or Go live.")}
      </p>
    );
  }

  if (isPlatform) {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-bold text-red-900">{copy.connectPlatformTitle}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-red-800">{copy.connectPlatformBody}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-red-800">
          <li>{copy.connectPlatformStep1}</li>
          <li>{copy.connectPlatformStep2}</li>
          <li>{copy.connectPlatformStep3}</li>
        </ol>
        {dashUrl ? (
          <a
            href={dashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {copy.connectOpenDashboard}
          </a>
        ) : null}
      </div>
    );
  }

  if (isKeyConfigError(message) || code === "key_mismatch") {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-bold text-red-900">Stripe keys need a check</p>
        <p className="mt-1.5 text-xs leading-relaxed text-red-800">
          {sanitizeConnectMessage(message, copy.connectGenericError)}
        </p>
      </div>
    );
  }

  // Generic: show the real reason only — do NOT pretend every failure is platform responsibilities.
  return (
    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
      {sanitizeConnectMessage(message, copy.connectGenericError)}
    </p>
  );
}

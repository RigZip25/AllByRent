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
    (lower.includes("dashboard.stripe.com") && lower.includes("connect"))
  );
}

export function extractStripeDashboardUrl(message: string): string | null {
  const match = message.match(/https:\/\/dashboard\.stripe\.com\/[^\s)"']+/i);
  if (!match?.[0]) return null;
  // Stripe sometimes truncates the path in error text — normalize known case.
  const raw = match[0].replace(/[.,;]+$/, "");
  if (raw.includes("platform") || raw.includes("connect/pla")) {
    return PLATFORM_PROFILE_URL;
  }
  return raw;
}

export function ConnectSetupError({ message }: { message: string }) {
  const copy = useMessages().paymentsUi;
  const isPlatform = isConnectPlatformSetupError(message);
  const dashUrl = extractStripeDashboardUrl(message) ?? (isPlatform ? PLATFORM_PROFILE_URL : null);

  if (!isPlatform) {
    return (
      <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
        {copy.connectGenericError}
      </p>
    );
  }

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

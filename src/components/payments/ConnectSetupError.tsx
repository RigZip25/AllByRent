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
  const isPlatform = isConnectPlatformSetupError(message);
  const dashUrl = extractStripeDashboardUrl(message) ?? (isPlatform ? PLATFORM_PROFILE_URL : null);

  if (!isPlatform) {
    return (
      <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800">
        {message}
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm font-bold text-red-900">Stripe platform setup required (one-time)</p>
      <p className="mt-1.5 text-xs leading-relaxed text-red-800">
        Your Evorios Stripe account must accept Connect responsibilities before sellers can link a
        bank. This is done in the Stripe Dashboard — not inside the app.
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-red-800">
        <li>Open Platform profile in Stripe</li>
        <li>Review / accept loss responsibilities for connected accounts</li>
        <li>Return here and tap Continue with Stripe again</li>
      </ol>
      {dashUrl ? (
        <a
          href={dashUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Open Stripe Dashboard →
        </a>
      ) : null}
      <p className="mt-2 break-all text-[10px] text-red-600/80">{message}</p>
    </div>
  );
}

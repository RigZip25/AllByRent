import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import { useRequireAuth } from "../hooks/RequireAuth";
import { mascotSays } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import { startIdentityVerificationForListing } from "../lib/sellerGoPublic";
import { SignInPrompt } from "../components/SignInPrompt";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function IdentityVerificationScreen({ onBack }: { onBack: () => void }) {
  const auth = useAuth();
  const requireAuth = useRequireAuth();
  const { common, profileDeep } = useMessages();
  const t = profileDeep.identity;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="screen flex flex-col bg-[#F0F4F2]">
      <header
        className="shrink-0 border-b bg-white px-4 pb-3 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]"
        style={{ borderColor: BORDER }}
      >
        <button type="button" onClick={onBack} className="text-[15px] font-semibold text-gray-600">
          {common.back}
        </button>
        <h1 className="mt-2 text-xl font-extrabold" style={{ color: GREEN }}>
          {t.title}
        </h1>
        <p className="mt-1 text-[15px] text-gray-600">{mascotSays(t.subtitle)}</p>
      </header>

      <div className="screen-scroll flex-1 p-4">
        <div className="mx-auto max-w-[390px] rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0FDF4]">
              <ShieldCheck className="h-5 w-5" style={{ color: GREEN }} />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-gray-900">{t.verifyOnceTitle}</p>
              <p className="mt-1 text-[15px] text-gray-600">{t.verifyOnceBody}</p>
            </div>
          </div>

          {error ? (
            <p className="mt-3 rounded-2xl border bg-[#FEF2F2] p-3 text-[14px] text-red-700" style={{ borderColor: "#FECACA" }}>
              {error}
            </p>
          ) : null}

          {!auth.userId ? (
            <div className="mt-4">
              <SignInPrompt message={t.signInHint} intent="list" />
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (!requireAuth("list")) return;
                setBusy(true);
                setError(null);
                void startIdentityVerificationForListing("/?screen=profile")
                  .then((result) => {
                    if (!result.ok) {
                      throw new Error(result.reason);
                    }
                    window.location.href = result.url;
                  })
                  .catch((e) => {
                    setError(e instanceof Error ? e.message : t.failed);
                  })
                  .finally(() => setBusy(false));
              }}
              className="mt-4 w-full rounded-2xl px-4 py-3.5 text-base font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy ? t.starting : t.startCta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import { mascotSays } from "../lib/brand";
import { startIdentityVerificationForListing } from "../lib/sellerGoPublic";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function IdentityVerificationScreen({ onBack }: { onBack: () => void }) {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="screen flex flex-col bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 py-3" style={{ borderColor: BORDER }}>
        <button type="button" onClick={onBack} className="text-sm font-semibold text-gray-600">
          Back
        </button>
        <h1 className="mt-2 text-[18px] font-extrabold" style={{ color: GREEN }}>
          Identity verification
        </h1>
        <p className="mt-1 text-[13px] text-gray-500">
          {mascotSays("One quick step before you go live.")}
        </p>
      </header>

      <div className="screen-scroll flex-1 p-4">
        <div className="mx-auto max-w-[390px] rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0FDF4]">
              <ShieldCheck className="h-5 w-5" style={{ color: GREEN }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Verify once</p>
              <p className="mt-1 text-[13px] text-gray-500">
                Required before your listing goes public — also available from the Go public checklist.
              </p>
            </div>
          </div>

          {error ? (
            <p className="mt-3 rounded-2xl border bg-[#FEF2F2] p-3 text-[12px] text-red-700" style={{ borderColor: "#FECACA" }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            disabled={!auth.userId || busy}
            onClick={() => {
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
                  setError(e instanceof Error ? e.message : "Verification failed.");
                })
                .finally(() => setBusy(false));
            }}
            className="mt-4 w-full rounded-2xl px-4 py-3 text-[14px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {busy ? "Starting…" : "Start verification"}
          </button>
        </div>
      </div>
    </div>
  );
}


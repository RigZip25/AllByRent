import { BRAND_GREEN } from "../../lib/brand";

export function OfflineScreen() {
  return (
    <div className="screen mx-auto flex h-full w-full max-w-[390px] flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-4xl" aria-hidden>
        📡
      </p>
      <h1 className="mt-4 text-xl font-bold" style={{ color: BRAND_GREEN }}>
        You&apos;re offline
      </h1>
      <p className="mt-2 text-base text-gray-500">
        AllByRent needs a connection. Check Wi‑Fi or mobile data and try again.
      </p>
    </div>
  );
}

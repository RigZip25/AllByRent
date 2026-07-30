import { useState } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import {
  loadNotificationPreferences,
  patchNotificationPreferences,
  type NotificationPreferences,
} from "../../lib/notificationPreferences";
import { syncAgentPrefsRemote } from "../../lib/agentPrefs";
import { loadGarageFollows } from "../../lib/garageFollowStorage";
import { persistFollowPatch } from "../../lib/repositories/garageRepository";
import { MASCOT_NAME } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";

const BORDER = "#E8E6E0";

function PrefToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-gray-900">{label}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-gray-500">{hint}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[#0D5C3A]"
      />
    </label>
  );
}

export function NotificationPreferencesPanel() {
  const auth = useAuth();
  const { prefs: p } = useMessages().notifications;
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadNotificationPreferences());
  const follows = loadGarageFollows();

  const update = (patch: Partial<NotificationPreferences>) => {
    const next = patchNotificationPreferences(patch);
    setPrefs(next);
    if (auth.userId) void syncAgentPrefsRemote(auth.userId);
  };

  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <p className="text-sm font-semibold text-gray-900">{p.title}</p>
      <p className="mt-0.5 text-xs text-gray-500">{p.hint}</p>

      <div className="mt-3 divide-y" style={{ borderColor: BORDER }}>
        <PrefToggle
          label={p.bookings}
          hint={p.bookingsHint}
          checked={prefs.bookings}
          onChange={(bookings) => update({ bookings })}
        />
        <PrefToggle
          label={p.messages}
          hint={p.messagesHint}
          checked={prefs.messages}
          onChange={(messages) => update({ messages })}
        />
        <PrefToggle
          label={p.newGaragesNearby}
          hint={p.newGaragesNearbyHint}
          checked={prefs.newGaragesNearby}
          onChange={(newGaragesNearby) => update({ newGaragesNearby })}
        />
        <PrefToggle
          label={p.openGarageDays}
          hint={p.openGarageDaysHint}
          checked={prefs.openHouseEvents}
          onChange={(openHouseEvents) => update({ openHouseEvents })}
        />
        <PrefToggle
          label={p.savedListings}
          hint={p.savedListingsHint}
          checked={prefs.listingUpdates}
          onChange={(listingUpdates) => update({ listingUpdates })}
        />
        <PrefToggle
          label={p.agentTips(MASCOT_NAME)}
          hint={p.agentTipsHint}
          checked={prefs.agentTips}
          onChange={(agentTips) => update({ agentTips })}
        />
      </div>

      {follows.length > 0 ? (
        <div className="mt-4 border-t pt-3" style={{ borderColor: BORDER }}>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {p.garagesYouFollow}
          </p>
          <ul className="mt-2 space-y-2">
            {follows.slice(0, 5).map((f) => (
              <li key={f.hostId} className="rounded-xl bg-[#F9FAFB] px-3 py-2">
                <p className="text-[13px] font-semibold text-gray-800">{f.displayName}</p>
                <label className="mt-1 flex items-center gap-2 text-[12px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={f.notifyNewListings}
                    onChange={(e) => {
                      if (auth.userId) {
                        void persistFollowPatch(f.hostId, auth.userId, {
                          notifyNewListings: e.target.checked,
                        });
                      }
                      setPrefs(loadNotificationPreferences());
                    }}
                    className="accent-[#0D5C3A]"
                  />
                  {p.newListings}
                </label>
                <label className="mt-1 flex items-center gap-2 text-[12px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={f.notifyOpenHouse}
                    onChange={(e) => {
                      if (auth.userId) {
                        void persistFollowPatch(f.hostId, auth.userId, {
                          notifyOpenHouse: e.target.checked,
                        });
                      }
                      setPrefs(loadNotificationPreferences());
                    }}
                    className="accent-[#0D5C3A]"
                  />
                  {p.openGarageDay}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-snug text-gray-400">{p.pushFooter}</p>
    </div>
  );
}

import { useState } from "react";
import {
  loadNotificationPreferences,
  patchNotificationPreferences,
  type NotificationPreferences,
} from "../../lib/notificationPreferences";
import { loadGarageFollows, updateGarageFollow } from "../../lib/garageFollowStorage";

const GREEN = "#0D5C3A";
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
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadNotificationPreferences());
  const follows = loadGarageFollows();

  const update = (patch: Partial<NotificationPreferences>) => {
    setPrefs(patchNotificationPreferences(patch));
  };

  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <p className="text-sm font-semibold text-gray-900">Notification settings</p>
      <p className="mt-0.5 text-xs text-gray-500">
        Choose what reaches you — push when enabled above, in-app always.
      </p>

      <div className="mt-3 divide-y" style={{ borderColor: BORDER }}>
        <PrefToggle
          label="Booking updates"
          hint="Requests, approvals, pickup and return reminders."
          checked={prefs.bookings}
          onChange={(bookings) => update({ bookings })}
        />
        <PrefToggle
          label="Messages"
          hint="Chat from renters or owners about an item."
          checked={prefs.messages}
          onChange={(messages) => update({ messages })}
        />
        <PrefToggle
          label="New garages nearby"
          hint="When a neighbor opens a garage showcase on your block."
          checked={prefs.newGaragesNearby}
          onChange={(newGaragesNearby) => update({ newGaragesNearby })}
        />
        <PrefToggle
          label="Open garage days"
          hint="Yard-sale style events from garages you follow."
          checked={prefs.openHouseEvents}
          onChange={(openHouseEvents) => update({ openHouseEvents })}
        />
        <PrefToggle
          label="Saved listings"
          hint="Price changes or availability on favorites."
          checked={prefs.listingUpdates}
          onChange={(listingUpdates) => update({ listingUpdates })}
        />
        <PrefToggle
          label={`Tips from Mr. Evorios`}
          hint="Share prompts and next-step nudges after you list."
          checked={prefs.agentTips}
          onChange={(agentTips) => update({ agentTips })}
        />
      </div>

      {follows.length > 0 ? (
        <div className="mt-4 border-t pt-3" style={{ borderColor: BORDER }}>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            Garages you follow
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
                      updateGarageFollow(f.hostId, { notifyNewListings: e.target.checked });
                      setPrefs(loadNotificationPreferences());
                    }}
                    className="accent-[#0D5C3A]"
                  />
                  New listings
                </label>
                <label className="mt-1 flex items-center gap-2 text-[12px] text-gray-600">
                  <input
                    type="checkbox"
                    checked={f.notifyOpenHouse}
                    onChange={(e) => {
                      updateGarageFollow(f.hostId, { notifyOpenHouse: e.target.checked });
                      setPrefs(loadNotificationPreferences());
                    }}
                    className="accent-[#0D5C3A]"
                  />
                  Open garage day
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-snug text-gray-400">
        Server push delivery requires VAPID keys on Vercel. Followers get alerts when hosts publish
        — full fan-out ships with Supabase triggers (see LAUNCH_READINESS.md).
      </p>
    </div>
  );
}

import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import {
  DEFAULT_QUIET_HOURS_END,
  DEFAULT_QUIET_HOURS_START,
  DEFAULT_TIMEZONE,
  detectBrowserTimeZone,
  type QuietHoursConfig,
} from "./quietHours";
import {
  loadNotificationPreferences,
  type NotificationPreferences,
} from "./notificationPreferences";

const TZ_KEY = "allbyrent_user_timezone";
const QUIET_START_KEY = "allbyrent_quiet_hours_start";
const QUIET_END_KEY = "allbyrent_quiet_hours_end";

export type AgentPrefsRemote = {
  pushEnabled?: boolean;
  agentTips?: boolean;
  quietHoursStart?: number;
  quietHoursEnd?: number;
};

export function getStoredTimeZone(): string {
  try {
    const raw = localStorage.getItem(TZ_KEY)?.trim();
    if (raw) return raw;
  } catch {
    /* ignore */
  }
  return detectBrowserTimeZone();
}

export function setStoredTimeZone(timeZone: string): void {
  try {
    localStorage.setItem(TZ_KEY, timeZone.trim() || detectBrowserTimeZone());
  } catch {
    /* ignore */
  }
}

export function getQuietHoursConfig(): QuietHoursConfig {
  let start = DEFAULT_QUIET_HOURS_START;
  let end = DEFAULT_QUIET_HOURS_END;
  try {
    const s = Number.parseInt(localStorage.getItem(QUIET_START_KEY) ?? "", 10);
    const e = Number.parseInt(localStorage.getItem(QUIET_END_KEY) ?? "", 10);
    if (Number.isFinite(s)) start = s;
    if (Number.isFinite(e)) end = e;
  } catch {
    /* ignore */
  }
  return {
    timezone: getStoredTimeZone() || DEFAULT_TIMEZONE,
    startHour: start,
    endHour: end,
  };
}

export function ensureBrowserTimeZoneCaptured(): string {
  const tz = detectBrowserTimeZone();
  setStoredTimeZone(tz);
  return tz;
}

/** Persist timezone + notification prefs to profiles for server-side cron nudges. */
export async function syncAgentPrefsRemote(userId: string | null | undefined): Promise<void> {
  if (!userId || !isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const prefs = loadNotificationPreferences();
  const quiet = getQuietHoursConfig();
  const agentPrefs: AgentPrefsRemote = {
    pushEnabled: prefs.pushEnabled,
    agentTips: prefs.agentTips,
    quietHoursStart: quiet.startHour,
    quietHoursEnd: quiet.endHour,
  };

  await supabase
    .from("profiles")
    .update({
      timezone: quiet.timezone,
      agent_prefs: agentPrefs,
    })
    .eq("id", userId);
}

export function agentTipsEnabled(prefs: NotificationPreferences = loadNotificationPreferences()): boolean {
  return prefs.pushEnabled && prefs.agentTips;
}

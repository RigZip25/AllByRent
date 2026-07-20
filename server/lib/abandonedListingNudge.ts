import type { SupabaseClient } from "@supabase/supabase-js";
import { completeLlmChat } from "./llm/complete";
import { resolveLlmProvider } from "./llm/provider";
import {
  DEFAULT_QUIET_HOURS_END,
  DEFAULT_QUIET_HOURS_START,
  DEFAULT_TIMEZONE,
  isWithinQuietHours,
} from "./quietHours";
import { sendAdminWebPush } from "./webPushAdmin";

const APP_ORIGIN = (process.env.APP_ORIGIN || process.env.VITE_APP_ORIGIN || "https://app.evorios.com").replace(
  /\/$/,
  "",
);

/** Idle before first nudge. */
const IDLE_MS = 2 * 60 * 60 * 1000;
/** Min gap between nudges. */
const NUDGE_GAP_MS = 12 * 60 * 60 * 1000;
const MAX_NUDGES = 3;

type DraftRow = {
  id: string;
  owner_id: string;
  title: string;
  listing_status: string;
  updated_at: string;
  availability: unknown;
};

type ProfileRow = {
  id: string;
  timezone: string | null;
  agent_prefs: Record<string, unknown> | null;
  push_subscriptions: unknown;
};

type AvailabilityMeta = {
  blocked_dates?: unknown;
  paused?: boolean;
  wizard_step?: number;
  nudge_count?: number;
  last_nudged_at?: string | null;
};

function asMeta(availability: unknown): AvailabilityMeta {
  if (!availability || typeof availability !== "object") return {};
  return availability as AvailabilityMeta;
}

function stepLabel(step: number | undefined): string {
  if (step === 1) return "photos";
  if (step === 2) return "details & pricing";
  if (step === 3) return "review & publish";
  return "your listing";
}

function templateCopy(title: string, step: number | undefined, nudgeIndex: number): { title: string; body: string } {
  const item = title.trim() || "your item";
  const where = stepLabel(step);
  if (nudgeIndex <= 1) {
    return {
      title: "Finish stocking your garage?",
      body: `You left ${item} on ${where}. One more push and neighbors can find it.`,
    };
  }
  if (nudgeIndex === 2) {
    return {
      title: "Your draft is waiting",
      body: `${item} is still unfinished. Tap to jump back to ${where} — I'll keep your photos ready.`,
    };
  }
  return {
    title: "Last nudge from Mr. Evorios",
    body: `Whenever you're ready, finish publishing ${item}. I'll stop pinging after this.`,
  };
}

async function maybeGeminiCopy(params: {
  title: string;
  step: number | undefined;
  nudgeIndex: number;
  fallback: { title: string; body: string };
}): Promise<{ title: string; body: string }> {
  if (!resolveLlmProvider()) return params.fallback;
  try {
    const result = await completeLlmChat({
      max_tokens: 120,
      system:
        "You are Mr. Evorios, warm garage-showcase mascot. Write a short push notification to gently remind a host to finish publishing a listing. Return JSON only: {\"title\":\"...\",\"body\":\"...\"}. Title <= 42 chars. Body <= 110 chars. No emojis. No guilt trips. Respect quiet helpful tone.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            listingTitle: params.title || "an item",
            wizardStep: params.step ?? null,
            nudgeNumber: params.nudgeIndex,
            stepHint: stepLabel(params.step),
          }),
        },
      ],
    });
    const text = result.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return params.fallback;
    const parsed = JSON.parse(jsonMatch[0]) as { title?: string; body?: string };
    if (typeof parsed.title === "string" && typeof parsed.body === "string") {
      return {
        title: parsed.title.trim().slice(0, 48) || params.fallback.title,
        body: parsed.body.trim().slice(0, 140) || params.fallback.body,
      };
    }
  } catch {
    /* fall through */
  }
  return params.fallback;
}

function prefsAllowTips(agentPrefs: Record<string, unknown> | null | undefined): boolean {
  if (!agentPrefs) return true; // default on until synced
  if (agentPrefs.pushEnabled === false) return false;
  if (agentPrefs.agentTips === false) return false;
  return true;
}

function quietConfigFromProfile(profile: ProfileRow) {
  const prefs = profile.agent_prefs ?? {};
  const start =
    typeof prefs.quietHoursStart === "number" ? prefs.quietHoursStart : DEFAULT_QUIET_HOURS_START;
  const end = typeof prefs.quietHoursEnd === "number" ? prefs.quietHoursEnd : DEFAULT_QUIET_HOURS_END;
  return {
    timezone: (profile.timezone || "").trim() || DEFAULT_TIMEZONE,
    startHour: start,
    endHour: end,
  };
}

function newNotificationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function runAbandonedListingNudges(admin: SupabaseClient): Promise<{
  scanned: number;
  nudged: number;
  skippedQuiet: number;
  skippedPrefs: number;
  skippedRecent: number;
}> {
  const cutoff = new Date(Date.now() - IDLE_MS).toISOString();
  const { data: drafts, error } = await admin
    .from("listings")
    .select("id, owner_id, title, listing_status, updated_at, availability")
    .eq("listing_status", "draft")
    .lt("updated_at", cutoff)
    .order("updated_at", { ascending: true })
    .limit(40);

  if (error || !drafts?.length) {
    return { scanned: 0, nudged: 0, skippedQuiet: 0, skippedPrefs: 0, skippedRecent: 0 };
  }

  let nudged = 0;
  let skippedQuiet = 0;
  let skippedPrefs = 0;
  let skippedRecent = 0;
  const now = new Date();

  for (const row of drafts as DraftRow[]) {
    const meta = asMeta(row.availability);
    const nudgeCount = typeof meta.nudge_count === "number" ? meta.nudge_count : 0;
    if (nudgeCount >= MAX_NUDGES) continue;

    if (meta.last_nudged_at) {
      const last = Date.parse(meta.last_nudged_at);
      if (Number.isFinite(last) && now.getTime() - last < NUDGE_GAP_MS) {
        skippedRecent += 1;
        continue;
      }
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("id, timezone, agent_prefs, push_subscriptions")
      .eq("id", row.owner_id)
      .maybeSingle();

    if (!profile) continue;
    const profileRow = profile as ProfileRow;
    if (!prefsAllowTips(profileRow.agent_prefs)) {
      skippedPrefs += 1;
      continue;
    }

    const quiet = quietConfigFromProfile(profileRow);
    if (isWithinQuietHours(now, quiet)) {
      skippedQuiet += 1;
      continue;
    }

    const nextNudge = nudgeCount + 1;
    const fallback = templateCopy(row.title, meta.wizard_step, nextNudge);
    const copy = await maybeGeminiCopy({
      title: row.title,
      step: meta.wizard_step,
      nudgeIndex: nextNudge,
      fallback,
    });

    const deepLink = `${APP_ORIGIN}/?screen=listItem&listingId=${encodeURIComponent(row.id)}&skipSplash=1`;
    const notificationId = newNotificationId();

    await admin.from("notifications").insert({
      id: notificationId,
      recipient_id: row.owner_id,
      actor_id: null,
      type: "general",
      title: copy.title,
      body: copy.body,
      read_at: null,
    });

    await sendAdminWebPush({
      toUserId: row.owner_id,
      title: copy.title,
      body: copy.body,
      url: deepLink,
    });

    const nextAvailability = {
      ...meta,
      nudge_count: nextNudge,
      last_nudged_at: now.toISOString(),
    };

    await admin
      .from("listings")
      .update({ availability: nextAvailability })
      .eq("id", row.id)
      .eq("listing_status", "draft");

    nudged += 1;
  }

  return {
    scanned: drafts.length,
    nudged,
    skippedQuiet,
    skippedPrefs,
    skippedRecent,
  };
}

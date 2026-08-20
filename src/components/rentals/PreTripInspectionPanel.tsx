import { useMemo, useState } from "react";
import { Camera, CheckCircle2, Shield } from "lucide-react";
import { putMediaBlob, type MediaRef } from "../../lib/mediaStore";
import { useMediaUrl } from "../../lib/useMediaUrl";
import { useMessages } from "../../lib/i18n/react";
import {
  BODY_AREA_IDS,
  SPARE_TIRE_SLOT_ID,
  allTireSlotIds,
  createEmptyInspection,
  inspectionChecklistComplete,
  inspectionTiresComplete,
  isTireSlot,
  mergeInspectionAreas,
  resolveInspectionWheelCount,
  type DamageKind,
  type InspectionAreaEntry,
  type InspectionAreaId,
  type InspectionStage,
  type PreTripInspectionRecord,
} from "../../lib/preTripInspection";
import type { RentalRole } from "../../lib/rentalsStorage";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

const DAMAGE_KINDS: DamageKind[] = [
  "none",
  "chip",
  "scratch",
  "stain",
  "dent",
  "wear",
  "other",
];

type Props = {
  stage: InspectionStage;
  role: RentalRole;
  value: PreTripInspectionRecord | null | undefined;
  onChange: (next: PreTripInspectionRecord) => void;
  /** Required tire positions from listing (4 light / host-set for heavy). */
  wheelCount?: number;
  /** When true, hide edit controls (read-only summary). */
  readOnly?: boolean;
};

function AreaPhotoThumb({ media }: { media: MediaRef | null | undefined }) {
  const { url } = useMediaUrl(media ?? null);
  if (!media || !url) {
    return (
      <div
        className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed bg-gray-50 text-gray-400"
        style={{ borderColor: BORDER }}
      >
        <Camera className="h-5 w-5" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="h-20 w-full rounded-xl object-cover"
    />
  );
}

function AreaEditor({
  entry,
  label,
  hint,
  tireHint,
  brandLabel,
  brandPlaceholder,
  commentLabel,
  commentPlaceholder,
  damageLabel,
  damageLabels,
  photoAdd,
  photoReplace,
  photoSaving,
  onPatch,
  readOnly,
}: {
  entry: InspectionAreaEntry;
  label: string;
  hint?: string;
  tireHint?: string;
  brandLabel?: string;
  brandPlaceholder?: string;
  commentLabel: string;
  commentPlaceholder: string;
  damageLabel: string;
  damageLabels: Record<DamageKind, string>;
  photoAdd: string;
  photoReplace: string;
  photoSaving: string;
  onPatch: (patch: Partial<InspectionAreaEntry>) => void;
  readOnly?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const tire = isTireSlot(entry.areaId);

  return (
    <div className="rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
      <p className="text-[13px] font-semibold text-gray-900">{label}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-gray-500">{hint}</p> : null}
      {tire && tireHint ? (
        <p className="mt-1 text-[11px] font-medium text-amber-900/90">{tireHint}</p>
      ) : null}

      <div className="mt-2">
        <AreaPhotoThumb media={entry.photo} />
        {!readOnly ? (
          <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 px-3 py-2 text-[12px] font-semibold text-gray-800">
            {busy ? photoSaving : entry.photo ? photoReplace : photoAdd}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                void putMediaBlob(file, { kind: "image" })
                  .then((result) => {
                    if (result.ok) onPatch({ photo: result.ref });
                  })
                  .finally(() => setBusy(false));
              }}
            />
          </label>
        ) : null}
      </div>

      {tire ? (
        <label className="mt-2 block text-[11px] font-semibold text-gray-600">
          {brandLabel}
          <input
            type="text"
            value={entry.tireBrandModel ?? ""}
            disabled={readOnly}
            placeholder={brandPlaceholder}
            onChange={(e) => onPatch({ tireBrandModel: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-[13px] text-gray-900 disabled:bg-gray-50"
          />
        </label>
      ) : (
        <div className="mt-2">
          <p className="text-[11px] font-semibold text-gray-600">{damageLabel}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {DAMAGE_KINDS.map((kind) => {
              const on = entry.damageKinds.includes(kind);
              return (
                <button
                  key={kind}
                  type="button"
                  disabled={readOnly}
                  onClick={() => {
                    if (kind === "none") {
                      onPatch({ damageKinds: on ? [] : ["none"] });
                      return;
                    }
                    const withoutNone = entry.damageKinds.filter((k) => k !== "none");
                    const next = on
                      ? withoutNone.filter((k) => k !== kind)
                      : [...withoutNone, kind];
                    onPatch({ damageKinds: next });
                  }}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold disabled:opacity-60 ${
                    on
                      ? "bg-amber-100 text-amber-950"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {damageLabels[kind]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="mt-2 block text-[11px] font-semibold text-gray-600">
        {commentLabel}
        <textarea
          value={entry.comment}
          disabled={readOnly}
          placeholder={commentPlaceholder}
          rows={2}
          onChange={(e) => onPatch({ comment: e.target.value })}
          className="mt-1 w-full rounded-lg border border-gray-200 px-2.5 py-2 text-[13px] text-gray-900 disabled:bg-gray-50"
        />
      </label>
    </div>
  );
}

export function PreTripInspectionPanel({
  stage,
  role,
  value,
  onChange,
  wheelCount: wheelCountProp,
  readOnly,
}: Props) {
  const t = useMessages();
  const copy = t.preTripInspection;
  const wheelCount = resolveInspectionWheelCount(value, wheelCountProp ?? 4);
  const tireSlotIds = useMemo(() => allTireSlotIds(wheelCount), [wheelCount]);

  const draft = useMemo(() => {
    if (value) {
      return {
        ...value,
        stage,
        requiredWheelCount: wheelCount,
        areas: mergeInspectionAreas(value.areas, wheelCount),
      };
    }
    return createEmptyInspection(stage, wheelCount);
  }, [value, stage, wheelCount]);

  const checklistOk = inspectionChecklistComplete(draft, wheelCount);
  const tiresOk = inspectionTiresComplete(draft, wheelCount);
  const locked =
    readOnly ||
    (role === "renter" && Boolean(draft.renterSubmittedAt)) ||
    (role === "host" && Boolean(draft.hostConfirmedAt) && Boolean(draft.renterSubmittedAt));

  const patchArea = (areaId: InspectionAreaId, patch: Partial<InspectionAreaEntry>) => {
    const areas = mergeInspectionAreas(draft.areas, wheelCount).map((a) =>
      a.areaId === areaId ? { ...a, ...patch } : a,
    );
    onChange({
      ...draft,
      requiredWheelCount: wheelCount,
      areas,
      // Editing after submit resets submit flags so both sides re-ack.
      renterSubmittedAt: undefined,
      hostConfirmedAt: undefined,
    });
  };

  const areaLabel = (id: InspectionAreaId): string => {
    const map = copy.areas as Record<string, string>;
    if (map[id]) return map[id];
    const numbered = /^tire_(\d+)$/.exec(id);
    if (numbered) return copy.tireNumbered(Number(numbered[1]));
    return id;
  };

  return (
    <div
      className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"
      data-pre-trip-stage={stage}
      data-wheel-count={wheelCount}
    >
      <div className="flex items-start gap-2">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-900" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-950">
            {stage === "pickup" ? copy.pickupTitle : copy.returnTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
            {stage === "pickup" ? copy.pickupBody : copy.returnBody(wheelCount)}
          </p>
          <p className="mt-2 text-xs font-semibold text-amber-950">{copy.tireSwapHint}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-950/80">
          {copy.bodySection}
        </p>
        {BODY_AREA_IDS.map((id) => {
          const entry = draft.areas.find((a) => a.areaId === id)!;
          return (
            <AreaEditor
              key={id}
              entry={entry}
              label={areaLabel(id)}
              hint={copy.bodyPhotoHint}
              commentLabel={copy.commentLabel}
              commentPlaceholder={copy.commentPlaceholder}
              damageLabel={copy.damageLabel}
              damageLabels={copy.damage}
              photoAdd={copy.photoAdd}
              photoReplace={copy.photoReplace}
              photoSaving={copy.photoSaving}
              onPatch={(patch) => patchArea(id, patch)}
              readOnly={locked}
            />
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-amber-950/80">
          {copy.tiresSection(wheelCount)}
        </p>
        <p className="text-[11px] leading-relaxed text-amber-900/90">
          {copy.tiresMandatoryHint(wheelCount)}
        </p>
        {!tiresOk ? (
          <p className="text-[12px] font-semibold text-red-700">
            {copy.tiresIncomplete(wheelCount)}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-green-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {copy.tiresComplete}
          </p>
        )}
        {tireSlotIds.map((id) => {
          const entry = draft.areas.find((a) => a.areaId === id)!;
          const optional = id === SPARE_TIRE_SLOT_ID;
          return (
            <AreaEditor
              key={id}
              entry={entry}
              label={
                optional ? `${areaLabel(id)} (${copy.optional})` : areaLabel(id)
              }
              tireHint={copy.tirePhotoHint}
              brandLabel={copy.tireBrandLabel}
              brandPlaceholder={copy.tireBrandPlaceholder}
              commentLabel={copy.tireCommentLabel}
              commentPlaceholder={copy.tireCommentPlaceholder}
              damageLabel={copy.damageLabel}
              damageLabels={copy.damage}
              photoAdd={copy.photoAdd}
              photoReplace={copy.photoReplace}
              photoSaving={copy.photoSaving}
              onPatch={(patch) => patchArea(id, patch)}
              readOnly={locked}
            />
          );
        })}
      </div>

      <div className="mt-4 space-y-2 border-t border-amber-200/80 pt-3">
        {!checklistOk ? (
          <p className="text-[12px] font-semibold text-red-700">
            {copy.incomplete(wheelCount)}
          </p>
        ) : null}

        {role === "renter" && !draft.renterSubmittedAt && !readOnly ? (
          <button
            type="button"
            disabled={!checklistOk}
            onClick={() =>
              onChange({
                ...draft,
                requiredWheelCount: wheelCount,
                areas: mergeInspectionAreas(draft.areas, wheelCount),
                renterSubmittedAt: new Date().toISOString(),
              })
            }
            className="w-full rounded-xl bg-primary py-3 text-[14px] font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: GREEN }}
          >
            {copy.submitRenter}
          </button>
        ) : null}

        {role === "renter" && draft.renterSubmittedAt ? (
          <p className="text-[12px] font-semibold text-green-800">
            {draft.hostConfirmedAt ? copy.bothDone : copy.waitingHost}
          </p>
        ) : null}

        {role === "host" && draft.renterSubmittedAt && !draft.hostConfirmedAt && !readOnly ? (
          <button
            type="button"
            disabled={!checklistOk}
            onClick={() =>
              onChange({
                ...draft,
                requiredWheelCount: wheelCount,
                areas: mergeInspectionAreas(draft.areas, wheelCount),
                hostConfirmedAt: new Date().toISOString(),
              })
            }
            className="w-full rounded-xl py-3 text-[14px] font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: GREEN }}
          >
            {copy.confirmHost}
          </button>
        ) : null}

        {role === "host" && !draft.renterSubmittedAt ? (
          <p className="text-[12px] text-amber-900/90">{copy.waitingRenter}</p>
        ) : null}

        {draft.hostConfirmedAt && draft.renterSubmittedAt ? (
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-green-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {copy.bothDone}
          </p>
        ) : null}
      </div>
    </div>
  );
}

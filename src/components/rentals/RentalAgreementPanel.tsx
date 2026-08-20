import { useMemo, useState } from "react";
import { FileText, Download } from "lucide-react";
import {
  agreementFullySigned,
  formatAgreementDownloadText,
  type RentalAgreementRecord,
  type RentalAgreementParty,
} from "../../lib/rentalAgreement";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function RentalAgreementSignBlock({
  party,
  displayName,
  checked,
  onCheckedChange,
  expanded,
  onToggleExpand,
  termsText,
  summaryLines,
  disabled,
}: {
  party: RentalAgreementParty;
  displayName: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  termsText: string;
  summaryLines?: string[];
  disabled?: boolean;
}) {
  const { rentalAgreement: t } = useMessages();
  const partyLabel = party === "renter" ? t.partyRenter : t.partyHost;

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3" style={{ borderColor: BORDER }}>
      <div className="flex items-start gap-2">
        <FileText className="mt-0.5 h-5 w-5 shrink-0" style={{ color: GREEN }} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{t.title}</p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{t.honestCaveat}</p>
        </div>
      </div>

      {summaryLines && summaryLines.length > 0 ? (
        <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-950">
          {summaryLines.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        className="text-xs font-semibold underline"
        style={{ color: GREEN }}
        onClick={onToggleExpand}
      >
        {expanded ? t.hideTerms : t.readTerms}
      </button>
      {expanded ? (
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-[11px] leading-snug text-gray-700">
          {termsText}
        </pre>
      ) : null}

      <label className="flex items-start gap-2 text-sm text-gray-900">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <span>
          {t.acceptCheckbox(partyLabel, displayName.trim() || t.nameFallback)}
        </span>
      </label>
    </div>
  );
}

export function RentalAgreementStatusCard({
  record,
  role,
}: {
  record: RentalAgreementRecord | null | undefined;
  role: RentalAgreementParty;
}) {
  const { rentalAgreement: t } = useMessages();
  const [showTerms, setShowTerms] = useState(false);
  const complete = agreementFullySigned(record);

  const statusLine = useMemo(() => {
    if (!record) return t.statusMissing;
    if (complete) return t.statusBothSigned;
    if (record.renterSignature && !record.hostSignature) return t.statusAwaitingHost;
    if (record.hostSignature && !record.renterSignature) return t.statusAwaitingRenter;
    return t.statusMissing;
  }, [complete, record, t]);

  const download = () => {
    if (!record) return;
    const text = formatAgreementDownloadText(record);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evorios-rental-agreement-${record.commercial.bookingId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3" style={{ borderColor: BORDER }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{t.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{statusLine}</p>
        </div>
        {record ? (
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-gray-700"
            style={{ borderColor: BORDER }}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {t.download}
          </button>
        ) : null}
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">{t.honestCaveat}</p>

      {record?.enrichedSummaryLines?.length ? (
        <ul className="space-y-1 text-xs text-gray-700">
          {record.enrichedSummaryLines.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-1 text-xs text-gray-700">
        <p>
          <span className="font-semibold">{t.partyRenter}: </span>
          {record?.renterSignature
            ? t.signedAs(
                record.renterSignature.displayName,
                formatWhen(record.renterSignature.signedAt),
              )
            : t.notSigned}
        </p>
        <p>
          <span className="font-semibold">{t.partyHost}: </span>
          {record?.hostSignature
            ? t.signedAs(
                record.hostSignature.displayName,
                formatWhen(record.hostSignature.signedAt),
              )
            : t.notSigned}
        </p>
        {record?.termsVersion ? (
          <p className="text-muted-foreground">{t.termsVersion(record.termsVersion)}</p>
        ) : null}
      </div>

      {record?.termsText ? (
        <>
          <button
            type="button"
            className="text-xs font-semibold underline"
            style={{ color: GREEN }}
            onClick={() => setShowTerms((v) => !v)}
          >
            {showTerms ? t.hideTerms : t.readTerms}
          </button>
          {showTerms ? (
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-[11px] leading-snug text-gray-700">
              {record.termsText}
            </pre>
          ) : null}
        </>
      ) : null}

      {!complete && role === "renter" && !record?.renterSignature ? (
        <p className="text-xs font-semibold text-amber-800">{t.blockRenter}</p>
      ) : null}
      {!complete && role === "host" && !record?.hostSignature ? (
        <p className="text-xs font-semibold text-amber-800">{t.blockHost}</p>
      ) : null}
      {!complete ? (
        <p className="text-xs text-amber-800">{t.blockHandoff}</p>
      ) : null}
    </div>
  );
}

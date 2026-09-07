import { useEffect, useState } from "react";

import { BRAND_AMBER, BRAND_GREEN } from "../../lib/brand";
import { getOpsCredentials } from "../../lib/ops/opsAuth";
import {
  fetchRemoteReports,
  patchRemoteReport,
  type ContentReport,
  type ReportStatus,
} from "../../lib/moderation/reportsStorage";

const BORDER = "#E8E6E0";
const MUTED = "#6B7280";

const REASON_LABEL: Record<string, string> = {
  harassment: "Травля или угрозы",
  scam: "Мошенничество",
  off_platform: "Уводит оплату или общение из приложения",
  sexual: "Сексуальный контент",
  hate: "Ненависть",
  violence: "Насилие или самоповреждение",
  illegal_item: "Запрещённая вещь",
  not_as_described: "Не соответствует описанию",
  spam: "Спам",
  other: "Другое",
};

const KIND_LABEL: Record<string, string> = {
  listing: "Объявление",
  message: "Сообщение",
  profile: "Профиль",
  request: "Запрос",
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  new: "новая",
  reviewing: "в работе",
  actioned: "меры приняты",
  dismissed: "отклонена",
};

/**
 * Moderation queue. Reports arrive from the app; a moderator has to be able to
 * see them and say what was done, otherwise the report button is decoration.
 */
export function OpsReportsQueue() {
  const [rows, setRows] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const refresh = async () => {
    setLoading(true);
    const remote = await fetchRemoteReports(getOpsCredentials()?.password ?? "");
    setRows(remote);
    setWarning(
      remote.length === 0
        ? "Очередь пуста или таблица content_reports ещё не создана в Supabase (миграция 048)."
        : null,
    );
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const apply = async (row: ContentReport, status: ReportStatus) => {
    await patchRemoteReport(getOpsCredentials()?.password ?? "", {
      id: row.id,
      status,
      moderatorNote: notes[row.id] ?? row.moderatorNote,
    });
    await refresh();
  };

  const newCount = rows.filter((row) => row.status === "new").length;

  return (
    <section
      className="rounded-2xl border bg-white px-4 py-4"
      style={{ borderColor: BORDER }}
      aria-label="Жалобы"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: BRAND_GREEN }}>
            Жалобы на контент
            {newCount > 0 ? (
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: BRAND_AMBER, color: "#1a1a1a" }}
              >
                {newCount} новых
              </span>
            ) : null}
          </h2>
          <p className="mt-1 text-[12px]" style={{ color: MUTED }}>
            Из приложения: «⋯» на объявлении, в профиле или флажок на сообщении.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-semibold"
          style={{ borderColor: BORDER }}
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? "…" : "Обновить"}
        </button>
      </div>

      {warning ? (
        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: MUTED }}>
          {warning}
        </p>
      ) : null}

      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border px-3 py-3"
            style={{
              borderColor: row.status === "new" ? `${BRAND_GREEN}66` : BORDER,
              background: row.status === "new" ? "rgba(13,92,58,0.04)" : "#fff",
            }}
          >
            <div
              className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: MUTED }}
            >
              <span>{KIND_LABEL[row.targetKind] ?? row.targetKind}</span>
              <span>·</span>
              <span>{REASON_LABEL[row.reason] ?? row.reason}</span>
              <span>·</span>
              <span>{STATUS_LABEL[row.status]}</span>
              <span>·</span>
              <span>{new Date(row.createdAt).toLocaleString()}</span>
            </div>

            {row.details ? (
              <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
                {row.details}
              </p>
            ) : null}

            {row.evidence ? (
              <p
                className="mt-1.5 whitespace-pre-wrap rounded-lg border px-2.5 py-2 text-[13px] leading-relaxed text-gray-700"
                style={{ borderColor: BORDER, background: "#FAFAF8" }}
              >
                {row.evidence}
              </p>
            ) : null}

            <p className="mt-1.5 break-all text-[11px]" style={{ color: MUTED }}>
              Объект: {row.targetId || "—"}
              {row.targetThreadKey ? ` · ветка ${row.targetThreadKey}` : ""}
              <br />
              На кого: {row.reportedUserId ?? "—"} · от кого: {row.reporterId ?? "—"}
            </p>

            <input
              value={notes[row.id] ?? row.moderatorNote}
              onChange={(event) =>
                setNotes((prev) => ({ ...prev, [row.id]: event.target.value }))
              }
              placeholder="Что сделали: предупреждение, снятие, бан"
              className="mt-2 w-full rounded-lg border px-2.5 py-1.5 text-[12px]"
              style={{ borderColor: BORDER }}
            />

            <div className="mt-2 flex flex-wrap gap-2">
              {row.status !== "reviewing" ? (
                <button
                  type="button"
                  className="rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                  style={{ borderColor: BORDER }}
                  onClick={() => void apply(row, "reviewing")}
                >
                  Взять в работу
                </button>
              ) : null}
              {row.status !== "actioned" ? (
                <button
                  type="button"
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
                  style={{ backgroundColor: BRAND_GREEN }}
                  onClick={() => void apply(row, "actioned")}
                >
                  Меры приняты
                </button>
              ) : null}
              {row.status !== "dismissed" ? (
                <button
                  type="button"
                  className="rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                  style={{ borderColor: BORDER, color: "#B42318" }}
                  onClick={() => void apply(row, "dismissed")}
                >
                  Отклонить
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {rows.length === 0 ? (
          <li
            className="rounded-xl border px-3 py-3 text-[13px]"
            style={{ borderColor: BORDER, color: MUTED }}
          >
            Жалоб нет.
          </li>
        ) : null}
      </ul>
    </section>
  );
}

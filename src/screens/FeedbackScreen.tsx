import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import { SUPPORT_EMAIL } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import {
  submitPlatformFeedback,
  type FeedbackKind,
} from "../lib/platformFeedbackStorage";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type FeedbackScreenProps = {
  onBack: () => void;
};

export function FeedbackScreen({ onBack }: FeedbackScreenProps) {
  const t = useMessages();
  const auth = useAuth();
  const copy = t.feedback;
  const [kind, setKind] = useState<FeedbackKind>("help");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(() => auth.userEmail ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kinds: { id: FeedbackKind; label: string }[] = [
    { id: "help", label: copy.kindHelp },
    { id: "complaint", label: copy.kindComplaint },
    { id: "idea", label: copy.kindIdea },
    { id: "other", label: copy.kindOther },
  ];

  const onSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length < 5) {
      setError(copy.tooShort);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await submitPlatformFeedback({
        kind,
        message: trimmed,
        contactEmail: email.trim() || auth.userEmail || "",
        screenHint: "feedback",
        userId: auth.userId,
        userEmail: auth.userEmail,
      });
      if (!result.ok) {
        setError(copy.sendFailed);
        return;
      }
      setDone(true);
      setMessage("");
    } catch {
      setError(copy.sendFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen flex flex-col bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 py-3" style={{ borderColor: BORDER }}>
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-600">
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </button>
        <h1 className="mt-2 text-[20px] font-extrabold" style={{ color: GREEN }}>
          {copy.title}
        </h1>
        <p className="mt-1 text-[13px] text-gray-500">{copy.subtitle}</p>
      </header>

      <div className="screen-scroll flex-1 px-4 py-5">
        <div className="mx-auto max-w-[420px] space-y-4">
          {done ? (
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
              <p className="text-[16px] font-bold" style={{ color: GREEN }}>
                {copy.thanksTitle}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{copy.thanksBody}</p>
              <button
                type="button"
                className="mt-4 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white"
                style={{ backgroundColor: GREEN }}
                onClick={() => setDone(false)}
              >
                {copy.sendAnother}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {kinds.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setKind(item.id)}
                    className="rounded-full border px-3 py-1.5 text-[13px] font-semibold"
                    style={{
                      borderColor: kind === item.id ? GREEN : BORDER,
                      background: kind === item.id ? "rgba(13,92,58,0.1)" : "#fff",
                      color: kind === item.id ? GREEN : "#6B7280",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="block space-y-1.5">
                <span className="text-[12px] font-semibold text-gray-500">{copy.messageLabel}</span>
                <textarea
                  className="min-h-[140px] w-full rounded-2xl border bg-white px-3 py-3 text-[15px] leading-relaxed outline-none focus:border-[var(--primary)]"
                  style={{ borderColor: BORDER }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.messagePlaceholder}
                  maxLength={4000}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[12px] font-semibold text-gray-500">{copy.emailLabel}</span>
                <input
                  type="email"
                  className="w-full rounded-2xl border bg-white px-3 py-3 text-[15px] outline-none focus:border-[var(--primary)]"
                  style={{ borderColor: BORDER }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                />
              </label>

              {error ? <p className="text-[13px] font-medium text-red-700">{error}</p> : null}

              <button
                type="button"
                disabled={busy}
                onClick={() => void onSubmit()}
                className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                {busy ? copy.sending : copy.submit}
              </button>

              <p className="text-[12px] leading-relaxed text-gray-500">
                {copy.emailFallback(SUPPORT_EMAIL)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useRequireAuth } from "../hooks/RequireAuth";
import type { AuthIntent } from "../lib/authReturn";

const GREEN = "#0D5C3A";

/** Consistent Sign in / Create account CTA when a flow needs auth. */
export function SignInPrompt({
  message,
  intent = "generic",
  className = "",
}: {
  message: string;
  intent?: AuthIntent;
  className?: string;
}) {
  const requireAuth = useRequireAuth();
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 px-3 py-3 ${className}`}
      role="status"
    >
      <p className="text-[15px] font-medium leading-snug text-red-800">{message}</p>
      <button
        type="button"
        onClick={() => requireAuth(intent)}
        className="mt-3 w-full rounded-xl py-3 text-base font-bold text-white"
        style={{ backgroundColor: GREEN }}
      >
        Sign in / Create account
      </button>
    </div>
  );
}

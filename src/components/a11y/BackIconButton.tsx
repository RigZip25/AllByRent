import { ArrowLeft } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type BackIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
};

/** Icon-only back control with name + 44px target (Stage 17 / X9 / X10). */
export function BackIconButton({
  label,
  className = "",
  type = "button",
  ...rest
}: BackIconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-700 hover:bg-black/5 ${className}`}
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
    </button>
  );
}

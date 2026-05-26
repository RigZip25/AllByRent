import { motion } from "motion/react";
import type { ReactNode } from "react";
import rentanoImg from "../imports/No_back_rentano.png";

const PRIMARY_GREEN = "#0D5C3A";

export function RentanoTip({
  message,
  onTap,
  className = "",
  typing = false,
  showCursor = false,
  linkText,
  linkUrl,
}: {
  message: ReactNode;
  onTap?: () => void;
  className?: string;
  typing?: boolean;
  showCursor?: boolean;
  linkText?: string;
  linkUrl?: string;
}) {
  const messageContent = typing ? (
    <span className="flex gap-1.5 py-0.5">
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          key={delay}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay }}
          className="inline-block h-1.5 w-1.5 rounded-full bg-[#374151]/50"
        />
      ))}
    </span>
  ) : (
    <>
      {message}
      {showCursor ? (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="ml-px"
        >
          |
        </motion.span>
      ) : null}
    </>
  );

  const content = (
    <>
      <div
        className="h-10 w-10 shrink-0 overflow-hidden rounded-full"
        style={{ border: `2px solid ${PRIMARY_GREEN}` }}
      >
        <img
          src={rentanoImg}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>
      <div className="flex-1 text-left text-base italic leading-snug text-[#374151]">
        {messageContent}
        {onTap && !typing ? (
          <span className="ml-1 not-italic font-medium" style={{ color: PRIMARY_GREEN }}>
            →
          </span>
        ) : null}
        {linkText && linkUrl && !typing ? (
          <button
            type="button"
            onClick={() => window.open(linkUrl, "_blank")}
            className="mt-1.5 block cursor-pointer text-left text-sm text-green-700 underline not-italic"
          >
            {linkText}
          </button>
        ) : null}
      </div>
    </>
  );

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {onTap ? (
        <button
          type="button"
          onClick={onTap}
          className="flex w-full items-start gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-colors hover:bg-[#DCFCE7]"
          style={{ backgroundColor: "#F0FDF4", borderColor: PRIMARY_GREEN }}
        >
          {content}
        </button>
      ) : (
        <div
          className="flex w-full items-start gap-3 rounded-2xl border px-3.5 py-2.5"
          style={{ backgroundColor: "#F0FDF4", borderColor: PRIMARY_GREEN }}
        >
          {content}
        </div>
      )}
    </motion.div>
  );
}

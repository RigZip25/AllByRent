const GREEN = "#0D5C3A";

export function CounterpartyName({
  name,
  identityVerified,
  phoneVerified,
  onClick,
}: {
  name: string;
  identityVerified: boolean;
  phoneVerified: boolean;
  onClick?: () => void;
}) {
  const content = (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={onClick ? "underline-offset-2 hover:underline" : ""}>{name}</span>
      {identityVerified ? (
        <span className="text-[13px]" title="ID verified" aria-label="ID verified">
          ✅
        </span>
      ) : null}
      {phoneVerified ? (
        <span className="text-[13px]" title="Phone verified" aria-label="Phone verified">
          📱
        </span>
      ) : null}
    </span>
  );

  if (!onClick) {
    return <span style={{ color: GREEN }}>{content}</span>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="text-left text-[12px] font-medium"
      style={{ color: GREEN }}
    >
      {content}
    </button>
  );
}

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from "react";

type AutoGrowTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxRows?: number;
};

export const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  function AutoGrowTextarea(
    { maxRows = 4, className = "", value, onChange, onKeyDown, ...props },
    forwardedRef,
  ) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(forwardedRef, () => ref.current as HTMLTextAreaElement);

    const resize = useCallback(() => {
      const el = ref.current;
      if (!el) return;
      el.style.height = "auto";
      const style = getComputedStyle(el);
      const lineHeight = parseFloat(style.lineHeight) || 24;
      const paddingTop = parseFloat(style.paddingTop) || 0;
      const paddingBottom = parseFloat(style.paddingBottom) || 0;
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
      const next = Math.min(el.scrollHeight, maxHeight);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [maxRows]);

    useLayoutEffect(() => {
      resize();
    }, [value, resize]);

    return (
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          resize();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            ref.current?.blur();
          }
          onKeyDown?.(e);
        }}
        className={`field-autogrow resize-none break-words [overflow-wrap:anywhere] ${className}`}
        {...props}
      />
    );
  },
);

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../app/components/ui/sheet";
import { useMessages } from "../../lib/i18n/react";

export function RentalLifecyclePolicySheet({
  open,
  onOpenChange,
  lateSummary,
  noShowFeeLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lateSummary?: string | null;
  noShowFeeLabel?: string | null;
}) {
  const t = useMessages();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-8">
        <SheetHeader className="text-left">
          <SheetTitle>{t.booking.policySheetTitle}</SheetTitle>
          <SheetDescription>{t.booking.policyPracticeNote}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-2">
          <section>
            <h3 className="text-sm font-semibold text-gray-900">
              {t.booking.cancellationPolicyTitle}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {t.booking.cancellationPolicyBody}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900">
              {t.booking.noShowPolicyTitle}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {t.booking.noShowPolicyBody}
            </p>
            {noShowFeeLabel ? (
              <p className="mt-1 text-[12px] font-medium text-gray-700">{noShowFeeLabel}</p>
            ) : null}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900">
              {t.booking.lateReturnPolicyTitle}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {lateSummary?.trim() ? lateSummary : t.booking.lateReturnPolicyBody}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

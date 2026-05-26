import { motion } from "motion/react";
import { Check } from "lucide-react";
import { AppBrandMark } from "../../components/AppBrandHeader";

const GREEN = "#0D5C3A";

type ListingPublishSuccessProps = {
  title: string;
  onDone: () => void;
};

export function ListingPublishSuccess({ title, onDone }: ListingPublishSuccessProps) {
  return (
    <motion.div
      className="mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col items-center justify-center bg-[#F9FAFB] px-6 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: GREEN }}
      >
        <Check className="h-8 w-8 text-white" strokeWidth={3} />
      </span>
      <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
        You&apos;re live!
      </h2>
      <p className="mt-2 text-base text-gray-500">
        <span className="font-semibold text-gray-800">{title}</span> is active on{" "}
        <AppBrandMark size="sm" className="inline-flex align-baseline" />.
      </p>
      <button
        type="button"
        onClick={onDone}
        className="btn-primary mt-8 w-full max-w-sm text-white"
        style={{ backgroundColor: GREEN }}
      >
        Back to home
      </button>
    </motion.div>
  );
}

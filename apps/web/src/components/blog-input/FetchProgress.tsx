import { useTranslation } from "react-i18next";

import type { FetchPhase } from "../../lib/stores/use-blog-input-store";

interface FetchProgressProps {
  phase: FetchPhase;
}

export default function FetchProgress({ phase }: FetchProgressProps) {
  const { t } = useTranslation();

  if (phase === "idle" || phase === "error") return null;

  const PHASE_KEYS: Record<string, string> = {
    submitting: "statusSubmitting",
    processing: "statusProcessing",
    completed: "statusCompleted",
  };

  const label = t(PHASE_KEYS[phase]);
  const steps: FetchPhase[] = ["submitting", "processing", "completed"];
  const currentIndex = steps.indexOf(phase);

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <div
            className={`h-2 w-2 rounded-full transition-all duration-500 ${
              i <= currentIndex
                ? "bg-[var(--color-primary)] scale-125"
                : "bg-[var(--color-outline-variant)]"
            }`}
          />
          {i < steps.length - 1 && (
            <div
              className={`h-px w-10 transition-colors duration-500 ${
                i < currentIndex
                  ? "bg-[var(--color-primary)]"
                  : "bg-[var(--color-outline-variant)]"
              }`}
            />
          )}
        </div>
      ))}
      <span className="ml-1 text-sm text-[var(--color-on-surface-variant)]">
        {label}
      </span>
      {phase !== "completed" && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      )}
    </div>
  );
}

import { useTranslation } from "react-i18next";

import type { FetchPhase } from "../../lib/stores/use-blog-input-store";

interface FetchProgressProps {
  phase: FetchPhase;
}

const STEPS: { key: FetchPhase; labelKey: string; messageKey: string }[] = [
  {
    key: "submitting",
    labelKey: "fetchStepSubmitting",
    messageKey: "statusSubmitting",
  },
  {
    key: "processing",
    labelKey: "fetchStepProcessing",
    messageKey: "statusProcessing",
  },
  {
    key: "completed",
    labelKey: "fetchStepCompleted",
    messageKey: "statusCompleted",
  },
];

export default function FetchProgress({ phase }: FetchProgressProps) {
  const { t } = useTranslation();

  if (phase === "idle" || phase === "error") return null;

  const currentIndex = STEPS.findIndex((s) => s.key === phase);
  const message = t(STEPS[Math.max(0, currentIndex)].messageKey);

  return (
    <div className="animate-fade-in mt-10 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2.5">
        {STEPS.map((step, i) => {
          const reached = i <= currentIndex;
          const passed = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step.key} className="flex items-center gap-2.5">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`h-[11px] w-[11px] rounded-full transition-colors duration-500 ${
                    reached
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-outline-variant)]"
                  } ${active ? "animate-pulse-dot" : ""}`}
                />
                <span
                  className={`text-xs ${
                    reached
                      ? "text-[var(--color-on-surface)]"
                      : "text-[var(--color-on-surface-variant)]"
                  }`}
                >
                  {t(step.labelKey)}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`mb-[22px] h-0.5 w-[46px] rounded-full transition-colors duration-500 ${
                    passed
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-outline-variant)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[13.5px] text-[var(--color-on-surface-variant)]">
        {message}
      </p>
    </div>
  );
}

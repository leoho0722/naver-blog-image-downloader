import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "../../lib/stores/use-settings-store";

export default function OnboardingCard() {
  const { t } = useTranslation();
  const dismissOnboarding = useSettingsStore((s) => s.dismissOnboarding);

  const handleDismiss = useCallback(() => {
    dismissOnboarding();
  }, [dismissOnboarding]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDismiss]);

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-sm rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-surface-container-high)",
          boxShadow: "var(--shadow-elevated)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t("onboardingTitle")}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <svg
              className="h-6 w-6 text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold text-[var(--color-on-surface)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("onboardingTitle")}
          </h3>
          <p className="text-center text-sm leading-relaxed text-[var(--color-on-surface-variant)] whitespace-pre-line">
            {t("onboardingDesc")}
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-1 w-full rounded-xl bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              boxShadow: "0 2px 8px rgba(21, 101, 192, 0.3)",
            }}
          >
            {t("onboardingStart")}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "../../lib/stores/use-settings-store";

/** 首次造訪的歡迎卡：三步驟引導，溫潤圓角卡片 + 陶土橘藥丸按鈕。 */
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

  const steps = [
    t("onboardingStep1"),
    t("onboardingStep2"),
    t("onboardingStep3"),
  ];

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "var(--color-scrim)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        className="w-[350px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-8"
        style={{ boxShadow: "0 24px 70px rgba(30, 20, 8, 0.35)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        {/* 三色點綴（9px，間距 7px，下方 14px） */}
        <div className="mb-[14px] flex items-center justify-center gap-[7px]">
          <span className="h-[9px] w-[9px] rounded-full bg-[var(--color-primary)]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[var(--color-secondary)]" />
          <span
            className="h-[9px] w-[9px] rounded-full"
            style={{
              background:
                "color-mix(in oklab, #a5788f 80%, var(--color-surface-container))",
            }}
          />
        </div>

        <h3
          id="onboarding-title"
          className="mb-5 text-center text-[21px] text-[var(--color-on-surface)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {t("onboardingTitle")}
        </h3>

        <div className="mb-6 flex flex-col gap-[14px]">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-container)] text-[13px] font-bold text-[var(--color-primary)]">
                {i + 1}
              </span>
              <span className="text-[14px] leading-[1.5] text-[var(--color-on-surface-variant)]">
                {step}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          autoFocus
          onClick={handleDismiss}
          className="w-full rounded-full bg-[var(--color-primary)] py-[13px] text-[14.5px] font-bold text-[var(--color-on-primary)] transition-all duration-200 hover:brightness-[1.07] active:scale-[0.98]"
        >
          {t("onboardingStart")}
        </button>
      </div>
    </div>,
    document.body,
  );
}

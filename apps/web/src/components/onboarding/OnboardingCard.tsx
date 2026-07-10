import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "../../lib/stores/use-settings-store";

/** 首次造訪的歡迎卡：三步驟引導，溫潤圓角卡片 + 陶土橘藥丸按鈕。 */
export default function OnboardingCard() {
  const { t } = useTranslation();
  const dismissOnboarding = useSettingsStore((s) => s.dismissOnboarding);
  // 指向對話框卡片本身，開啟時把焦點移到這裡（而非按鈕），
  // 兼顧無障礙焦點管理，又不會讓按鈕一打開就冒出瀏覽器預設的藍色 focus 外框。
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(() => {
    dismissOnboarding();
  }, [dismissOnboarding]);

  // 歡迎卡一出現就把焦點移進對話框卡片，讓螢幕報讀器能宣讀、Esc 也能立即關閉。
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

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
      // 遮罩不做淡入：一掛載就以完整的半透明遮罩 + 模糊蓋住整個畫面。
      // 若對整層遮罩做 fade-in，淡入過程中遮罩還很透明，底下清晰的首頁
      //（「下載 Naver Blog 照片」標題、輸入框）會先露出來，看起來就像
      // 「背景先出現、歡迎卡才慢慢蓋上」。改成只讓卡片本身做進場動畫。
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "var(--color-scrim)",
        backdropFilter: "blur(3px)",
        // iOS Safari（18 以前）只認得 -webkit- 前綴，少了它模糊會被默默忽略，
        // 只剩半透明遮罩，底下的首頁內容就會清楚透出來（手機版的「穿透」主因）。
        WebkitBackdropFilter: "blur(3px)",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        // 只有卡片做進場動畫（淡入 + 微微上移），遮罩則是即時就位。
        className="animate-fade-in-up w-[350px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-8 outline-none"
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
          onClick={handleDismiss}
          className="w-full rounded-full bg-[var(--color-primary)] py-[13px] text-[14.5px] font-bold text-[var(--color-on-primary)] outline-none transition-all duration-200 hover:brightness-[1.07] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-container)] active:scale-[0.98]"
        >
          {t("onboardingStart")}
        </button>
      </div>
    </div>,
    document.body,
  );
}

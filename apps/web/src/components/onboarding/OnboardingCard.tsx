import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useModalDialog } from "../../lib/hooks/use-modal-dialog";
import { useSettingsStore } from "../../lib/stores/use-settings-store";

/**
 * 首次造訪的歡迎卡：三步驟引導，溫潤圓角卡片 + 陶土橘藥丸按鈕。
 *
 * 以原生 <dialog> 的強制回應模式打開：背後頁面不能點、Tab 跑不出卡片，
 * Esc 或手機返回手勢都能關閉。不論用哪種方式關閉，都只在 close 事件裡記錄一次「看過了」。
 */
export default function OnboardingCard() {
  const { t } = useTranslation();
  const dismissOnboarding = useSettingsStore((s) => s.dismissOnboarding);
  const { dialogRef, close } = useModalDialog({ onClose: dismissOnboarding });

  // 瀏覽器打開對話框時，預設會把焦點放在第一顆按鈕上，「開始使用」會一打開就冒出 focus 外框。
  // 改把焦點放在卡片本身：螢幕報讀器一樣會先唸出卡片標題，畫面上也不會多出外框。
  // （這個 effect 排在 useModalDialog 之後，執行時對話框已經打開）
  useEffect(() => {
    dialogRef.current?.focus();
  }, [dialogRef]);

  const steps = [
    t("onboardingStep1"),
    t("onboardingStep2"),
    t("onboardingStep3"),
  ];

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby="onboarding-title"
      // 歡迎卡只在首次造訪出現，此時首頁內容尚未 render（見 HomePage），
      // 遮罩底下是乾淨的 App 底色，所以「遮罩 + 卡片」一起淡入時，
      // 不會有首頁「下載 Naver Blog 照片」標題在淡入過程中透出來。
      // dialog-scrim 提供半透明遮罩與模糊；m-auto 讓卡片置中（Tailwind 會把 margin 歸零）。
      className="dialog-scrim animate-fade-in m-auto w-[350px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-8 text-[var(--color-on-surface)] outline-none"
      style={{ boxShadow: "0 24px 70px rgba(30, 20, 8, 0.35)" }}
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

      {/* 對話框裡的第一個標題，依無障礙慣例使用 h1；字級維持原本設計 */}
      <h1
        id="onboarding-title"
        className="mb-5 text-center text-[21px] text-[var(--color-on-surface)]"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        {t("onboardingTitle")}
      </h1>

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
        onClick={close}
        className="w-full rounded-full bg-[var(--color-primary)] py-[13px] text-[14.5px] font-bold text-[var(--color-on-primary)] outline-none transition-all duration-200 hover:brightness-[1.07] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-container)] active:scale-[0.98]"
      >
        {t("onboardingStart")}
      </button>
    </dialog>
  );
}

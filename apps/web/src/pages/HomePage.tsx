import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import BlogInputForm from "../components/blog-input/BlogInputForm";
import FetchProgress from "../components/blog-input/FetchProgress";
import OnboardingCard from "../components/onboarding/OnboardingCard";
import { useClipboard } from "../lib/hooks/use-clipboard";
import { useBlogInputStore } from "../lib/stores/use-blog-input-store";
import { useSettingsStore } from "../lib/stores/use-settings-store";

export default function HomePage() {
  const { t } = useTranslation();
  const { fetchPhase, fetchResult, jobId, setUrl, reset } = useBlogInputStore();
  const hasSeenOnboarding = useSettingsStore((s) => s.hasSeenOnboarding);
  const navigate = useNavigate();

  useEffect(() => {
    if (fetchPhase === "completed" && fetchResult) {
      navigate(`/app/web/gallery/${fetchResult.blogId}`, {
        state: { fetchResult, jobId },
      });
      reset();
    }
  }, [fetchPhase, fetchResult, jobId, navigate, reset]);

  useClipboard({
    onNaverUrlDetected: (url) => setUrl(url),
    enabled: fetchPhase === "idle",
  });

  const isIdle = fetchPhase === "idle";

  // 首次造訪時只顯示歡迎卡，首頁內容先不 render——這樣歡迎卡的半透明遮罩
  // 底下是乾淨的 App 底色，遮罩淡入時就不會有「下載 Naver Blog 照片」標題透出來。
  // 按下「開始使用」後 hasSeenOnboarding 轉為 true，首頁內容才掛載並播放進場動畫。
  if (!hasSeenOnboarding) {
    return <OnboardingCard />;
  }

  return (
    <div className="flex min-h-[78vh] flex-col items-center justify-center text-center">
      <div className="w-full max-w-xl">
        {/* 三色圓點點綴 */}
        <div className="animate-fade-in-up mb-6 flex items-center justify-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-secondary)]" />
          <span className="h-3 w-3 rounded-full bg-[#a5788f]" />
        </div>
        <h2
          className="animate-fade-in-up stagger-1 mb-3.5 text-center text-[32px] leading-tight tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {t("blogInputTitle")}
        </h2>
        <p className="animate-fade-in-up stagger-2 mb-9 text-center text-[15px] leading-relaxed text-[var(--color-on-surface-variant)]">
          {t("blogInputSubtitle")}
        </p>
        <div className="animate-fade-in-up stagger-3">
          <BlogInputForm />
        </div>
        <FetchProgress phase={fetchPhase} />
        {isIdle && (
          <p className="mt-8 text-[13px] text-[var(--color-on-surface-variant)]">
            {t("blogInputHint")}
          </p>
        )}
      </div>
    </div>
  );
}

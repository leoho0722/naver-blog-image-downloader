import { useEffect, useRef } from "react";
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

  // 首次造訪時，歡迎卡（OnboardingCard）會以半透明遮罩蓋在首頁內容上。
  // 若此時首頁還在播放進場動畫，動畫會從遮罩底下透出來（手機版尤其明顯），
  // 造成「動畫穿透」。因此只有在「非首次造訪」時才播放進場動畫，
  // 讓歡迎卡底下的背景保持安定。用 useRef 凍結首次 render 的值，
  // 這樣按下「開始使用」關掉歡迎卡後，內容也不會突然重播一次動畫。
  const playEntrance = useRef(hasSeenOnboarding).current;
  const enter = (stagger = "") =>
    playEntrance ? `animate-fade-in-up ${stagger}`.trim() : "";

  return (
    <>
      {!hasSeenOnboarding && <OnboardingCard />}
      <div className="flex min-h-[78vh] flex-col items-center justify-center text-center">
        <div className="w-full max-w-xl">
          {/* 三色圓點點綴 */}
          <div
            className={`${enter()} mb-6 flex items-center justify-center gap-2.5`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
            <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-secondary)]" />
            <span className="h-3 w-3 rounded-full bg-[#a5788f]" />
          </div>
          <h2
            className={`${enter("stagger-1")} mb-3.5 text-center text-[32px] leading-tight tracking-tight sm:text-4xl`}
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {t("blogInputTitle")}
          </h2>
          <p
            className={`${enter("stagger-2")} mb-9 text-center text-[15px] leading-relaxed text-[var(--color-on-surface-variant)]`}
          >
            {t("blogInputSubtitle")}
          </p>
          <div className={enter("stagger-3")}>
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
    </>
  );
}

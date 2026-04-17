import { useState } from "react";
import { useTranslation } from "react-i18next";

type Platform = "ios" | "android";

interface Shot {
  /** 檔名前綴，對應 apps/web/public/intro/mobile/{view}_view_{platform}_snapshot.png */
  view: "blog_input" | "photo_gallery" | "photo_detail" | "setting";
  /** 圖片下方的標題 i18n key */
  titleKey: string;
  /** 圖片下方的說明 i18n key */
  descKey: string;
}

const SHOTS: Shot[] = [
  {
    view: "blog_input",
    titleKey: "intro.mobile.screenshots.input.title",
    descKey: "intro.mobile.screenshots.input.desc",
  },
  {
    view: "photo_gallery",
    titleKey: "intro.mobile.screenshots.gallery.title",
    descKey: "intro.mobile.screenshots.gallery.desc",
  },
  {
    view: "photo_detail",
    titleKey: "intro.mobile.screenshots.detail.title",
    descKey: "intro.mobile.screenshots.detail.desc",
  },
  {
    view: "setting",
    titleKey: "intro.mobile.screenshots.settings.title",
    descKey: "intro.mobile.screenshots.settings.desc",
  },
];

/**
 * ScreenshotCarousel——iOS/Android 平台切換 tab + 4 張截圖 grid。
 * 圖片路徑用 import.meta.env.BASE_URL 以相容 Pages base path。
 */
export default function ScreenshotCarousel() {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<Platform>("ios");

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <div className="flex gap-0.5 rounded-full bg-[var(--color-surface-container)] p-0.5">
          <button
            type="button"
            onClick={() => setPlatform("ios")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              platform === "ios"
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            }`}
            aria-pressed={platform === "ios"}
          >
            {t("intro.mobile.screenshots.tabIos")}
          </button>
          <button
            type="button"
            onClick={() => setPlatform("android")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              platform === "android"
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            }`}
            aria-pressed={platform === "android"}
          >
            {t("intro.mobile.screenshots.tabAndroid")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {SHOTS.map((shot, idx) => {
          const src = `${import.meta.env.BASE_URL}intro/mobile/${shot.view}_view_${platform}_snapshot.png`;
          return (
            <figure
              key={shot.view}
              className="animate-fade-in-up flex flex-col items-center gap-3 text-center"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="overflow-hidden rounded-3xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] shadow-[var(--shadow-elevated)]">
                <img
                  src={src}
                  alt={t(shot.titleKey)}
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  className="h-auto w-full"
                />
              </div>
              <figcaption>
                <div
                  className="text-sm font-semibold text-[var(--color-on-surface)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t(shot.titleKey)}
                </div>
                <div className="text-xs text-[var(--color-on-surface-variant)]">
                  {t(shot.descKey)}
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

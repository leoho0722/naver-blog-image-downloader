import { useTranslation } from "react-i18next";

type Store = "appStore" | "googlePlay";

interface Props {
  store: Store;
  /** 尚未上架時顯示 Coming Soon，預設為 true（未發布狀態） */
  comingSoon?: boolean;
  /** 若提供下載網址且 comingSoon=false，badge 會以真實連結渲染 */
  href?: string;
}

/**
 * DownloadBadge——App Store / Google Play 下載 badge 的佔位元件。
 * 只有真的有下載連結時才渲染可互動 badge，避免外觀與語意不一致。
 */
export default function DownloadBadge({
  store,
  comingSoon = true,
  href,
}: Props) {
  const { t } = useTranslation();

  const storeLabel = t(`intro.mobile.download.${store}`);
  const reqLabel = t(
    store === "appStore"
      ? "intro.mobile.download.reqIos"
      : "intro.mobile.download.reqAndroid",
  );

  const content = (
    <div className="flex-1">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)]">
        {comingSoon ? t("intro.mobile.download.comingSoon") : ""}
      </div>
      <div
        className="text-base font-bold text-[var(--color-on-surface)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {storeLabel}
      </div>
      <div className="text-xs text-[var(--color-on-surface-variant)]">
        {reqLabel}
      </div>
    </div>
  );

  const baseClass =
    "flex min-w-[180px] items-center gap-3 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] px-5 py-4 shadow-[var(--shadow-soft)]";

  if (href && !comingSoon) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]`}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={`${baseClass} ${comingSoon ? "cursor-not-allowed opacity-70" : ""}`}
      aria-disabled={comingSoon || undefined}
    >
      {content}
    </div>
  );
}

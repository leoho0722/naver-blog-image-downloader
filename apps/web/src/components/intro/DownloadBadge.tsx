import { useTranslation } from "react-i18next";

type Store = "appStore" | "googlePlay";

interface Props {
  store: Store;
  /** 尚未上架時顯示 Coming Soon，預設為 true（未發布狀態） */
  comingSoon?: boolean;
}

/**
 * DownloadBadge——App Store / Google Play 下載 badge 的佔位元件。
 * App 尚未上架時顯示「Coming Soon」，pointer-events: none 避免誤點。
 */
export default function DownloadBadge({ store, comingSoon = true }: Props) {
  const { t } = useTranslation();

  const storeLabel = t(`intro.mobile.download.${store}`);
  const reqLabel = t(
    store === "appStore"
      ? "intro.mobile.download.reqIos"
      : "intro.mobile.download.reqAndroid",
  );

  return (
    <div
      className={`flex min-w-[180px] items-center gap-3 rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] px-5 py-4 shadow-[var(--shadow-soft)] ${
        comingSoon ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      }`}
      aria-disabled={comingSoon}
    >
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
    </div>
  );
}

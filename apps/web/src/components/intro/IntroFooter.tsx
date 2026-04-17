import { useTranslation } from "react-i18next";

export default function IntroFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-24 border-t border-[var(--color-outline-variant)]/30">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-[var(--color-on-surface-variant)] sm:flex-row">
        <p>{t("intro.footer.copyright")}</p>
        <a
          href="https://github.com/leoho0722/naver-blog-image-downloader"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-[var(--color-primary)]"
        >
          {t("intro.footer.github")}
        </a>
      </div>
    </footer>
  );
}

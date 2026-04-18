import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PUBLIC_FOOTER_LINKS } from "../../lib/config/public-navigation";

export default function IntroFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-24 border-t border-[var(--color-outline-variant)]/30">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-[var(--color-on-surface-variant)] sm:flex-row">
        <p>{t("intro.footer.copyright")}</p>
        <nav className="flex items-center gap-4">
          {PUBLIC_FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-[var(--color-primary)]"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <a
            href="https://github.com/leoho0722/naver-blog-image-downloader"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--color-primary)]"
          >
            {t("intro.footer.github")}
          </a>
        </nav>
      </div>
    </footer>
  );
}

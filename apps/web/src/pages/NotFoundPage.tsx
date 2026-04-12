import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p
        className="text-5xl font-bold text-[var(--color-outline-variant)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        404
      </p>
      <p className="text-sm text-[var(--color-on-surface-variant)]">
        {t("notFound")}
      </p>
      <Link
        to="/"
        className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-container)]/60"
      >
        {t("appTitle")}
      </Link>
    </div>
  );
}

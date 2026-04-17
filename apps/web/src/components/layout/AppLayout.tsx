import { useTranslation } from "react-i18next";
import { Outlet, Link } from "react-router-dom";

import ThemeLocaleControls from "./ThemeLocaleControls";

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="bg-noise mx-auto min-h-screen max-w-5xl px-5">
      <header className="animate-fade-in flex items-center gap-3 border-b border-[var(--color-outline-variant)]/30 py-5">
        <Link
          to="/app/web"
          className="mr-auto text-lg tracking-tight"
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
          }}
        >
          {t("appTitle")}
          <span className="ml-1.5 text-xs text-[var(--color-on-surface-variant)]">
            v{__APP_VERSION__}
          </span>
        </Link>
        <ThemeLocaleControls />
      </header>
      <main className="relative z-1">
        <Outlet />
      </main>
    </div>
  );
}

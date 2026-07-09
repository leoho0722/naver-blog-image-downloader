import { useTranslation } from "react-i18next";
import { Outlet, Link } from "react-router-dom";

import AppHeaderControls from "./AppHeaderControls";

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="bg-noise min-h-screen">
      <header className="animate-fade-in relative z-8 flex h-16 items-center gap-3 border-b border-[var(--color-outline-variant)]/60 px-5 sm:px-8">
        <Link
          to="/app/web"
          className="mr-auto flex items-center gap-2.5"
          aria-label={t("appTitle")}
        >
          {/* 兩色圓點標誌：陶土橘 + 鼠尾草綠 */}
          <span className="flex items-center">
            <span className="h-4 w-4 rounded-full bg-[var(--color-primary)]" />
            <span className="-ml-1.5 h-4 w-4 rounded-full bg-[var(--color-secondary)] opacity-85" />
          </span>
          <span
            className="text-[var(--color-on-surface)]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {t("appTitle")}
          </span>
          <span className="mt-0.5 text-xs text-[var(--color-on-surface-variant)]">
            v{__APP_VERSION__}
          </span>
        </Link>
        <AppHeaderControls />
      </header>
      <main className="relative z-1 mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}

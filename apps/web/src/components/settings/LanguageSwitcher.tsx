import {
  useSettingsStore,
  type AppLocale,
} from "../../lib/stores/use-settings-store";

const LOCALES: { value: AppLocale; label: string }[] = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

export default function LanguageSwitcher() {
  const { locale, updateLocale } = useSettingsStore();

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[var(--color-on-surface)]">
        語言
      </p>
      <div className="space-y-1">
        {LOCALES.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => updateLocale(l.value)}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
              locale === l.value
                ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                : "text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
            }`}
          >
            {l.label}
            {locale === l.value && (
              <svg
                className="ml-auto h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

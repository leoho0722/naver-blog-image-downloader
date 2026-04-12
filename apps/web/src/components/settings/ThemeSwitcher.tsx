import {
  useSettingsStore,
  type ThemeMode,
} from "../../lib/stores/use-settings-store";

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "系統" },
  { value: "light", label: "亮色" },
  { value: "dark", label: "暗色" },
];

export default function ThemeSwitcher() {
  const { theme, updateTheme } = useSettingsStore();

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[var(--color-on-surface)]">
        主題
      </p>
      <div className="flex gap-1 rounded-lg bg-[var(--color-surface-container)] p-1">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => updateTheme(t.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
              theme === t.value
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  desc: string;
}

/**
 * FeatureCard——feature 區塊的單張卡片。
 * 在 IntroRootPage、IntroMobilePage、IntroWebPage 共用，
 * 外觀為 M3 filled card：icon + 標題 + 描述。
 */
export default function FeatureCard({ icon, title, desc }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] p-6 shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
        {icon}
      </div>
      <h3
        className="mb-1.5 text-base font-bold text-[var(--color-on-surface)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
        {desc}
      </p>
    </div>
  );
}

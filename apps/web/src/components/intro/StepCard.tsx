import type { ReactNode } from "react";

interface Props {
  stepNumber: number;
  icon: ReactNode;
  title: string;
  desc: string;
}

/**
 * StepCard——how-it-works 區塊的單一步驟卡片。
 * 左上顯示步驟編號（01、02…），搭配 icon 與標題、描述。
 */
export default function StepCard({ stepNumber, icon, title, desc }: Props) {
  const label = String(stepNumber).padStart(2, "0");

  return (
    <div className="relative rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)] p-6 shadow-[var(--shadow-soft)]">
      <span
        className="absolute right-5 top-5 text-2xl text-[var(--color-primary)] opacity-40"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
      >
        {label}
      </span>
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

/**
 * PrivacyPolicySection — 渲染單一隱私政策章節。
 *
 * 每個章節包含標題（`title`）與內文（`body`）；
 * `body` 允許為字串（單段落）或字串陣列（多段落），陣列會逐項渲染為 `<p>`。
 */
export interface PrivacyPolicySectionProps {
  /** section 對應的穩定 id，會用於 heading 的 anchor */
  id: string;
  /** 章節標題 */
  title: string;
  /** 章節內文，字串為單段落，字串陣列則每項各自成為一個段落 */
  body: string | string[];
}

export default function PrivacyPolicySection({
  id,
  title,
  body,
}: PrivacyPolicySectionProps) {
  const paragraphs = Array.isArray(body) ? body : [body];

  return (
    <section
      id={`privacy-${id}`}
      aria-labelledby={`privacy-${id}-title`}
      className="scroll-mt-24"
    >
      <h2
        id={`privacy-${id}-title`}
        className="mb-3 text-xl font-semibold tracking-tight text-[var(--color-on-surface)] sm:text-2xl"
      >
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--color-on-surface-variant)] sm:text-base">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

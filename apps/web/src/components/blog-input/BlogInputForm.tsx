import { useCallback, useState, type DragEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { isValid } from "../../lib/services/url-validator";
import { useBlogInputStore } from "../../lib/stores/use-blog-input-store";

export default function BlogInputForm() {
  const { t } = useTranslation();
  const { blogUrl, setUrl, fetchPhotos, fetchPhase, error } =
    useBlogInputStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const isLoading = fetchPhase === "submitting" || fetchPhase === "processing";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLoading) fetchPhotos();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setUrl(text.trim());
      }
    } catch {
      // 剪貼簿權限未授權
    }
  };

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const text = e.dataTransfer.getData("text/plain").trim();
      if (text && isValid(text)) {
        setUrl(text);
      }
    },
    [setUrl],
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const ERROR_KEYS: Record<string, string> = {
    emptyUrl: "errorEmptyUrl",
    invalidUrl: "errorInvalidUrl",
    timeout: "errorTimeout",
    serverUnavailable: "errorServerUnavailable",
    serverError: "errorServerError",
    networkError: "errorNetworkError",
    unknown: "errorGeneric",
  };

  const errorMessage = error
    ? (error.message ?? t(ERROR_KEYS[error.type] ?? "errorGeneric"))
    : null;

  return (
    <form
      onSubmit={handleSubmit}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="w-full"
    >
      <div
        className={`flex gap-2 rounded-2xl border p-1.5 transition-all duration-300 ${
          isDragOver
            ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]/50 scale-[1.01]"
            : "border-[var(--color-outline-variant)]/60 bg-[var(--color-surface-container)]/50"
        }`}
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <input
          type="url"
          value={blogUrl}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("blogInputUrlHint")}
          disabled={isLoading}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-[var(--color-outline)]"
        />
        <button
          type="button"
          onClick={handlePaste}
          disabled={isLoading}
          className="shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-all duration-200 hover:bg-[var(--color-primary-container)]/70 active:scale-95 disabled:opacity-40"
          aria-label={t("blogInputPaste")}
        >
          {t("blogInputPaste")}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="shrink-0 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-40"
          style={{
            boxShadow: isLoading ? "none" : "0 2px 8px rgba(21, 101, 192, 0.3)",
          }}
        >
          {isLoading ? t("blogInputFetching") : t("blogInputFetchButton")}
        </button>
      </div>
      {errorMessage && (
        <p className="animate-fade-in mt-3 text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

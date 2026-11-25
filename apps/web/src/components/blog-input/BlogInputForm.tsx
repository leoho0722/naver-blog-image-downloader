import {
  useCallback,
  useId,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";

import { isValid } from "../../lib/services/url-validator";
import { useBlogInputStore } from "../../lib/stores/use-blog-input-store";

export default function BlogInputForm() {
  const { t } = useTranslation();
  const { blogUrl, setUrl, fetchPhotos, fetchPhase, error } =
    useBlogInputStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const isLoading = fetchPhase === "submitting" || fetchPhase === "processing";
  const inputId = useId();
  const errorId = useId();

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
  // 只有「沒填」與「格式不對」是輸入框本身的問題；網路或伺服器錯誤不標成輸入錯誤
  const isInputInvalid =
    error?.type === "emptyUrl" || error?.type === "invalidUrl";

  return (
    <form
      // 關掉瀏覽器內建的網址格式檢查：不然輸入少了 https:// 的網址時，
      // 會先跳出瀏覽器自己的提示泡泡，而不是 App 的多語系錯誤訊息
      noValidate
      onSubmit={handleSubmit}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="w-full"
    >
      <div
        className={`flex items-center gap-1.5 rounded-[22px] border p-[7px] transition-all duration-300 ${
          isDragOver
            ? "scale-[1.01] border-[var(--color-primary)] bg-[var(--color-primary-container)]/50"
            : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]"
        }`}
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {/* 視覺上隱藏、但螢幕報讀器會唸的欄位名稱；placeholder 只是格式提示，打字後就消失了 */}
        <label htmlFor={inputId} className="sr-only">
          {t("blogInputUrlLabel")}
        </label>
        <input
          id={inputId}
          name="blogUrl"
          type="url"
          required
          value={blogUrl}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("blogInputUrlHint")}
          disabled={isLoading}
          // 網址不是一般文字：關掉自動大寫、自動校正與拼字檢查；手機鍵盤的 Enter 顯示「前往」
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={isInputInvalid || undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          // 字級至少 16px，iOS Safari 聚焦輸入框時才不會自動放大整個畫面
          className="min-w-0 flex-1 bg-transparent px-[18px] py-[13px] text-base outline-none placeholder:text-[var(--color-outline)]"
        />
        <button
          type="button"
          onClick={handlePaste}
          disabled={isLoading}
          className="shrink-0 rounded-full px-3 text-[13.5px] font-semibold text-[var(--color-primary)] transition-all duration-200 hover:bg-[var(--color-primary-container)]/60 disabled:opacity-40"
        >
          {t("blogInputPaste")}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="shrink-0 rounded-full bg-[var(--color-primary)] px-[26px] py-[13px] text-[14.5px] font-bold text-[var(--color-on-primary)] transition-all duration-200 hover:brightness-[1.07] active:scale-95 disabled:opacity-55"
          style={{
            boxShadow: isLoading
              ? "none"
              : "0 4px 14px var(--color-primary-glow)",
          }}
        >
          {isLoading ? t("blogInputFetching") : t("blogInputFetchButton")}
        </button>
      </div>
      {errorMessage && (
        // role="alert"：錯誤一出現就主動唸給螢幕報讀器使用者聽；輸入框也透過 aria-describedby 連到這段文字
        <p
          id={errorId}
          role="alert"
          className="animate-fade-in mt-4 text-center text-[13.5px] text-[var(--color-error)]"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
}

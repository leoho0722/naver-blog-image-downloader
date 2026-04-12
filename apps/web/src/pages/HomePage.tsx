import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import BlogInputForm from "../components/blog-input/BlogInputForm";
import FetchProgress from "../components/blog-input/FetchProgress";
import { useClipboard } from "../lib/hooks/use-clipboard";
import { useBlogInputStore } from "../lib/stores/use-blog-input-store";

export default function HomePage() {
  const { t } = useTranslation();
  const { fetchPhase, fetchResult, jobId, setUrl, reset } =
    useBlogInputStore();
  const navigate = useNavigate();
  const hasResetRef = useRef(false);

  useEffect(() => {
    if (!hasResetRef.current && fetchPhase === "completed") {
      hasResetRef.current = true;
      reset();
      return;
    }

    if (fetchPhase === "completed" && fetchResult) {
      navigate(`/gallery/${fetchResult.blogId}`, {
        state: { fetchResult, jobId },
      });
    }
  }, [fetchPhase, fetchResult, jobId, navigate, reset]);

  useClipboard({
    onNaverUrlDetected: (url) => setUrl(url),
    enabled: fetchPhase === "idle",
  });

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <h2
          className="animate-fade-in-up mb-3 text-center text-3xl tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {t("blogInputTitle")}
        </h2>
        <p className="animate-fade-in-up stagger-1 mb-10 text-center text-[15px] leading-relaxed text-[var(--color-on-surface-variant)]">
          {t("blogInputSubtitle")}
        </p>
        <div className="animate-fade-in-up stagger-2">
          <BlogInputForm />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <FetchProgress phase={fetchPhase} />
        </div>
      </div>
    </div>
  );
}

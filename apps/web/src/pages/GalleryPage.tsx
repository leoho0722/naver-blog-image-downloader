import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import DownloadProgress from "../components/download/DownloadProgress";
import ImageViewer from "../components/gallery/ImageViewer";
import PhotoGrid from "../components/gallery/PhotoGrid";
import SelectionToolbar from "../components/gallery/SelectionToolbar";
import type { FetchResult, PhotoEntity } from "../lib/api/types";
import { useDownloadStore } from "../lib/stores/use-download-store";
import { useGalleryStore } from "../lib/stores/use-gallery-store";

export default function GalleryPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const photos = useGalleryStore((s) => s.photos);
  const jobId = useGalleryStore((s) => s.jobId);
  const blogId = useGalleryStore((s) => s.blogId);
  const blogUrl = useGalleryStore((s) => s.blogUrl);
  const load = useGalleryStore((s) => s.load);
  const startPackaging = useDownloadStore((s) => s.startPackaging);
  const resetDownload = useDownloadStore((s) => s.reset);
  const downloadPhase = useDownloadStore((s) => s.downloadPhase);
  const [viewerPhoto, setViewerPhoto] = useState<{ index: number } | null>(
    null,
  );
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    const state = location.state as { fetchResult?: FetchResult } | null;
    if (state?.fetchResult) {
      const { fetchResult } = state;
      const jid = (location.state as Record<string, unknown>)?.jobId as
        | string
        | undefined;
      load(
        fetchResult.photos,
        fetchResult.blogId,
        jid ?? "",
        fetchResult.blogUrl,
      );
      loadedRef.current = true;
    } else if (photos.length === 0) {
      navigate("/app/web");
    }
  }, [location.state, load, navigate, photos.length]);

  const handleViewPhoto = useCallback(
    (photo: PhotoEntity) => {
      const index = photos.findIndex((p) => p.id === photo.id);
      setViewerPhoto({ index });
    },
    [photos],
  );

  const handleDownloadAll = useCallback(() => {
    if (jobId) startPackaging(jobId);
  }, [jobId, startPackaging]);

  const handleDownloadSelected = useCallback(() => {
    if (!jobId) return;
    const ids = useGalleryStore.getState().selectedIds;
    const indices = photos
      .map((p, i) => (ids.has(p.id) ? i : -1))
      .filter((i) => i >= 0);
    startPackaging(jobId, indices);
  }, [jobId, photos, startPackaging]);

  const handleCloseDownload = useCallback(() => {
    resetDownload();
  }, [resetDownload]);

  if (photos.length === 0) return null;

  const displayUrl = blogUrl.replace(/^https?:\/\//, "");

  return (
    <div>
      {/* 文章來源標頭 */}
      <div className="animate-fade-in flex flex-wrap items-baseline gap-x-2.5 gap-y-1 px-1 pt-4 pb-1">
        <span
          className="text-[21px] text-[var(--color-on-surface)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          {t("galleryArticleTitle", { blogId })}
        </span>
        {displayUrl && (
          <span className="min-w-0 max-w-full truncate text-[12.5px] text-[var(--color-on-surface-variant)]">
            {displayUrl}
          </span>
        )}
        <button
          type="button"
          onClick={() => navigate("/app/web")}
          className="ml-auto shrink-0 rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]"
        >
          {t("galleryChangeArticle")} →
        </button>
      </div>

      <SelectionToolbar
        onDownloadAll={handleDownloadAll}
        onDownloadSelected={handleDownloadSelected}
      />
      <PhotoGrid onViewPhoto={handleViewPhoto} />

      {viewerPhoto !== null && (
        <ImageViewer
          photos={photos}
          initialIndex={viewerPhoto.index}
          onClose={() => setViewerPhoto(null)}
          onDownload={(index) => {
            if (jobId) startPackaging(jobId, [index]);
          }}
        />
      )}

      {downloadPhase !== "idle" && (
        <DownloadProgress onClose={handleCloseDownload} />
      )}
    </div>
  );
}

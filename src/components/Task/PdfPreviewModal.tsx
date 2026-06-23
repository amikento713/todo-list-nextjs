"use client";

import { useEffect, useMemo } from "react";

import styles from "./PdfPreviewModal.module.css";

interface PdfPreviewModalProps {
  url: string;
  fileName: string;
  onClose: () => void;
}

function buildViewerUrl(url: string): string {
  if (url.startsWith("data:")) {
    return url;
  }

  return url;
}

export default function PdfPreviewModal({
  url,
  fileName,
  onClose,
}: PdfPreviewModalProps) {
  const viewerUrl = useMemo(() => buildViewerUrl(url), [url]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOpenInNewTab = () => {
    window.open(viewerUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = viewerUrl;
    link.download = fileName;
    link.rel = "noopener";
    link.click();
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
      >
        <header className={styles.toolbar}>
          <div className={styles.fileInfo}>
            <span className={styles.pdfBadge} aria-hidden="true">
              PDF
            </span>
            <span id="pdf-preview-title" className={styles.fileName}>
              {fileName}
            </span>
          </div>

          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleOpenInNewTab}
            >
              Open in tab
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleDownload}
            >
              Download
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </header>

        <div className={styles.viewer}>
          {viewerUrl ? (
            <iframe
              src={viewerUrl}
              title={`PDF preview: ${fileName}`}
              className={styles.frame}
            />
          ) : (
            <div className={styles.fallback}>
              <p>Unable to load this PDF inline.</p>
              <button
                type="button"
                className={styles.fallbackLink}
                onClick={handleOpenInNewTab}
              >
                Open in a new tab
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

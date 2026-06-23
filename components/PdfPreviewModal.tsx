"use client";

import { useEffect } from "react";
import styles from "../styles/Todo.module.css";

interface PdfPreviewModalProps {
  url: string;
  onClose: () => void;
}

export default function PdfPreviewModal({
  url,
  onClose,
}: PdfPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.modal}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="PDF preview"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
        >
          Close
        </button>

        <iframe
          src={url}
          title="PDF Preview"
          className={styles.pdfFrame}
        />
      </div>
    </div>
  );
}

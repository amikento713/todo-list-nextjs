"use client";

import styles from "../styles/Todo.module.css";

interface PdfPreviewModalProps {
    url: string;
    onClose: () => void;
}

export default function PdfPreviewModal({
    url,
    onClose,
}: PdfPreviewModalProps) {
    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <button
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    Close
                </button>

                <iframe
                    src={url}
                    title="PDF Preview"
                    style={{
                        width: "100%",
                        height: "600px",
                        border: "none",
                    }}
                />
            </div>
        </div>
    );
}
"use client";

import { Book } from "../types/task";
import styles from "../styles/Todo.module.css";

interface BookActionsProps {
  book: Book;
  onPreview: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function BookActions({
  book,
  onPreview,
  onRemove,
  disabled = false,
}: BookActionsProps) {
  return (
    <div className={styles.bookButtons}>
      <button
        type="button"
        className={`${styles.bookButton} ${styles.previewButton}`}
        onClick={() => onPreview(book.url)}
        disabled={disabled}
      >
        Preview
      </button>
      <button
        type="button"
        className={`${styles.bookButton} ${styles.readButton}`}
        onClick={() => window.open(book.url, "_blank", "noopener,noreferrer")}
        disabled={disabled}
      >
        Open
      </button>
      <button
        type="button"
        className={`${styles.bookButton} ${styles.deleteIcon}`}
        onClick={onRemove}
        disabled={disabled}
      >
        Remove
      </button>
    </div>
  );
}

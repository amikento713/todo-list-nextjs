"use client";

import { Book } from "../types/task";
import styles from "../styles/Todo.module.css";

interface BookActionsProps {
  taskId: number;
  book: Book;
  onPreview: (url: string) => void;
  onRemoveBook: (
    taskId: number
  ) => void;
}

export default function BookActions({
  taskId,
  book,
  onPreview,
  onRemoveBook,
}: BookActionsProps) {
  return (
    <div className={styles.bookButtons}>
      <button
        className={`${styles.bookButton} ${styles.readButton}`}
        onClick={() =>
          window.open(book.url, "_blank")
        }
      >
        📖 Read
      </button>

      <button
        className={`${styles.bookButton} ${styles.previewButton}`}
        onClick={() =>
          onPreview(book.url)
        }
      >
        👀 Preview
      </button>

      <button
        className={`${styles.bookButton} ${styles.removeBookButton}`}
        onClick={() =>
          onRemoveBook(taskId)
        }
      >
        🗑 Remove
      </button>
    </div>
  );
}
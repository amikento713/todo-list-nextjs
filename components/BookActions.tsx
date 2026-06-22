"use client";

import { Book } from "../types/task";
import styles from "../styles/Todo.module.css";

interface BookActionsProps {
  taskId: number;
  book: Book;
  onPreview: (url: string) => void;
}

export default function BookActions({
  taskId,
  book,
  onPreview,
}: BookActionsProps) {
  return (
    <div className={styles.bookButtons}>
      <button
        className={`${styles.bookButton} ${styles.previewButton}`}
        onClick={() => onPreview(book.url)}
      >👀</button>
      <button
        className={`${styles.bookButton} ${styles.readButton}`}
        onClick={() => window.open(book.url, "_blank")}
      >📖</button>
    </div>
  );
}
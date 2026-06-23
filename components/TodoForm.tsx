"use client";

import { useRef, useState } from "react";
import styles from "../styles/Todo.module.css";
import { MAX_TASK_TEXT_LENGTH } from "../types/task";

interface TodoFormProps {
  onAddTask: (
    task: string,
    deadline: string,
    book: File | null
  ) => void | Promise<void>;
  disabled?: boolean;
}

export default function TodoForm({ onAddTask, disabled = false }: TodoFormProps) {
  const [task, setTask] = useState("");
  const [selectedBook, setSelectedBook] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [deadline, setDeadline] = useState(getTomorrowDate());

  const resetFileInput = () => {
    setSelectedBook(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTask = task.trim();
    if (!trimmedTask) {
      setFormError("Task description is required");
      return;
    }

    if (trimmedTask.length > MAX_TASK_TEXT_LENGTH) {
      setFormError(
        `Task description must be at most ${MAX_TASK_TEXT_LENGTH} characters`
      );
      return;
    }

    if (!deadline) {
      setFormError("Deadline is required");
      return;
    }

    await onAddTask(trimmedTask, deadline, selectedBook);
    setTask("");
    resetFileInput();
    setDeadline(getTomorrowDate());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputRow}>
        <div className={styles.fieldGroup}>
          <label htmlFor="task-description">Task Description</label>
          <input
            id="task-description"
            type="text"
            placeholder="Task Description"
            value={task}
            maxLength={MAX_TASK_TEXT_LENGTH}
            onChange={(e) => setTask(e.target.value)}
            className={styles.input}
            disabled={disabled}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="task-deadline">Deadline</label>
          <input
            id="task-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={styles.dateInput}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className={styles.uploadRow}>
        <div className={styles.uploadHeader}>
          <label className={styles.uploadLabel} htmlFor="book-upload">
            Upload PDF (optional)
          </label>
          <label
            htmlFor="book-upload"
            className={`${styles.bookButton} ${styles.previewButton}`}
          >
            Upload PDF
          </label>
        </div>

        <input
          id="book-upload"
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className={styles.fileInput}
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setFormError(null);

            if (!file) {
              setSelectedBook(null);
              return;
            }

            if (
              file.type !== "application/pdf" &&
              !file.name.toLowerCase().endsWith(".pdf")
            ) {
              setFormError("Only PDF files are allowed.");
              resetFileInput();
              return;
            }

            if (file.size > 20 * 1024 * 1024) {
              setFormError("PDF must be 20MB or smaller.");
              resetFileInput();
              return;
            }

            setSelectedBook(file);
          }}
        />

        {selectedBook && (
          <div className={styles.selectedFile}>Selected: {selectedBook.name}</div>
        )}

        {formError && <div className={styles.formError}>{formError}</div>}

        <div className={styles.submitRow}>
          <button type="submit" className={styles.button} disabled={disabled}>
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}

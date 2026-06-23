"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { Book } from "../../types/todo";
import {
  DEFAULT_TASK_PRIORITY,
  MAX_TASK_TEXT_LENGTH,
  TaskPriority,
} from "../../types/todo";
import styles from "./TaskForm.module.css";

export interface TaskFormSubmitPayload {
  text: string;
  deadline: string;
  priority: TaskPriority;
  book?: Book;
}

interface TaskFormProps {
  onSubmit: (payload: TaskFormSubmitPayload) => void | Promise<void>;
  onPreviewPdf?: (url: string, fileName: string) => void;
  disabled?: boolean;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function getDefaultDeadline(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read file."));
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export default function TaskForm({
  onSubmit,
  onPreviewPdf,
  disabled = false,
}: TaskFormProps) {
  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState(getDefaultDeadline);
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_TASK_PRIORITY);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const resetFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF files are allowed.");
      resetFileInput();
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("PDF must be 20MB or smaller.");
      resetFileInput();
      return;
    }

    setSelectedFile(file);
  };

  const handlePreview = () => {
    if (!selectedFile || !previewUrl || !onPreviewPdf) {
      return;
    }

    onPreviewPdf(previewUrl, selectedFile.name);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedText = text.trim();
    if (!trimmedText) {
      setError("Task text is required.");
      return;
    }

    if (trimmedText.length > MAX_TASK_TEXT_LENGTH) {
      setError(`Task text must be at most ${MAX_TASK_TEXT_LENGTH} characters.`);
      return;
    }

    if (!deadline) {
      setError("Deadline is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      let book: Book | undefined;

      if (selectedFile) {
        const dataUrl = await readFileAsDataUrl(selectedFile);
        book = { name: selectedFile.name, url: dataUrl };
      }

      await onSubmit({ text: trimmedText, deadline, priority, book });
      setText("");
      setDeadline(getDefaultDeadline());
      setPriority(DEFAULT_TASK_PRIORITY);
      resetFileInput();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to add task."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>Add New Task</h3>

      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="task-text">
            Task
          </label>
          <input
            id="task-text"
            type="text"
            className={styles.input}
            placeholder="What needs to be done?"
            value={text}
            maxLength={MAX_TASK_TEXT_LENGTH}
            onChange={(event) => setText(event.target.value)}
            disabled={disabled || isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="task-deadline">
            Deadline
          </label>
          <input
            id="task-deadline"
            type="date"
            className={styles.input}
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            disabled={disabled || isSubmitting}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            className={styles.select}
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority)}
            disabled={disabled || isSubmitting}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.uploadRow}>
        <span className={styles.label}>Attach PDF (optional)</span>

        {selectedFile ? (
          <div className={styles.fileChip}>
            <span className={styles.fileChipIcon} aria-hidden="true">
              PDF
            </span>
            <span className={styles.fileMeta}>{selectedFile.name}</span>
            <div className={styles.fileActions}>
              {onPreviewPdf && (
                <button
                  type="button"
                  className={`${styles.fileActionButton} ${styles.fileActionButtonPrimary}`}
                  onClick={handlePreview}
                  disabled={disabled || isSubmitting}
                >
                  Read PDF
                </button>
              )}
              <button
                type="button"
                className={`${styles.fileActionButton} ${styles.fileActionButtonDanger}`}
                onClick={resetFileInput}
                disabled={disabled || isSubmitting}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.filePicker}>
            <input
              id="task-pdf"
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className={styles.hiddenFileInput}
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              disabled={disabled || isSubmitting}
            />
            <button
              type="button"
              className={styles.chooseFileButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isSubmitting}
            >
              Choose PDF file
            </button>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}

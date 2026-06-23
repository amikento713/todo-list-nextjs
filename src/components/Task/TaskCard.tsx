"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

import { formatDeadlineLabel, getDeadlineCategory } from "../../lib/deadlineUtils";
import { Book, Task, TaskPriority, UpdateTaskInput } from "../../types/todo";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string, input: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  onPreviewPdf: (url: string, fileName: string) => void;
  disabled?: boolean;
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  low: styles.priorityLow,
  medium: styles.priorityMedium,
  high: styles.priorityHigh,
  urgent: styles.priorityUrgent,
};

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4l10.5-10.5a1.8 1.8 0 0 0 0-2.5l-1.5-1.5a1.8 1.8 0 0 0-2.5 0L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M9 7V5h6v2m-1 4v6M11 11v6M13 11v6M6 7l1 12h10l1-12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onPreviewPdf,
  disabled = false,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDeadline, setEditDeadline] = useState(task.deadline);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editBook, setEditBook] = useState<Book | undefined>(task.book);
  const [editError, setEditError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditText(task.text);
      setEditDeadline(task.deadline);
      setEditPriority(task.priority);
      setEditBook(task.book);
      setEditError(null);
    }
  }, [task.text, task.deadline, task.priority, task.book, isEditing]);

  const deadlineCategory = getDeadlineCategory(task.deadline, task.completed);
  const deadlineLabel = formatDeadlineLabel(task.deadline);

  const handleSaveEdit = async () => {
    setEditError(null);

    try {
      onEdit(task.id, {
        text: editText.trim(),
        deadline: editDeadline,
        priority: editPriority,
        book: editBook,
      });
      setIsEditing(false);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to save task.");
    }
  };

  const handleEditFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setEditError(null);

    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setEditError("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setEditError("PDF must be 20MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditBook({ name: file.name, url: dataUrl });
    } catch {
      setEditError("Failed to read PDF file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleOpenPdf = () => {
    if (!task.book) {
      return;
    }

    onPreviewPdf(task.book.url, task.book.name);
  };

  if (isEditing) {
    return (
      <article className={styles.card}>
        <div className={styles.editForm}>
          <input
            className={styles.editInput}
            value={editText}
            onChange={(event) => setEditText(event.target.value)}
            disabled={disabled}
          />
          <input
            type="date"
            className={styles.editInput}
            value={editDeadline}
            onChange={(event) => setEditDeadline(event.target.value)}
            disabled={disabled}
          />
          <select
            className={styles.editSelect}
            value={editPriority}
            onChange={(event) =>
              setEditPriority(event.target.value as TaskPriority)
            }
            disabled={disabled}
          >
            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>

          <div className={styles.editFileRow}>
            <span className={styles.editFileMeta}>
              {editBook ? `Attached: ${editBook.name}` : "No PDF attached"}
            </span>
            <div className={styles.editFileActions}>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className={styles.hiddenFileInput}
                onChange={handleEditFileChange}
                disabled={disabled}
              />
              <button
                type="button"
                className={styles.previewButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                {editBook ? "Replace PDF" : "Attach PDF"}
              </button>
              {editBook && (
                <>
                  <button
                    type="button"
                    className={styles.previewButton}
                    onClick={() => onPreviewPdf(editBook.url, editBook.name)}
                    disabled={disabled}
                  >
                    Read PDF
                  </button>
                  <button
                    type="button"
                    className={`${styles.previewButton} ${styles.iconButtonDanger}`}
                    onClick={() => setEditBook(undefined)}
                    disabled={disabled}
                  >
                    Remove PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {editError && <p className={styles.editError}>{editError}</p>}

          <div className={styles.editActions}>
            <button
              type="button"
              className={styles.editSave}
              onClick={handleSaveEdit}
              disabled={disabled}
            >
              Save
            </button>
            <button
              type="button"
              className={styles.editCancel}
              onClick={() => setIsEditing(false)}
              disabled={disabled}
            >
              Cancel
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`${styles.card} ${task.completed ? styles.cardCompleted : ""}`}
    >
      <div className={styles.mainRow}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          disabled={disabled}
          aria-label={`Mark "${task.text}" as ${
            task.completed ? "incomplete" : "complete"
          }`}
        />

        <p
          className={`${styles.title} ${
            task.completed ? styles.titleCompleted : ""
          }`}
        >
          {task.text}
        </p>

        <div className={styles.rightSection}>
          <span className={`${styles.badge} ${PRIORITY_CLASS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>

          <span
            className={`${styles.deadlineBadge} ${
              deadlineCategory === "overdue" ? styles.deadlineOverdue : ""
            }`}
          >
            {deadlineLabel}
          </span>

          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            aria-label={`Edit ${task.text}`}
          >
            <EditIcon />
          </button>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            onClick={() => onDelete(task.id)}
            disabled={disabled}
            aria-label={`Delete ${task.text}`}
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      {task.book && (
        <div
          className={`${styles.bookRow} ${styles.bookRowInteractive}`}
          onClick={handleOpenPdf}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleOpenPdf();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Read attached PDF ${task.book.name}`}
        >
          <span className={styles.pdfIcon} aria-hidden="true">
            PDF
          </span>
          <span className={styles.bookName}>{task.book.name}</span>
          <button
            type="button"
            className={styles.previewButton}
            onClick={(event) => {
              event.stopPropagation();
              handleOpenPdf();
            }}
            disabled={disabled}
          >
            Read PDF
          </button>
        </div>
      )}
    </article>
  );
}

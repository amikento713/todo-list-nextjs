"use client";

import styles from "../styles/Todo.module.css";
import { MAX_TASK_TEXT_LENGTH } from "../types/task";

interface EditTaskFormProps {
  text: string;
  deadline: string;
  onTextChange: (value: string) => void;
  onDeadlineChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function EditTaskForm({
  text,
  deadline,
  onTextChange,
  onDeadlineChange,
  onSave,
  onCancel,
  disabled = false,
}: EditTaskFormProps) {
  const handleSave = () => {
    if (!text.trim()) {
      return;
    }
    onSave();
  };

  return (
    <div className={styles.editContainer}>
      <input
        type="text"
        value={text}
        maxLength={MAX_TASK_TEXT_LENGTH}
        onChange={(e) => onTextChange(e.target.value)}
        className={styles.editInput}
        disabled={disabled}
      />

      <input
        type="date"
        value={deadline}
        onChange={(e) => onDeadlineChange(e.target.value)}
        className={styles.editDateInput}
        disabled={disabled}
        required
      />

      <div className={styles.actionButtons}>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={disabled || !text.trim()}
        >
          Save
        </button>

        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

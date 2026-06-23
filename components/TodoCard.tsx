"use client";

import { useEffect, useState } from "react";
import { Task } from "../types/task";
import { isOverdue } from "../lib/taskUtils";
import styles from "../styles/Todo.module.css";
import EditTaskForm from "./EditTaskForm";
import BookActions from "./BookActions";

interface TodoCardProps {
  task: Task;
  onDeleteTask: (id: number) => void;
  onToggleTask: (id: number) => void;
  onUpdateTask: (id: number, text: string, deadline: string) => void;
  onRemoveBook: (id: number) => void;
  onPreview: (url: string) => void;
  disabled?: boolean;
}

export default function TodoCard({
  task,
  onDeleteTask,
  onToggleTask,
  onUpdateTask,
  onRemoveBook,
  onPreview,
  disabled = false,
}: TodoCardProps) {
  const overdue = isOverdue(task.deadline, task.completed);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDeadline, setEditDeadline] = useState(task.deadline);

  useEffect(() => {
    if (!isEditing) {
      setEditText(task.text);
      setEditDeadline(task.deadline);
    }
  }, [task.text, task.deadline, isEditing]);

  return (
    <div
      className={`${styles.taskCard} ${overdue ? styles.overdueCard : ""}`}
    >
      {isEditing ? (
        <EditTaskForm
          text={editText}
          deadline={editDeadline}
          onTextChange={setEditText}
          onDeadlineChange={setEditDeadline}
          onSave={() => {
            onUpdateTask(task.id, editText.trim(), editDeadline);
            setIsEditing(false);
          }}
          onCancel={() => {
            setEditText(task.text);
            setEditDeadline(task.deadline);
            setIsEditing(false);
          }}
          disabled={disabled}
        />
      ) : (
        <>
          <div className={styles.cardHeader}>
            <div className={styles.taskName}>
              {`Task #${task.id}: ${task.text} (${task.deadline})`}
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setIsEditing(true)}
                title="Edit Task"
                disabled={disabled}
              >
                Edit
              </button>

              <button
                type="button"
                className={`${styles.iconButton} ${styles.deleteIcon}`}
                onClick={() => onDeleteTask(task.id)}
                title="Delete Task"
                disabled={disabled}
              >
                Delete
              </button>
            </div>
          </div>

          <div className={styles.taskDetails}>
            <div className={styles.taskInfo}>
              Status:{" "}
              <span
                className={
                  task.completed
                    ? styles.statusCompleted
                    : styles.statusPending
                }
              >
                {task.completed ? "Completed" : "Pending"}
              </span>
            </div>

            <div
              className={
                overdue ? styles.overdueText : styles.taskInfo
              }
            >
              Deadline: {task.deadline}
              {overdue && " (Overdue)"}
            </div>

            {task.book && (
              <div className={styles.bookPart}>
                <div className={styles.bookInfo}>{task.book.name}</div>
                <BookActions
                  book={task.book}
                  onPreview={onPreview}
                  onRemove={() => onRemoveBook(task.id)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          <div className={styles.checkboxRow}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                disabled={disabled}
              />{" "}
              Complete
            </label>
          </div>
        </>
      )}
    </div>
  );
}

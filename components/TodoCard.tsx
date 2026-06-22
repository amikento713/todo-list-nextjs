"use client";

import { useState } from "react";

import { Task } from "../types/task";

import styles from "../styles/Todo.module.css";

import EditTaskForm from "./EditTaskForm";
import BookActions from "./BookActions";

interface TodoCardProps {
  task: Task;

  onDeleteTask: (id: number) => void;

  onToggleTask: (id: number) => void;

  onUpdateTask: (
    id: number,
    text: string,
    deadline: string
  ) => void;

  onRemoveBook: (id: number) => void;

  onPreview: (url: string) => void;
}

export default function TodoCard({
  task,
  onDeleteTask,
  onToggleTask,
  onUpdateTask,
  onRemoveBook,
  onPreview,
}: TodoCardProps) {
  const today = new Date();

  const isOverdue =
    task.deadline &&
    !task.completed &&
    new Date(task.deadline) < today;

  const [isEditing, setIsEditing] =
    useState(false);

  const [editText, setEditText] =
    useState(task.text);

  const [editDeadline, setEditDeadline] =
    useState(task.deadline);

  return (
    <div
      className={`${styles.taskCard} ${
        isOverdue
          ? styles.overdueCard
          : ""
      }`}
    >
      {isEditing ? (
        <EditTaskForm
          text={editText}
          deadline={editDeadline}
          onTextChange={setEditText}
          onDeadlineChange={
            setEditDeadline
          }
          onSave={() => {
            onUpdateTask(
              task.id,
              editText,
              editDeadline
            );

            setIsEditing(false);
          }}
          onCancel={() =>
            setIsEditing(false)
          }
        />
      ) : (
        <>
          {/* Header */}
          <div
            className={
              styles.cardHeader
            }
          >
            <div
              className={
                task.completed
                  ? styles.completed
                  : styles.taskName
              }
            >
              {task.text}
            </div>

            <div
              className={
                styles.headerActions
              }
            >
              <button
                className={
                  styles.iconButton
                }
                onClick={() =>
                  setIsEditing(true)
                }
                title="Edit Task"
              >
                ✏️
              </button>

              <button
                className={`${styles.iconButton} ${styles.deleteIcon}`}
                onClick={() =>
                  onDeleteTask(
                    task.id
                  )
                }
                title="Delete Task"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Details */}
          <div
            className={
              styles.taskDetails
            }
          >
            <div
              className={
                styles.taskInfo
              }
            >
              Status:
              {" "}
              <span
                className={
                  task.completed
                    ? styles.statusCompleted
                    : styles.statusPending
                }
              >
                {task.completed
                  ? "Completed"
                  : "Pending"}
              </span>
            </div>

            <div
              className={
                isOverdue
                  ? styles.overdueText
                  : styles.taskInfo
              }
            >
              Deadline:
              {" "}
              {task.deadline}

              {isOverdue &&
                " (Overdue)"}
            </div>

            {task.book && (
              <div
                className={
                  styles.bookInfo
                }
              >
                📕{" "}
                {task.book.name}
              </div>
            )}
          </div>

          {/* Complete Checkbox */}
          <div
            className={
              styles.checkboxRow
            }
          >
            <label>
              <input
                type="checkbox"
                checked={
                  task.completed
                }
                onChange={() =>
                  onToggleTask(
                    task.id
                  )
                }
              />
              {" "}
              Complete
            </label>
          </div>

          {/* Book Actions */}
          {task.book && (
            <BookActions
              taskId={task.id}
              book={task.book}
              onPreview={onPreview}
              onRemoveBook={
                onRemoveBook
              }
            />
          )}
        </>
      )}
    </div>
  );
}
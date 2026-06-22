"use client";

import { useState } from "react";

import styles from "../styles/Todo.module.css";

export interface Book {
    name: string;
    url: string;
}

export interface Todo {
    id: number;
    text: string;
    completed: boolean;
    deadline: string;
    book?: Book;
}

interface TodoListProps {
    tasks: Todo[];

    onDeleteTask: (
        id: number
    ) => void;

    onToggleTask: (
        id: number
    ) => void;

    onUpdateTask: (
        id: number,
        text: string,
        deadline: string
    ) => void;

    onRemoveBook: (
        id: number
    ) => void;
}

export default function TodoList({
    tasks,
    onDeleteTask,
    onToggleTask,
    onUpdateTask,
    onRemoveBook,
}: TodoListProps) {
    const today = new Date();

    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [editText, setEditText] =
        useState("");

    const [editDeadline, setEditDeadline] =
        useState("");

    const startEditing = (task: Todo) => {
        setEditingId(task.id);
        setEditText(task.text);
        setEditDeadline(task.deadline);
    };

    return (
        <>
            <div className={styles.list}>
                {tasks.map((task) => {
                    const isOverdue =
                        task.deadline &&
                        !task.completed &&
                        new Date(task.deadline) <
                        today;

                    return (
                        <div
                            key={task.id}
                            className={`${styles.taskCard} ${isOverdue
                                ? styles.overdueCard
                                : ""
                                }`}
                        >
                            {editingId === task.id ? (
                                <div
                                    className={
                                        styles.editContainer
                                    }
                                >
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) =>
                                            setEditText(
                                                e.target.value
                                            )
                                        }
                                        className={
                                            styles.editInput
                                        }
                                    />

                                    <input
                                        type="date"
                                        value={
                                            editDeadline
                                        }
                                        onChange={(e) =>
                                            setEditDeadline(
                                                e.target.value
                                            )
                                        }
                                        className={
                                            styles.editDateInput
                                        }
                                    />

                                    <div
                                        className={
                                            styles.actionButtons
                                        }
                                    >
                                        <button
                                            className={
                                                styles.saveButton
                                            }
                                            onClick={() => {
                                                onUpdateTask(
                                                    task.id,
                                                    editText,
                                                    editDeadline
                                                );

                                                setEditingId(
                                                    null
                                                );
                                            }}
                                        >
                                            Save
                                        </button>

                                        <button
                                            className={
                                                styles.cancelButton
                                            }
                                            onClick={() =>
                                                setEditingId(
                                                    null
                                                )
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={
                                            styles.taskHeader
                                        }
                                    >
                                        <div
                                            className={
                                                styles.taskDetails
                                            }
                                        >
                                            <div
                                                className={
                                                    task.completed
                                                        ? styles.completed
                                                        : styles.taskName
                                                }
                                            >
                                                {
                                                    task.text
                                                }
                                            </div>

                                            <div
                                                className={
                                                    styles.taskInfo
                                                }
                                            >
                                                Status:
                                                <span
                                                    className={
                                                        task.completed
                                                            ? styles.statusCompleted
                                                            : styles.statusPending
                                                    }
                                                >
                                                    {" "}
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
                                                {
                                                    task.deadline
                                                }

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
                                                    {
                                                        task
                                                            .book
                                                            .name
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>

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

                                    {task.book && (
                                        <div
                                            className={
                                                styles.bookButtons
                                            }
                                        >
                                            <button
                                                className={
                                                    styles.bookButton
                                                }
                                                onClick={() =>
                                                    window.open(
                                                        task.book?.url,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                Read Book
                                            </button>

                                            <button
                                                className={
                                                    styles.bookButton
                                                }
                                                onClick={() =>
                                                    setPreviewUrl(
                                                        task.book?.url ||
                                                        null
                                                    )
                                                }
                                            >
                                                Preview
                                            </button>

                                            <button
                                                className={
                                                    styles.bookButton
                                                }
                                                onClick={() =>
                                                    onRemoveBook(
                                                        task.id
                                                    )
                                                }
                                            >
                                                Remove Book
                                            </button>
                                        </div>
                                    )}

                                    <div
                                        className={
                                            styles.actionButtons
                                        }
                                    >
                                        <button
                                            className={
                                                styles.editButton
                                            }
                                            onClick={() =>
                                                startEditing(
                                                    task
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className={
                                                styles.deleteButton
                                            }
                                            onClick={() =>
                                                onDeleteTask(
                                                    task.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {previewUrl && (
                <div className={styles.modal}>
                    <div
                        className={
                            styles.modalContent
                        }
                    >
                        <button
                            className={
                                styles.closeButton
                            }
                            onClick={() =>
                                setPreviewUrl(
                                    null
                                )
                            }
                        >
                            Close
                        </button>

                        <iframe
                            src={previewUrl}
                            title="PDF Preview"
                            style={{
                                width: "100%",
                                height: "600px",
                                border: "none",
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
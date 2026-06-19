"use client";

import { useState } from "react";

import styles from "../styles/Todo.module.css";

export interface Todo {
    id: number;
    text: string;
    completed: boolean;
    deadline: string;
}

interface TodoListProps {
    tasks: Todo[];
    onDeleteTask: (id: number) => void;
    onToggleTask: (id: number) => void;
    onUpdateTask: (
        id: number,
        text: string,
        deadline: string
    ) => void;
}

export default function TodoList({
    tasks,
    onDeleteTask,
    onToggleTask,
    onUpdateTask,
}: TodoListProps) {
    const today = new Date();
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
        <div className={styles.list}>
            {tasks.map((task) => {
                const isOverdue =
                    task.deadline &&
                    !task.completed &&
                    new Date(task.deadline) < today;

                return (
                    <div
                        key={task.id}
                        className={styles.item}
                    >
                        {editingId === task.id ? (
                            <div className={styles.editContainer}>
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) =>
                                        setEditText(e.target.value)
                                    }
                                    className={styles.editInput}
                                />

                                <input
                                    type="date"
                                    value={editDeadline}
                                    onChange={(e) =>
                                        setEditDeadline(e.target.value)
                                    }
                                    className={styles.editDateInput}
                                />

                                <div className={styles.actionButtons}>
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => {
                                            onUpdateTask(
                                                task.id,
                                                editText,
                                                editDeadline
                                            );

                                            setEditingId(null);
                                        }}
                                    >
                                        Save
                                    </button>

                                    <button
                                        className={styles.cancelButton}
                                        onClick={() =>
                                            setEditingId(null)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={styles.taskContent}
                                >
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() =>
                                            onToggleTask(task.id)
                                        }
                                    />

                                    <div>
                                        <div
                                            className={
                                                task.completed
                                                    ? styles.completed
                                                    : ""
                                            }
                                        >
                                            {task.text}
                                        </div>

                                        {task.deadline && (
                                            <div
                                                className={
                                                    isOverdue
                                                        ? styles.overdue
                                                        : styles.deadline
                                                }
                                            >
                                                Deadline:
                                                {" "}
                                                {task.deadline}

                                                {isOverdue &&
                                                    " (Overdue)"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.actionButtons}>
                                    <button
                                        className={styles.editButton}
                                        onClick={() =>
                                            startEditing(task)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className={styles.deleteButton}
                                        onClick={() =>
                                            onDeleteTask(task.id)
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
    );
}
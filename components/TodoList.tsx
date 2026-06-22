"use client";

import { useState } from "react";

import { Task } from "../types/task";

import TodoCard from "./TodoCard";
import PdfPreviewModal from "./PdfPreviewModal";

import styles from "../styles/Todo.module.css";

interface TodoListProps {
    tasks: Task[];

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
    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

    return (
        <>
            <div className={styles.list}>
                {tasks.map((task) => (
                    <TodoCard
                        key={task.id}
                        task={task}
                        onDeleteTask={
                            onDeleteTask
                        }
                        onToggleTask={
                            onToggleTask
                        }
                        onUpdateTask={
                            onUpdateTask
                        }
                        onRemoveBook={
                            onRemoveBook
                        }
                        onPreview={
                            setPreviewUrl
                        }
                    />
                ))}
            </div>

            {previewUrl && (
                <PdfPreviewModal
                    url={previewUrl}
                    onClose={() =>
                        setPreviewUrl(
                            null
                        )
                    }
                />
            )}
        </>
    );
}
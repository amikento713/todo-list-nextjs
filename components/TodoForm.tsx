"use client";

import { useState } from "react";
import styles from "../styles/Todo.module.css";

interface TodoFormProps {
    onAddTask: (
        task: string,
        deadline: string,
        book: File | null
    ) => void;
}

export default function TodoForm({
    onAddTask,
}: TodoFormProps) {
    const [task, setTask] = useState("");

    const [selectedBook, setSelectedBook] =
        useState<File | null>(null);

    const getTomorrowDate = () => {
        const tomorrow = new Date();

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );

        return tomorrow
            .toISOString()
            .split("T")[0];
    };

    const [deadline, setDeadline] =
        useState(getTomorrowDate());

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!task.trim()) return;

        onAddTask(
            task,
            deadline,
            selectedBook
        );

        setTask("");
        setSelectedBook(null);
        // Reset deadline to tomorrow
        setDeadline(getTomorrowDate());
    };

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
        >
            <div className={styles.inputRow}>
                <input
                    type="text"
                    placeholder="Enter a task"
                    value={task}
                    onChange={(e) =>
                        setTask(e.target.value)
                    }
                    className={styles.input}
                />

                <input
                    type="date"
                    value={deadline}
                    onChange={(e) =>
                        setDeadline(e.target.value)
                    }
                    className={styles.dateInput}
                />

                <button
                    type="submit"
                    className={styles.button}
                >
                    Add
                </button>
            </div>

            <div className={styles.uploadRow}>
                <label
                    htmlFor="book-upload"
                    className={styles.uploadLabel}
                >
                    📕 Attach PDF (Optional)
                </label>

                <input
                    id="book-upload"
                    type="file"
                    accept=".pdf"
                    className={styles.fileInput}
                    onChange={(e) => {
                        const file =
                            e.target.files?.[0] || null;

                        if (!file) {
                            setSelectedBook(null);
                            return;
                        }

                        if (
                            file.type !== "application/pdf"
                        ) {
                            alert(
                                "Only PDF files are allowed."
                            );

                            return;
                        }

                        setSelectedBook(file);
                    }}
                />
            </div>
        </form>
    );
}
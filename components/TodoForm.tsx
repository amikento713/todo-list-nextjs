"use client";

import { useState } from "react";
import styles from "../styles/Todo.module.css";

interface TodoFormProps {
    onAddTask: (
        task: string,
        deadline: string
    ) => void;
}

export default function TodoForm({
    onAddTask,
}: TodoFormProps) {
    const [task, setTask] = useState("");

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

        onAddTask(task, deadline);

        setTask("");

        // Reset deadline to tomorrow
        setDeadline(getTomorrowDate());
    };

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
        >
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
        </form>
    );
}
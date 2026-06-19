"use client";

import { useState } from "react";
import styles from "../styles/Todo.module.css";

type TodoFormProps = {
  onAddTask: (task: string) => void;
};

export default function TodoForm({
  onAddTask,
}: TodoFormProps) {
  const [task, setTask] = useState("");

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!task.trim()) return;

    onAddTask(task);

    setTask("");
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
        onChange={(e) => setTask(e.target.value)}
        className={styles.input}
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
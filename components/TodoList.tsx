"use client";

import styles from "../styles/Todo.module.css";

type TodoListProps = {
  tasks: string[];
  onDeleteTask: (index: number) => void;
};

export default function TodoList({
  tasks,
  onDeleteTask,
}: TodoListProps) {
  return (
    <div className={styles.list}>
      {tasks.map((task, index) => (
        <div
          key={index}
          className={styles.item}
        >
          <span>{task}</span>

          <button
            className={styles.deleteButton}
            onClick={() => onDeleteTask(index)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
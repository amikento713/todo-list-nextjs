"use client";

import styles from "../styles/Todo.module.css";

type TodoListProps = {
  tasks: string[];
};

export default function TodoList({
  tasks,
}: TodoListProps) {
  return (
    <div className={styles.list}>
      {tasks.map((task, index) => (
        <div
          key={index}
          className={styles.item}
        >
          {task}
        </div>
      ))}
    </div>
  );
}
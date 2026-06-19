"use client";

import styles from "../styles/Todo.module.css";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  tasks: Todo[];
  onDeleteTask: (id: number) => void;
  onToggleTask: (id: number) => void;
}

export default function TodoList({
  tasks,
  onDeleteTask,
  onToggleTask,
}: TodoListProps) {
  return (
    <div className={styles.list}>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={styles.item}
        >
          <div className={styles.taskContent}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() =>
                onToggleTask(task.id)
              }
            />

            <span
              className={
                task.completed
                  ? styles.completed
                  : ""
              }
            >
              {task.text}
            </span>
          </div>

          <button
            className={styles.deleteButton}
            onClick={() =>
              onDeleteTask(task.id)
            }
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
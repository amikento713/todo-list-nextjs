"use client";

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
}

export default function TodoList({
  tasks,
  onDeleteTask,
  onToggleTask,
}: TodoListProps) {
  const today = new Date();

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

            <button
              className={
                styles.deleteButton
              }
              onClick={() =>
                onDeleteTask(task.id)
              }
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
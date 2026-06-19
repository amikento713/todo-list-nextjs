"use client";

import { useState } from "react";
import TodoForm from "../components/TodoForm";
import TodoList, {
  Todo,
} from "../components/TodoList";
import styles from "../styles/Todo.module.css";

export default function Home() {
  const [tasks, setTasks] = useState<Todo[]>(
    []
  );

  const addTask = (newTask: string) => {
    const task: Todo = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };

    setTasks([...tasks, task]);
  };

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter(
      (task) => task.id !== id
    );

    setTasks(updatedTasks);
  };

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map(
      (task) =>
        task.id === id
          ? {
            ...task,
            completed:
              !task.completed,
          }
          : task
    );

    setTasks(updatedTasks);
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          Todo List
        </h1>

        <TodoForm onAddTask={addTask} />

        <TodoList
          tasks={tasks}
          onDeleteTask={deleteTask}
          onToggleTask={toggleTask}
        />
      </div>
    </main>
  );
}
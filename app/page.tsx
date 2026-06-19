"use client";

import { useState } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import styles from "../styles/Todo.module.css";

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);

  const addTask = (newTask: string) => {
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (indexToDelete: number) => {
    const updatedTasks = tasks.filter(
      (_, index) => index !== indexToDelete
    );

    setTasks(updatedTasks);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>
        Todo List
      </h1>

      <TodoForm onAddTask={addTask} />

      <TodoList
        tasks={tasks}
        onDeleteTask={deleteTask}
      />
    </main>
  );
}
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

  const totalTasks = tasks.length;

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const pendingTasks =
    totalTasks - completedTasks;

  const addTask = (
    newTask: string,
    deadline: string
  ) => {
    const task: Todo = {
      id: Date.now(),
      text: newTask,
      completed: false,
      deadline,
    };

    setTasks([...tasks, task]);
  };

  const updateTask = (
    id: number,
    updatedText: string,
    updatedDeadline: string
  ) => {
    const updatedTasks = tasks.map(
      (task) =>
        task.id === id
          ? {
            ...task,
            text: updatedText,
            deadline: updatedDeadline,
          }
          : task
    );

    setTasks(updatedTasks);
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
          onUpdateTask={updateTask}
        />
      </div>
    </main>
  );
}
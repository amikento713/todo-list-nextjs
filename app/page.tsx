"use client";

import { useState } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { Task } from "../types/task";
import styles from "../styles/Todo.module.css";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(
    []
  );

  const totalTasks = tasks.length;

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const pendingTasks =
    totalTasks - completedTasks;

  const [filter, setFilter] = useState<
    "all" | "completed" | "pending"
  >("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") {
      return task.completed;
    }

    if (filter === "pending") {
      return !task.completed;
    }

    return true;
  });

  const addTask = (
    newTask: string,
    deadline: string,
    selectedBook: File | null
  ) => {
    let book;

    if (selectedBook) {
      book = {
        name: selectedBook.name,
        url: URL.createObjectURL(
          selectedBook
        ),
      };
    }

    const task: Task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      deadline,
      book,
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

  const removeBook = (
    taskId: number
  ) => {
    const updatedTasks = tasks.map(
      (task) =>
        task.id === taskId
          ? {
            ...task,
            book: undefined,
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

        <div className={styles.statsContainer}>
          <button
            className={`${styles.statCard} ${filter === "all"
              ? styles.activeStatCard
              : ""
              }`}
            onClick={() => setFilter("all")}
          >
            <div className={styles.statNumber}>
              {totalTasks}
            </div>

            <div className={styles.statLabel}>
              Total
            </div>
          </button>

          <button
            className={`${styles.statCard} ${filter === "completed"
              ? styles.activeStatCard
              : ""
              }`}
            onClick={() =>
              setFilter("completed")
            }
          >
            <div className={styles.statNumber}>
              {completedTasks}
            </div>

            <div className={styles.statLabel}>
              Completed
            </div>
          </button>

          <button
            className={`${styles.statCard} ${filter === "pending"
              ? styles.activeStatCard
              : ""
              }`}
            onClick={() =>
              setFilter("pending")
            }
          >
            <div className={styles.statNumber}>
              {pendingTasks}
            </div>

            <div className={styles.statLabel}>
              Pending
            </div>
          </button>
        </div>
        <TodoForm onAddTask={addTask} />
        <h3 className={styles.filterTitle}>
          {filter === "all" && "All Tasks"}

          {filter === "completed" &&
            "Completed Tasks"}

          {filter === "pending" &&
            "Pending Tasks"}
        </h3>
        <TodoList
          tasks={filteredTasks}
          onDeleteTask={deleteTask}
          onToggleTask={toggleTask}
          onUpdateTask={updateTask}
          onRemoveBook={removeBook}
        />
      </div>
    </main>
  );
}
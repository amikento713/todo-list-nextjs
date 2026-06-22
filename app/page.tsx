"use client";

import { useState, useEffect } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { Task } from "../types/task";
import styles from "../styles/Todo.module.css";
import { taskService } from "../services/taskService";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const totalTasks = tasks.length;

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await taskService.getTasks();
    setTasks(data);
  };

  const createTask = async (task: Task) => {
    await taskService.createTask(task);
    const updatedTasks = await taskService.getTasks();
    setTasks([...updatedTasks]);
  };

  const deleteTask = async (id: number) => {
    await taskService.deleteTask(id);
    const updatedTasks = await taskService.getTasks();
    setTasks([...updatedTasks]);
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);

    if (!task) return;
    await taskService.updateTask({ ...task, completed: !task.completed, });
    const updatedTasks = await taskService.getTasks();
    setTasks([...updatedTasks]);
  };

  const updateTask = async (
    id: number,
    text: string,
    deadline: string
  ) => {
    const task = tasks.find((t) => t.id === id);

    if (!task) return;
    await taskService.updateTask({ ...task, text, deadline, });
    const updatedTasks = await taskService.getTasks();
    setTasks([...updatedTasks]);
  };

  const removeBook = async (id: number) => {
    const task = tasks.find((t) => t.id === id);

    if (!task) return;
    await taskService.updateTask({...task, book: undefined,});

    const updatedTasks = await taskService.getTasks();
    setTasks([...updatedTasks]);
  };

  const pendingTasks = totalTasks - completedTasks;

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

  const addTask = async (
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

    await taskService.createTask(task);
    const updatedTasks = await taskService.getTasks();
    setTasks([...updatedTasks]);
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
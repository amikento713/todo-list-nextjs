"use client";

import { useState, useEffect } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { Task } from "../types/task";
import styles from "../styles/Todo.module.css";
import { taskService } from "../services/taskService";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalTasks = tasks.length;

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Task) => {
    setLoading(true);
    setError(null);

    try {
      await taskService.createTask(task);
      const updatedTasks = await taskService.getTasks();
      setTasks([...updatedTasks]);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await taskService.deleteTask(id);
      const updatedTasks = await taskService.getTasks();
      setTasks([...updatedTasks]);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);

    if (!task) return;
    setLoading(true);
    setError(null);

    try {
      await taskService.updateTask({ ...task, completed: !task.completed });
      const updatedTasks = await taskService.getTasks();
      setTasks([...updatedTasks]);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (
    id: number,
    text: string,
    deadline: string
  ) => {
    const task = tasks.find((t) => t.id === id);

    if (!task) return;
    setLoading(true);
    setError(null);

    try {
      await taskService.updateTask({ ...task, text, deadline });
      const updatedTasks = await taskService.getTasks();
      setTasks([...updatedTasks]);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const removeBook = async (id: number) => {
    const task = tasks.find((t) => t.id === id);

    if (!task) return;
    setLoading(true);
    setError(null);

    try {
      await taskService.updateTask({ ...task, book: undefined });
      const updatedTasks = await taskService.getTasks();
      setTasks([...updatedTasks]);
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to remove book");
    } finally {
      setLoading(false);
    }
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

    setLoading(true);
    setError(null);

    try {
      if (selectedBook) {
        const form = new FormData();
        form.append("file", selectedBook);

        const res = await fetch("http://localhost:8000/upload-book", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || res.statusText || "Upload failed");
        }

        const data = await res.json();
        book = { name: selectedBook.name, url: data.url };
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
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to add task");
    } finally {
      setLoading(false);
    }
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
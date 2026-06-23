"use client";

import { useState, useEffect, useCallback } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { Task } from "../types/task";
import styles from "../styles/Todo.module.css";
import { taskService } from "../services/taskService";
import { authService } from "../services/authService";
import { uploadBook } from "../services/uploadService";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const loadTasks = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    setCurrentUser(user);
    if (token) {
      loadTasks();
    }
  }, [loadTasks]);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.register(username.trim(), password);
      setCurrentUser(username.trim());
      await loadTasks();
    } catch (err) {
      setError((err as Error)?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.login(username.trim(), password);
      setCurrentUser(username.trim());
      await loadTasks();
    } catch (err) {
      setError((err as Error)?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setTasks([]);
    setError(null);
  };

  const refreshTasks = async () => {
    const updatedTasks = await taskService.getTasks();
    setTasks(updatedTasks);
  };

  const deleteTask = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await taskService.deleteTask(id);
      await refreshTasks();
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
      await refreshTasks();
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: number, text: string, deadline: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    setLoading(true);
    setError(null);

    try {
      await taskService.updateTask({ ...task, text, deadline });
      await refreshTasks();
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
      await taskService.updateTask({ ...task, book: null });
      await refreshTasks();
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to remove book");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  const addTask = async (
    newTask: string,
    deadline: string,
    selectedBook: File | null
  ) => {
    setLoading(true);
    setError(null);

    try {
      let book: Task["book"];

      if (selectedBook) {
        const data = await uploadBook(selectedBook);
        book = { name: selectedBook.name, url: data.url };
      }

      await taskService.createTask({
        text: newTask,
        completed: false,
        deadline,
        book,
      });
      await refreshTasks();
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
        <h1 className={styles.title}>Todo List</h1>

        {loading && <div className={styles.loadingBanner}>Loading...</div>}

        <div className={styles.statsContainer}>
          <button
            type="button"
            className={`${styles.statCard} ${
              filter === "all" ? styles.activeStatCard : ""
            }`}
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
          >
            <div className={styles.statNumber}>{totalTasks}</div>
            <div className={styles.statLabel}>Total</div>
          </button>

          <button
            type="button"
            className={`${styles.statCard} ${
              filter === "completed" ? styles.activeStatCard : ""
            }`}
            onClick={() => setFilter("completed")}
            aria-pressed={filter === "completed"}
          >
            <div className={styles.statNumber}>{completedTasks}</div>
            <div className={styles.statLabel}>Completed</div>
          </button>

          <button
            type="button"
            className={`${styles.statCard} ${
              filter === "pending" ? styles.activeStatCard : ""
            }`}
            onClick={() => setFilter("pending")}
            aria-pressed={filter === "pending"}
          >
            <div className={styles.statNumber}>{pendingTasks}</div>
            <div className={styles.statLabel}>Pending</div>
          </button>
        </div>

        {!currentUser ? (
          <div className={styles.authPanel}>
            <h3>Login / Register</h3>
            <input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
            <div className={styles.authActions}>
              <button
                type="button"
                onClick={handleLogin}
                className={styles.button}
                disabled={loading}
              >
                Login
              </button>
              <button
                type="button"
                onClick={handleRegister}
                className={styles.button}
                disabled={loading}
              >
                Register
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.userBar}>
              <div>Signed in as {currentUser}</div>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.button}
                disabled={loading}
              >
                Logout
              </button>
            </div>
            <TodoForm onAddTask={addTask} disabled={loading} />
          </>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}

        <h3 className={styles.filterTitle}>
          {filter === "all" && "All Tasks"}
          {filter === "completed" && "Completed Tasks"}
          {filter === "pending" && "Pending Tasks"}
        </h3>

        {currentUser ? (
          <TodoList
            tasks={filteredTasks}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            onDeleteTask={deleteTask}
            onToggleTask={toggleTask}
            onUpdateTask={updateTask}
            onRemoveBook={removeBook}
            disabled={loading}
          />
        ) : (
          <p className={styles.emptyState}>Sign in to view and manage tasks.</p>
        )}
      </div>
    </main>
  );
}

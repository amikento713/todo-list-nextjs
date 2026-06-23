"use client";

import { useState, useEffect } from "react";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { Task } from "../types/task";
import styles from "../styles/Todo.module.css";
import { taskService } from "../services/taskService";
import { authService } from "../services/authService";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const totalTasks = tasks.length;

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    setCurrentUser(user);
    if (token) loadTasks();
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

  const handleRegister = async () => {
    setError(null);
    try {
      await authService.register(username, password);
      setCurrentUser(username);
      await loadTasks();
    } catch (err) {
      setError((err as Error)?.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    setError(null);
    try {
      await authService.login(username, password);
      setCurrentUser(username);
      await loadTasks();
    } catch (err) {
      setError((err as Error)?.message || "Login failed");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setTasks([]);
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
        {!currentUser ? (
          <div style={{ marginBottom: 16 }}>
            <h3>Login / Register</h3>
            <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div style={{ marginTop: 8 }}>
              <button onClick={handleLogin} className={styles.button}>Login</button>
              <button onClick={handleRegister} className={styles.button} style={{ marginLeft: 8 }}>Register</button>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>Signed in as {currentUser}</div>
              <button onClick={handleLogout} className={styles.button}>Logout</button>
            </div>
            <TodoForm onAddTask={addTask} />
          </>
        )}
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
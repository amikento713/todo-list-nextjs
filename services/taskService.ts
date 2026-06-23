import { Task } from "../types/task";

const BASE_URL = "http://localhost:8000/tasks";

function authHeaders(): Headers {
  const headers = new Headers();
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = text || res.statusText || "API error";
    throw new Error(message);
  }

  // Empty response (e.g. 204)
  if (res.status === 204) {
    // @ts-ignore
    return undefined;
  }

  return res.json();
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const headers = authHeaders();
    headers.set("Accept", "application/json");
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers,
    });

    return handleResponse<Task[]>(res);
  },

  async createTask(task: Task): Promise<Task> {
    const headers = authHeaders();
    headers.set("Content-Type", "application/json");
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(task),
    });

    return handleResponse<Task>(res);
  },

  async updateTask(updatedTask: Task): Promise<Task> {
    const headers = authHeaders();
    headers.set("Content-Type", "application/json");
    const res = await fetch(`${BASE_URL}/${updatedTask.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updatedTask),
    });

    return handleResponse<Task>(res);
  },

  async deleteTask(id: number): Promise<void> {
    const headers = authHeaders();
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse<void>(res);
  },
};
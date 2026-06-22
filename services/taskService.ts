import { Task } from "../types/task";

const BASE_URL = "http://localhost:8000/tasks";

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
    const res = await fetch(BASE_URL, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    return handleResponse<Task[]>(res);
  },

  async createTask(task: Task): Promise<Task> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    return handleResponse<Task>(res);
  },

  async updateTask(updatedTask: Task): Promise<Task> {
    const res = await fetch(`${BASE_URL}/${updatedTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    return handleResponse<Task>(res);
  },

  async deleteTask(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    return handleResponse<void>(res);
  },
};
import { API_BASE_URL } from "../lib/config";
import { Task } from "../types/task";

const BASE_URL = `${API_BASE_URL}/tasks`;

function authHeaders(): Headers {
  const headers = new Headers();
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function normalizeTask(raw: Partial<Task> & { title?: string }): Task {
  const text = raw.text ?? raw.title ?? "";
  return {
    id: raw.id as number,
    text,
    completed: Boolean(raw.completed),
    deadline: raw.deadline ?? "",
    book: raw.book ?? undefined,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    let message = res.statusText || "API error";

    if (contentType.includes("application/json")) {
      try {
        const json = await res.json();
        message =
          typeof json.detail === "string"
            ? json.detail
            : json.error || JSON.stringify(json);
      } catch {
        const text = await res.text().catch(() => "");
        if (text) message = text;
      }
    } else {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
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

    const data = await handleResponse<Array<Partial<Task> & { title?: string }>>(
      res
    );
    return data.map(normalizeTask);
  },

  async createTask(task: Omit<Task, "id">): Promise<Task> {
    const headers = authHeaders();
    headers.set("Content-Type", "application/json");
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: task.text,
        completed: task.completed,
        deadline: task.deadline,
        book: task.book ?? null,
      }),
    });

    const data = await handleResponse<Partial<Task> & { title?: string }>(res);
    return normalizeTask(data);
  },

  async updateTask(updatedTask: Task): Promise<Task> {
    const headers = authHeaders();
    headers.set("Content-Type", "application/json");
    const res = await fetch(`${BASE_URL}/${updatedTask.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        text: updatedTask.text,
        completed: updatedTask.completed,
        deadline: updatedTask.deadline,
        book: updatedTask.book ?? null,
      }),
    });

    const data = await handleResponse<Partial<Task> & { title?: string }>(res);
    return normalizeTask(data);
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

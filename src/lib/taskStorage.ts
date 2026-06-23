import {
  DEFAULT_TASK_PRIORITY,
  isValidPriority,
  Task,
} from "../types/todo";

function normalizeTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<Task>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.text !== "string" ||
    typeof candidate.completed !== "boolean" ||
    typeof candidate.deadline !== "string" ||
    !isValidPriority(candidate.priority ?? DEFAULT_TASK_PRIORITY)
  ) {
    return null;
  }

  const task: Task = {
    id: candidate.id,
    text: candidate.text.trim(),
    completed: candidate.completed,
    priority: candidate.priority ?? DEFAULT_TASK_PRIORITY,
    deadline: candidate.deadline,
  };

  if (candidate.book) {
    if (
      typeof candidate.book.name !== "string" ||
      typeof candidate.book.url !== "string"
    ) {
      return null;
    }

    task.book = {
      name: candidate.book.name,
      url: candidate.book.url,
    };
  }

  return task;
}

export function parseStoredTasks(raw: string): Task[] {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeTask)
      .filter((task): task is Task => task !== null);
  } catch {
    return [];
  }
}

export function serializeTasks(tasks: Task[]): string {
  return JSON.stringify(tasks);
}

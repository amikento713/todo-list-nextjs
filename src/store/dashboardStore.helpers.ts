import {
  DEFAULT_SETTINGS,
  Notification,
  Settings,
} from "../types/notification";
import {
  CreateTaskInput,
  FilterType,
  isValidDeadline,
  isValidPriority,
  MAX_TASK_TEXT_LENGTH,
  Task,
  UpdateTaskInput,
} from "../types/todo";

export class DashboardStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardStoreError";
  }
}

/** @deprecated Use DashboardStoreError */
export const StateEngineError = DashboardStoreError;

export type CreateNotificationInput = {
  title: string;
  message: string;
  read?: boolean;
  createdAt?: Date;
};

export type UpdateNotificationInput = Partial<
  Pick<Notification, "title" | "message" | "read">
>;

export type UpdateSettingsInput = Partial<Settings>;

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function validateCreateTaskInput(input: CreateTaskInput): void {
  const text = input.text.trim();

  if (!text) {
    throw new DashboardStoreError("Task text is required.");
  }

  if (text.length > MAX_TASK_TEXT_LENGTH) {
    throw new DashboardStoreError(
      `Task text must be at most ${MAX_TASK_TEXT_LENGTH} characters.`
    );
  }

  if (!isValidDeadline(input.deadline)) {
    throw new DashboardStoreError("Deadline must use YYYY-MM-DD format.");
  }

  if (!isValidPriority(input.priority)) {
    throw new DashboardStoreError("Priority is invalid.");
  }
}

function validateUpdateTaskInput(input: UpdateTaskInput): void {
  if (input.text !== undefined) {
    const text = input.text.trim();

    if (!text) {
      throw new DashboardStoreError("Task text cannot be empty.");
    }

    if (text.length > MAX_TASK_TEXT_LENGTH) {
      throw new DashboardStoreError(
        `Task text must be at most ${MAX_TASK_TEXT_LENGTH} characters.`
      );
    }
  }

  if (input.deadline !== undefined && !isValidDeadline(input.deadline)) {
    throw new DashboardStoreError("Deadline must use YYYY-MM-DD format.");
  }

  if (input.priority !== undefined && !isValidPriority(input.priority)) {
    throw new DashboardStoreError("Priority is invalid.");
  }
}

export function buildTask(input: CreateTaskInput): Task {
  validateCreateTaskInput(input);

  const task: Task = {
    id: createId(),
    text: input.text.trim(),
    completed: input.completed ?? false,
    priority: input.priority,
    deadline: input.deadline,
  };

  if (input.book) {
    task.book = { ...input.book };
  }

  return task;
}

export function applyTaskUpdate(task: Task, input: UpdateTaskInput): Task {
  validateUpdateTaskInput(input);

  const updatedTask: Task = {
    ...task,
    ...(input.text !== undefined ? { text: input.text.trim() } : {}),
    ...(input.completed !== undefined ? { completed: input.completed } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.deadline !== undefined ? { deadline: input.deadline } : {}),
  };

  if ("book" in input) {
    updatedTask.book = input.book;
  }

  return updatedTask;
}

export function filterTasks(tasks: Task[], filter: FilterType): Task[] {
  switch (filter) {
    case "completed":
      return tasks.filter((task) => task.completed);
    case "pending":
      return tasks.filter((task) => !task.completed);
    case "all":
    default:
      return tasks;
  }
}

function validateNotificationInput(input: CreateNotificationInput): void {
  if (!input.title.trim()) {
    throw new DashboardStoreError("Notification title is required.");
  }

  if (!input.message.trim()) {
    throw new DashboardStoreError("Notification message is required.");
  }
}

export function buildNotification(input: CreateNotificationInput): Notification {
  validateNotificationInput(input);

  return {
    id: createId(),
    title: input.title.trim(),
    message: input.message.trim(),
    createdAt: input.createdAt ?? new Date(),
    read: input.read ?? false,
  };
}

export function applyNotificationUpdate(
  notification: Notification,
  input: UpdateNotificationInput
): Notification {
  return {
    ...notification,
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.message !== undefined ? { message: input.message.trim() } : {}),
    ...(input.read !== undefined ? { read: input.read } : {}),
  };
}

export function mergeSettings(
  current: Settings,
  input: UpdateSettingsInput
): Settings {
  return {
    theme: input.theme ?? current.theme,
    enableDeadlineNotifications:
      input.enableDeadlineNotifications ??
      current.enableDeadlineNotifications,
    enableToastNotifications:
      input.enableToastNotifications ?? current.enableToastNotifications,
  };
}

export const DEFAULT_DASHBOARD_STATE = {
  tasks: [] as Task[],
  notifications: [] as Notification[],
  settings: DEFAULT_SETTINGS,
};

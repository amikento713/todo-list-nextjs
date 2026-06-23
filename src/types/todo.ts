export interface Book {
  name: string;
  url: string;
}

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type FilterType = "all" | "pending" | "completed";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  deadline: string;
  book?: Book;
}

export type CreateTaskInput = {
  text: string;
  priority: TaskPriority;
  deadline: string;
  book?: Book;
  completed?: boolean;
};

export type UpdateTaskInput = Partial<
  Pick<Task, "text" | "completed" | "priority" | "deadline" | "book">
>;

export const MAX_TASK_TEXT_LENGTH = 500;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const DEFAULT_TASK_PRIORITY: TaskPriority = "medium";

export function isValidDeadline(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function isValidPriority(value: string): value is TaskPriority {
  return value === "low" || value === "medium" || value === "high" || value === "urgent";
}

export function isValidFilter(value: string): value is FilterType {
  return value === "all" || value === "pending" || value === "completed";
}

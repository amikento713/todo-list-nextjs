export type DeadlineCategory = "overdue" | "due-today" | "due-tomorrow";

export function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function parseDeadline(deadline: string): Date {
  const [year, month, day] = deadline.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

export function daysUntilDeadline(deadline: string, referenceDate = new Date()): number {
  const dueDate = parseDeadline(deadline);
  const today = startOfDay(referenceDate);
  const diffMs = dueDate.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getDeadlineCategory(
  deadline: string,
  completed: boolean,
  referenceDate = new Date()
): DeadlineCategory | null {
  if (completed) {
    return null;
  }

  const daysUntil = daysUntilDeadline(deadline, referenceDate);

  if (daysUntil < 0) {
    return "overdue";
  }

  if (daysUntil === 0) {
    return "due-today";
  }

  if (daysUntil === 1) {
    return "due-tomorrow";
  }

  return null;
}

export function isDueSoon(
  deadline: string,
  completed: boolean,
  referenceDate = new Date()
): boolean {
  if (completed) {
    return false;
  }

  const daysUntil = daysUntilDeadline(deadline, referenceDate);
  return daysUntil <= 1;
}

export function formatDeadlineLabel(deadline: string): string {
  const daysUntil = daysUntilDeadline(deadline);

  if (daysUntil < 0) {
    return `${Math.abs(daysUntil)}d overdue`;
  }

  if (daysUntil === 0) {
    return "Due today";
  }

  if (daysUntil === 1) {
    return "Due tomorrow";
  }

  return deadline;
}

export function buildTaskNotificationKey(taskId: string, category: DeadlineCategory): string {
  return `task:${taskId}:${category}`;
}

export function notificationContainsTaskKey(
  message: string,
  taskId: string,
  category: DeadlineCategory
): boolean {
  return message.includes(buildTaskNotificationKey(taskId, category));
}

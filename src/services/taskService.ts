"use client";

import { useCallback, useMemo } from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  CreateTaskInput,
  DEFAULT_TASK_PRIORITY,
  FilterType,
  isValidDeadline,
  isValidPriority,
  MAX_TASK_TEXT_LENGTH,
  Task,
  UpdateTaskInput,
} from "../types/todo";

export const TASKS_STORAGE_KEY = "productivity-dashboard:tasks";

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskValidationError";
  }
}

function createTaskId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

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

function validateCreateInput(input: CreateTaskInput): void {
  const text = input.text.trim();

  if (!text) {
    throw new TaskValidationError("Task text is required.");
  }

  if (text.length > MAX_TASK_TEXT_LENGTH) {
    throw new TaskValidationError(
      `Task text must be at most ${MAX_TASK_TEXT_LENGTH} characters.`
    );
  }

  if (!isValidDeadline(input.deadline)) {
    throw new TaskValidationError("Deadline must use YYYY-MM-DD format.");
  }

  if (!isValidPriority(input.priority)) {
    throw new TaskValidationError("Priority is invalid.");
  }
}

function validateUpdateInput(input: UpdateTaskInput): void {
  if (input.text !== undefined) {
    const text = input.text.trim();

    if (!text) {
      throw new TaskValidationError("Task text cannot be empty.");
    }

    if (text.length > MAX_TASK_TEXT_LENGTH) {
      throw new TaskValidationError(
        `Task text must be at most ${MAX_TASK_TEXT_LENGTH} characters.`
      );
    }
  }

  if (input.deadline !== undefined && !isValidDeadline(input.deadline)) {
    throw new TaskValidationError("Deadline must use YYYY-MM-DD format.");
  }

  if (input.priority !== undefined && !isValidPriority(input.priority)) {
    throw new TaskValidationError("Priority is invalid.");
  }
}

function buildTask(input: CreateTaskInput): Task {
  validateCreateInput(input);

  const task: Task = {
    id: createTaskId(),
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

function applyTaskUpdate(task: Task, input: UpdateTaskInput): Task {
  validateUpdateInput(input);

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

function filterTasks(tasks: Task[], filter: FilterType): Task[] {
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

export function useTaskService() {
  const { value: tasks, setValue, removeValue, isHydrated } = useLocalStorage<
    Task[]
  >(TASKS_STORAGE_KEY, [], {
    serializer: serializeTasks,
    deserializer: parseStoredTasks,
  });

  const getTasks = useCallback((): Task[] => tasks, [tasks]);

  const getTasksByFilter = useCallback(
    (filter: FilterType): Task[] => filterTasks(tasks, filter),
    [tasks]
  );

  const getTaskById = useCallback(
    (id: string): Task | undefined => tasks.find((task) => task.id === id),
    [tasks]
  );

  const createTask = useCallback(
    (input: CreateTaskInput): Task => {
      const task = buildTask(input);

      setValue((previousTasks) => [...previousTasks, task]);
      return task;
    },
    [setValue]
  );

  const updateTask = useCallback(
    (id: string, input: UpdateTaskInput): Task => {
      const existingTask = tasks.find((task) => task.id === id);

      if (!existingTask) {
        throw new TaskValidationError(`Task with id "${id}" was not found.`);
      }

      const updatedTask = applyTaskUpdate(existingTask, input);

      setValue((previousTasks) =>
        previousTasks.map((task) => (task.id === id ? updatedTask : task))
      );

      return updatedTask;
    },
    [setValue, tasks]
  );

  const deleteTask = useCallback(
    (id: string): void => {
      const exists = tasks.some((task) => task.id === id);

      if (!exists) {
        throw new TaskValidationError(`Task with id "${id}" was not found.`);
      }

      setValue((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );
    },
    [setValue, tasks]
  );

  const clearTasks = useCallback((): void => {
    removeValue();
  }, [removeValue]);

  return useMemo(
    () => ({
      tasks,
      isHydrated,
      getTasks,
      getTasksByFilter,
      getTaskById,
      createTask,
      updateTask,
      deleteTask,
      clearTasks,
    }),
    [
      tasks,
      isHydrated,
      getTasks,
      getTasksByFilter,
      getTaskById,
      createTask,
      updateTask,
      deleteTask,
      clearTasks,
    ]
  );
}

export type TaskService = ReturnType<typeof useTaskService>;

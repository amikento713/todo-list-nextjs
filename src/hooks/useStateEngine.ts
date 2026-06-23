"use client";

import { useCallback, useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage";
import { parseStoredTasks, serializeTasks } from "../lib/taskStorage";
import {
  DEFAULT_SETTINGS,
  Notification,
  parseStoredNotifications,
  parseStoredSettings,
  serializeNotifications,
  serializeSettings,
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

export const STORAGE_KEYS = {
  tasks: "productivity-dashboard:tasks",
  notifications: "productivity-dashboard:notifications",
  settings: "productivity-dashboard:settings",
} as const;

export class StateEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StateEngineError";
  }
}

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

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function validateCreateTaskInput(input: CreateTaskInput): void {
  const text = input.text.trim();

  if (!text) {
    throw new StateEngineError("Task text is required.");
  }

  if (text.length > MAX_TASK_TEXT_LENGTH) {
    throw new StateEngineError(
      `Task text must be at most ${MAX_TASK_TEXT_LENGTH} characters.`
    );
  }

  if (!isValidDeadline(input.deadline)) {
    throw new StateEngineError("Deadline must use YYYY-MM-DD format.");
  }

  if (!isValidPriority(input.priority)) {
    throw new StateEngineError("Priority is invalid.");
  }
}

function validateUpdateTaskInput(input: UpdateTaskInput): void {
  if (input.text !== undefined) {
    const text = input.text.trim();

    if (!text) {
      throw new StateEngineError("Task text cannot be empty.");
    }

    if (text.length > MAX_TASK_TEXT_LENGTH) {
      throw new StateEngineError(
        `Task text must be at most ${MAX_TASK_TEXT_LENGTH} characters.`
      );
    }
  }

  if (input.deadline !== undefined && !isValidDeadline(input.deadline)) {
    throw new StateEngineError("Deadline must use YYYY-MM-DD format.");
  }

  if (input.priority !== undefined && !isValidPriority(input.priority)) {
    throw new StateEngineError("Priority is invalid.");
  }
}

function buildTask(input: CreateTaskInput): Task {
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

function applyTaskUpdate(task: Task, input: UpdateTaskInput): Task {
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

function validateNotificationInput(input: CreateNotificationInput): void {
  if (!input.title.trim()) {
    throw new StateEngineError("Notification title is required.");
  }

  if (!input.message.trim()) {
    throw new StateEngineError("Notification message is required.");
  }
}

function buildNotification(input: CreateNotificationInput): Notification {
  validateNotificationInput(input);

  return {
    id: createId(),
    title: input.title.trim(),
    message: input.message.trim(),
    createdAt: input.createdAt ?? new Date(),
    read: input.read ?? false,
  };
}

function applyNotificationUpdate(
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

function mergeSettings(current: Settings, input: UpdateSettingsInput): Settings {
  return {
    theme: input.theme ?? current.theme,
    enableDeadlineNotifications:
      input.enableDeadlineNotifications ??
      current.enableDeadlineNotifications,
    enableToastNotifications:
      input.enableToastNotifications ?? current.enableToastNotifications,
  };
}

export function useStateEngine() {
  const tasksStore = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, [], {
    serializer: serializeTasks,
    deserializer: parseStoredTasks,
  });

  const notificationsStore = useLocalStorage<Notification[]>(
    STORAGE_KEYS.notifications,
    [],
    {
      serializer: serializeNotifications,
      deserializer: parseStoredNotifications,
    }
  );

  const settingsStore = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    {
      serializer: serializeSettings,
      deserializer: parseStoredSettings,
    }
  );

  const isHydrated =
    tasksStore.isHydrated &&
    notificationsStore.isHydrated &&
    settingsStore.isHydrated;

  const reloadFromStorage = useCallback(() => {
    tasksStore.reloadValue();
    notificationsStore.reloadValue();
    settingsStore.reloadValue();
  }, [tasksStore, notificationsStore, settingsStore]);

  const resetTasks = useCallback(() => {
    tasksStore.removeValue();
  }, [tasksStore]);

  const resetNotifications = useCallback(() => {
    notificationsStore.removeValue();
  }, [notificationsStore]);

  const resetSettings = useCallback(() => {
    settingsStore.removeValue();
  }, [settingsStore]);

  const resetAll = useCallback(() => {
    tasksStore.removeValue();
    notificationsStore.removeValue();
    settingsStore.removeValue();
  }, [tasksStore, notificationsStore, settingsStore]);

  const getTasks = useCallback(
    (): Task[] => tasksStore.value,
    [tasksStore.value]
  );

  const getTasksByFilter = useCallback(
    (filter: FilterType): Task[] => filterTasks(tasksStore.value, filter),
    [tasksStore.value]
  );

  const getTaskById = useCallback(
    (id: string): Task | undefined =>
      tasksStore.value.find((task) => task.id === id),
    [tasksStore.value]
  );

  const createTask = useCallback(
    (input: CreateTaskInput): Task => {
      const task = buildTask(input);
      tasksStore.setValue((previousTasks) => [...previousTasks, task]);
      return task;
    },
    [tasksStore]
  );

  const updateTask = useCallback(
    (id: string, input: UpdateTaskInput): Task => {
      const existingTask = tasksStore.value.find((task) => task.id === id);

      if (!existingTask) {
        throw new StateEngineError(`Task with id "${id}" was not found.`);
      }

      const updatedTask = applyTaskUpdate(existingTask, input);
      tasksStore.setValue((previousTasks) =>
        previousTasks.map((task) => (task.id === id ? updatedTask : task))
      );

      return updatedTask;
    },
    [tasksStore]
  );

  const deleteTask = useCallback(
    (id: string): void => {
      const exists = tasksStore.value.some((task) => task.id === id);

      if (!exists) {
        throw new StateEngineError(`Task with id "${id}" was not found.`);
      }

      tasksStore.setValue((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );
    },
    [tasksStore]
  );

  const clearTasks = useCallback((): void => {
    tasksStore.setValue([]);
  }, [tasksStore]);

  const getNotifications = useCallback(
    (): Notification[] => notificationsStore.value,
    [notificationsStore.value]
  );

  const getUnreadNotifications = useCallback((): Notification[] => {
    return notificationsStore.value.filter((notification) => !notification.read);
  }, [notificationsStore.value]);

  const getNotificationById = useCallback(
    (id: string): Notification | undefined =>
      notificationsStore.value.find((notification) => notification.id === id),
    [notificationsStore.value]
  );

  const addNotification = useCallback(
    (input: CreateNotificationInput): Notification => {
      const notification = buildNotification(input);
      notificationsStore.setValue((previousNotifications) => [
        notification,
        ...previousNotifications,
      ]);
      return notification;
    },
    [notificationsStore]
  );

  const updateNotification = useCallback(
    (id: string, input: UpdateNotificationInput): Notification => {
      const existingNotification = notificationsStore.value.find(
        (notification) => notification.id === id
      );

      if (!existingNotification) {
        throw new StateEngineError(`Notification with id "${id}" was not found.`);
      }

      const updatedNotification = applyNotificationUpdate(
        existingNotification,
        input
      );

      notificationsStore.setValue((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === id ? updatedNotification : notification
        )
      );

      return updatedNotification;
    },
    [notificationsStore]
  );

  const markNotificationRead = useCallback(
    (id: string, read = true): Notification => {
      return updateNotification(id, { read });
    },
    [updateNotification]
  );

  const markAllNotificationsRead = useCallback((): void => {
    notificationsStore.setValue((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }, [notificationsStore]);

  const deleteNotification = useCallback(
    (id: string): void => {
      const exists = notificationsStore.value.some(
        (notification) => notification.id === id
      );

      if (!exists) {
        throw new StateEngineError(`Notification with id "${id}" was not found.`);
      }

      notificationsStore.setValue((previousNotifications) =>
        previousNotifications.filter((notification) => notification.id !== id)
      );
    },
    [notificationsStore]
  );

  const clearNotifications = useCallback((): void => {
    notificationsStore.setValue([]);
  }, [notificationsStore]);

  const getSettings = useCallback(
    (): Settings => settingsStore.value,
    [settingsStore.value]
  );

  const updateSettings = useCallback(
    (input: UpdateSettingsInput): Settings => {
      const nextSettings = mergeSettings(settingsStore.value, input);
      settingsStore.setValue(nextSettings);
      return nextSettings;
    },
    [settingsStore]
  );

  const resetSettingsToDefault = useCallback((): Settings => {
    settingsStore.setValue(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }, [settingsStore]);

  return useMemo(
    () => ({
      tasks: tasksStore.value,
      notifications: notificationsStore.value,
      settings: settingsStore.value,
      isHydrated,
      hydration: {
        tasks: tasksStore.isHydrated,
        notifications: notificationsStore.isHydrated,
        settings: settingsStore.isHydrated,
      },
      recovery: {
        reloadFromStorage,
        resetTasks,
        resetNotifications,
        resetSettings,
        resetAll,
      },
      tasksApi: {
        getTasks,
        getTasksByFilter,
        getTaskById,
        createTask,
        updateTask,
        deleteTask,
        clearTasks,
      },
      notificationsApi: {
        getNotifications,
        getUnreadNotifications,
        getNotificationById,
        addNotification,
        updateNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearNotifications,
      },
      settingsApi: {
        getSettings,
        updateSettings,
        resetSettingsToDefault,
      },
    }),
    [
      tasksStore.value,
      notificationsStore.value,
      settingsStore.value,
      isHydrated,
      tasksStore.isHydrated,
      notificationsStore.isHydrated,
      settingsStore.isHydrated,
      reloadFromStorage,
      resetTasks,
      resetNotifications,
      resetSettings,
      resetAll,
      getTasks,
      getTasksByFilter,
      getTaskById,
      createTask,
      updateTask,
      deleteTask,
      clearTasks,
      getNotifications,
      getUnreadNotifications,
      getNotificationById,
      addNotification,
      updateNotification,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearNotifications,
      getSettings,
      updateSettings,
      resetSettingsToDefault,
    ]
  );
}

export type StateEngine = ReturnType<typeof useStateEngine>;

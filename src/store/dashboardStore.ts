"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_SETTINGS,
  Notification,
  Settings,
} from "../types/notification";
import {
  CreateTaskInput,
  FilterType,
  Task,
  UpdateTaskInput,
} from "../types/todo";
import {
  applyNotificationUpdate,
  applyTaskUpdate,
  buildNotification,
  buildTask,
  CreateNotificationInput,
  DashboardStoreError,
  DEFAULT_DASHBOARD_STATE,
  filterTasks,
  mergeSettings,
  UpdateNotificationInput,
  UpdateSettingsInput,
} from "./dashboardStore.helpers";
import { dashboardStorage, STORAGE_KEYS } from "./dashboardStorage";

interface DashboardState {
  tasks: Task[];
  notifications: Notification[];
  settings: Settings;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  getTasks: () => Task[];
  getTasksByFilter: (filter: FilterType) => Task[];
  getTaskById: (id: string) => Task | undefined;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => Task;
  deleteTask: (id: string) => void;
  clearTasks: () => void;

  getNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  getNotificationById: (id: string) => Notification | undefined;
  addNotification: (input: CreateNotificationInput) => Notification;
  updateNotification: (
    id: string,
    input: UpdateNotificationInput
  ) => Notification;
  markNotificationRead: (id: string, read?: boolean) => Notification;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;

  getSettings: () => Settings;
  updateSettings: (input: UpdateSettingsInput) => Settings;
  resetSettingsToDefault: () => Settings;

  reloadFromStorage: () => void;
  resetTasks: () => void;
  resetNotifications: () => void;
  resetSettings: () => void;
  resetAll: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_DASHBOARD_STATE,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      getTasks: () => get().tasks,

      getTasksByFilter: (filter) => filterTasks(get().tasks, filter),

      getTaskById: (id) => get().tasks.find((task) => task.id === id),

      createTask: (input) => {
        const task = buildTask(input);
        set((state) => ({ tasks: [...state.tasks, task] }));
        return task;
      },

      updateTask: (id, input) => {
        const existingTask = get().tasks.find((task) => task.id === id);

        if (!existingTask) {
          throw new DashboardStoreError(`Task with id "${id}" was not found.`);
        }

        const updatedTask = applyTaskUpdate(existingTask, input);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? updatedTask : task
          ),
        }));

        return updatedTask;
      },

      deleteTask: (id) => {
        const exists = get().tasks.some((task) => task.id === id);

        if (!exists) {
          throw new DashboardStoreError(`Task with id "${id}" was not found.`);
        }

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      clearTasks: () => set({ tasks: [] }),

      getNotifications: () => get().notifications,

      getUnreadNotifications: () =>
        get().notifications.filter((notification) => !notification.read),

      getNotificationById: (id) =>
        get().notifications.find((notification) => notification.id === id),

      addNotification: (input) => {
        const notification = buildNotification(input);
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
        return notification;
      },

      updateNotification: (id, input) => {
        const existingNotification = get().notifications.find(
          (notification) => notification.id === id
        );

        if (!existingNotification) {
          throw new DashboardStoreError(
            `Notification with id "${id}" was not found.`
          );
        }

        const updatedNotification = applyNotificationUpdate(
          existingNotification,
          input
        );

        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? updatedNotification : notification
          ),
        }));

        return updatedNotification;
      },

      markNotificationRead: (id, read = true) =>
        get().updateNotification(id, { read }),

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        }));
      },

      deleteNotification: (id) => {
        const exists = get().notifications.some(
          (notification) => notification.id === id
        );

        if (!exists) {
          throw new DashboardStoreError(
            `Notification with id "${id}" was not found.`
          );
        }

        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      getSettings: () => get().settings,

      updateSettings: (input) => {
        const nextSettings = mergeSettings(get().settings, input);
        set({ settings: nextSettings });
        return nextSettings;
      },

      resetSettingsToDefault: () => {
        set({ settings: DEFAULT_SETTINGS });
        return DEFAULT_SETTINGS;
      },

      reloadFromStorage: () => {
        useDashboardStore.persist.rehydrate();
      },

      resetTasks: () => set({ tasks: [] }),

      resetNotifications: () => set({ notifications: [] }),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      resetAll: () =>
        set({
          tasks: [],
          notifications: [],
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: STORAGE_KEYS.store,
      storage: createJSONStorage(() => dashboardStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        notifications: state.notifications,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export type DashboardStore = typeof useDashboardStore;

"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDashboardStore } from "../store/dashboardStore";

export {
  DashboardStoreError,
  StateEngineError,
  type CreateNotificationInput,
  type UpdateNotificationInput,
  type UpdateSettingsInput,
} from "../store/dashboardStore.helpers";
export { STORAGE_KEYS } from "../store/dashboardStorage";

/**
 * Compatibility hook that mirrors the previous useStateEngine API
 * while reading from the Zustand dashboard store.
 */
export function useStateEngine() {
  const state = useDashboardStore(
    useShallow((store) => ({
      tasks: store.tasks,
      notifications: store.notifications,
      settings: store.settings,
      hasHydrated: store.hasHydrated,
      getTasks: store.getTasks,
      getTasksByFilter: store.getTasksByFilter,
      getTaskById: store.getTaskById,
      createTask: store.createTask,
      updateTask: store.updateTask,
      deleteTask: store.deleteTask,
      clearTasks: store.clearTasks,
      getNotifications: store.getNotifications,
      getUnreadNotifications: store.getUnreadNotifications,
      getNotificationById: store.getNotificationById,
      addNotification: store.addNotification,
      updateNotification: store.updateNotification,
      markNotificationRead: store.markNotificationRead,
      markAllNotificationsRead: store.markAllNotificationsRead,
      deleteNotification: store.deleteNotification,
      clearNotifications: store.clearNotifications,
      getSettings: store.getSettings,
      updateSettings: store.updateSettings,
      resetSettingsToDefault: store.resetSettingsToDefault,
      reloadFromStorage: store.reloadFromStorage,
      resetTasks: store.resetTasks,
      resetNotifications: store.resetNotifications,
      resetSettings: store.resetSettings,
      resetAll: store.resetAll,
    }))
  );

  return useMemo(
    () => ({
      tasks: state.tasks,
      notifications: state.notifications,
      settings: state.settings,
      isHydrated: state.hasHydrated,
      hydration: {
        tasks: state.hasHydrated,
        notifications: state.hasHydrated,
        settings: state.hasHydrated,
      },
      recovery: {
        reloadFromStorage: state.reloadFromStorage,
        resetTasks: state.resetTasks,
        resetNotifications: state.resetNotifications,
        resetSettings: state.resetSettings,
        resetAll: state.resetAll,
      },
      tasksApi: {
        getTasks: state.getTasks,
        getTasksByFilter: state.getTasksByFilter,
        getTaskById: state.getTaskById,
        createTask: state.createTask,
        updateTask: state.updateTask,
        deleteTask: state.deleteTask,
        clearTasks: state.clearTasks,
      },
      notificationsApi: {
        getNotifications: state.getNotifications,
        getUnreadNotifications: state.getUnreadNotifications,
        getNotificationById: state.getNotificationById,
        addNotification: state.addNotification,
        updateNotification: state.updateNotification,
        markNotificationRead: state.markNotificationRead,
        markAllNotificationsRead: state.markAllNotificationsRead,
        deleteNotification: state.deleteNotification,
        clearNotifications: state.clearNotifications,
      },
      settingsApi: {
        getSettings: state.getSettings,
        updateSettings: state.updateSettings,
        resetSettingsToDefault: state.resetSettingsToDefault,
      },
    }),
    [state]
  );
}

export type StateEngine = ReturnType<typeof useStateEngine>;

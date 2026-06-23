import type { StateStorage } from "zustand/middleware";

import { parseStoredTasks } from "../lib/taskStorage";
import {
  DEFAULT_SETTINGS,
  parseStoredNotifications,
  parseStoredSettings,
} from "../types/notification";
import { DEFAULT_DASHBOARD_STATE } from "./dashboardStore.helpers";

export const STORAGE_KEYS = {
  store: "productivity-dashboard:store",
  tasks: "productivity-dashboard:tasks",
  notifications: "productivity-dashboard:notifications",
  settings: "productivity-dashboard:settings",
} as const;

interface PersistedSlice {
  tasks?: unknown;
  notifications?: unknown;
  settings?: unknown;
}

interface PersistedEnvelope {
  state?: PersistedSlice;
  version?: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function hydratePersistedSlice(slice: PersistedSlice | undefined) {
  if (!slice) {
    return DEFAULT_DASHBOARD_STATE;
  }

  return {
    tasks: Array.isArray(slice.tasks)
      ? parseStoredTasks(JSON.stringify(slice.tasks))
      : DEFAULT_DASHBOARD_STATE.tasks,
    notifications: Array.isArray(slice.notifications)
      ? parseStoredNotifications(JSON.stringify(slice.notifications))
      : DEFAULT_DASHBOARD_STATE.notifications,
    settings:
      slice.settings && typeof slice.settings === "object"
        ? parseStoredSettings(JSON.stringify(slice.settings))
        : DEFAULT_DASHBOARD_STATE.settings,
  };
}

function loadLegacyPersistedValue(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const tasksRaw = window.localStorage.getItem(STORAGE_KEYS.tasks);
  const notificationsRaw = window.localStorage.getItem(STORAGE_KEYS.notifications);
  const settingsRaw = window.localStorage.getItem(STORAGE_KEYS.settings);

  if (!tasksRaw && !notificationsRaw && !settingsRaw) {
    return null;
  }

  const envelope: PersistedEnvelope = {
    state: {
      tasks: tasksRaw ? parseStoredTasks(tasksRaw) : [],
      notifications: notificationsRaw
        ? parseStoredNotifications(notificationsRaw)
        : [],
      settings: settingsRaw ? parseStoredSettings(settingsRaw) : DEFAULT_SETTINGS,
    },
    version: 0,
  };

  return JSON.stringify(envelope);
}

function normalizePersistedValue(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as PersistedEnvelope;
    const hydrated = hydratePersistedSlice(parsed.state);

    return JSON.stringify({
      state: hydrated,
      version: parsed.version ?? 0,
    });
  } catch {
    return JSON.stringify({
      state: DEFAULT_DASHBOARD_STATE,
      version: 0,
    });
  }
}

export const dashboardStorage: StateStorage = {
  getItem: (name) => {
    if (!isBrowser()) {
      return null;
    }

    const stored = window.localStorage.getItem(name);
    if (stored) {
      return normalizePersistedValue(stored);
    }

    const legacy = loadLegacyPersistedValue();
    if (legacy) {
      return normalizePersistedValue(legacy);
    }

    return null;
  },
  setItem: (name, value) => {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(name);
    window.localStorage.removeItem(STORAGE_KEYS.tasks);
    window.localStorage.removeItem(STORAGE_KEYS.notifications);
    window.localStorage.removeItem(STORAGE_KEYS.settings);
  },
};

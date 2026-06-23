export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export type Theme = "light" | "dark";

export interface Settings {
  theme: Theme;
  enableDeadlineNotifications: boolean;
  enableToastNotifications: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  enableDeadlineNotifications: true,
  enableToastNotifications: true,
};

/** JSON-safe shape persisted in localStorage. */
export interface StoredNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export function serializeNotification(
  notification: Notification
): StoredNotification {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function deserializeNotification(
  stored: StoredNotification
): Notification {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt),
  };
}

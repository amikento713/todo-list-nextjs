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

function normalizeNotification(raw: unknown): Notification | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<StoredNotification>;
  const createdAt =
    typeof candidate.createdAt === "string"
      ? candidate.createdAt
      : undefined;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    typeof candidate.message !== "string" ||
    typeof candidate.read !== "boolean" ||
    !createdAt ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    return null;
  }

  return deserializeNotification({
    id: candidate.id,
    title: candidate.title,
    message: candidate.message,
    createdAt,
    read: candidate.read,
  });
}

export function parseStoredNotifications(raw: string): Notification[] {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeNotification)
      .filter((notification): notification is Notification => notification !== null);
  } catch {
    return [];
  }
}

export function serializeNotifications(notifications: Notification[]): string {
  return JSON.stringify(notifications.map(serializeNotification));
}

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function parseStoredSettings(raw: string): Settings {
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>;

    if (
      !isTheme(parsed.theme) ||
      typeof parsed.enableDeadlineNotifications !== "boolean" ||
      typeof parsed.enableToastNotifications !== "boolean"
    ) {
      return DEFAULT_SETTINGS;
    }

    return {
      theme: parsed.theme,
      enableDeadlineNotifications: parsed.enableDeadlineNotifications,
      enableToastNotifications: parsed.enableToastNotifications,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function serializeSettings(settings: Settings): string {
  return JSON.stringify(settings);
}

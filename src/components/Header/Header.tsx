"use client";

import styles from "./Header.module.css";

interface HeaderProps {
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3a5 5 0 0 0-5 5v2.1c0 .5-.2 1-.5 1.4L5.1 13.8A1 1 0 0 0 6 15.5h12a1 1 0 0 0 .9-1.7l-1.4-2.3c-.3-.4-.5-.9-.5-1.4V8a5 5 0 0 0-5-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.2-2-3.5-2.3.7a7.7 7.7 0 0 0-1.7-1L15.5 3h-7L8.5 6a7.7 7.7 0 0 0-1.7 1L4.5 6.3l-2 3.5 2 1.2a7.8 7.8 0 0 0 0 2l-2 1.2 2 3.5 2.3-.7a7.7 7.7 0 0 0 1.7 1L8.5 21h7l.3-3a7.7 7.7 0 0 0 1.7-1l2.3.7 2-3.5-2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header({
  unreadCount,
  onOpenNotifications,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>My Tasks</h1>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onOpenNotifications}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className={styles.badge} aria-hidden="true">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={onOpenSettings}
          aria-label="Open settings"
        >
          <SettingsIcon />
        </button>

        <div className={styles.avatar} aria-label="User avatar" title="User">
          MT
        </div>
      </div>
    </header>
  );
}

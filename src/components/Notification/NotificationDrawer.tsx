"use client";

import { useEffect } from "react";

import { Notification } from "../../types/notification";
import styles from "./NotificationDrawer.module.css";

interface NotificationDrawerProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function stripTaskKey(message: string): string {
  return message.replace(/\[task:[^\]]+\]\s?/, "");
}

export default function NotificationDrawer({
  isOpen,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: NotificationDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const hasUnread = notifications.some((notification) => !notification.read);

  return (
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-drawer-title"
      >
        <div className={styles.header}>
          <h2 id="notification-drawer-title" className={styles.title}>
            Notifications
          </h2>

          <div className={styles.headerActions}>
            {hasUnread && (
              <button
                type="button"
                className={styles.textButton}
                onClick={onMarkAllRead}
              >
                Mark all as read
              </button>
            )}
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.list}>
          {notifications.length === 0 ? (
            <p className={styles.emptyState}>No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <article
                key={notification.id}
                className={`${styles.item} ${
                  !notification.read ? styles.itemUnread : ""
                }`}
              >
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{notification.title}</h3>
                  <time
                    className={styles.itemTime}
                    dateTime={notification.createdAt.toISOString()}
                  >
                    {formatTimestamp(notification.createdAt)}
                  </time>
                </div>

                <p className={styles.itemMessage}>
                  {stripTaskKey(notification.message)}
                </p>

                <div className={styles.itemActions}>
                  {!notification.read && (
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => onMarkRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => onDelete(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

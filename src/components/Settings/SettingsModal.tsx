"use client";

import { useEffect, useState } from "react";

import { Settings, Theme } from "../../types/notification";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  isOpen: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

export default function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSave,
}: SettingsModalProps) {
  const [draft, setDraft] = useState<Settings>(settings);

  useEffect(() => {
    if (isOpen) {
      setDraft(settings);
    }
  }, [isOpen, settings]);

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

  const setTheme = (theme: Theme) => {
    setDraft((previous) => ({ ...previous, theme }));
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className={styles.header}>
          <h2 id="settings-modal-title" className={styles.title}>
            Settings
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.row}>
            <div>
              <div className={styles.rowLabel}>Theme</div>
              <div className={styles.rowHint}>Switch between light and dark mode</div>
            </div>
            <div className={styles.themeToggle} role="group" aria-label="Theme selection">
              <button
                type="button"
                className={`${styles.themeButton} ${
                  draft.theme === "light" ? styles.themeButtonActive : ""
                }`}
                onClick={() => setTheme("light")}
                aria-pressed={draft.theme === "light"}
              >
                Light
              </button>
              <button
                type="button"
                className={`${styles.themeButton} ${
                  draft.theme === "dark" ? styles.themeButtonActive : ""
                }`}
                onClick={() => setTheme("dark")}
                aria-pressed={draft.theme === "dark"}
              >
                Dark
              </button>
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={draft.enableDeadlineNotifications}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  enableDeadlineNotifications: event.target.checked,
                }))
              }
            />
            <span>
              <div className={styles.rowLabel}>Enable Deadline Notifications</div>
              <div className={styles.rowHint}>
                Receive alerts when tasks are due today, tomorrow, or overdue
              </div>
            </span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={draft.enableToastNotifications}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  enableToastNotifications: event.target.checked,
                }))
              }
            />
            <span>
              <div className={styles.rowLabel}>Enable Toast Notifications</div>
              <div className={styles.rowHint}>
                Show pop-up toasts when new alerts are generated
              </div>
            </span>
          </label>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useShallow } from "zustand/react/shallow";

import DashboardLayout from "../components/Dashboard/DashboardLayout";
import Header from "../components/Header/Header";
import NotificationDrawer from "../components/Notification/NotificationDrawer";
import SettingsModal from "../components/Settings/SettingsModal";
import PdfPreviewModal from "../components/Task/PdfPreviewModal";
import TaskCard from "../components/Task/TaskCard";
import TaskForm, { TaskFormSubmitPayload } from "../components/Task/TaskForm";
import { useDeadlineMonitor } from "../hooks/useDeadlineMonitor";
import { computeTaskOverviewMetrics } from "../lib/taskAnalytics";
import { DashboardStoreError } from "../store/dashboardStore.helpers";
import { useDashboardStore } from "../store/dashboardStore";
import { Settings } from "../types/notification";
import { FilterType, UpdateTaskInput } from "../types/todo";
import styles from "./page.module.css";

interface PdfPreviewState {
  url: string;
  fileName: string;
}

const FILTER_LABELS: Record<FilterType, string> = {
  all: "All",
  pending: "Active",
  completed: "Completed",
};

export default function DashboardPage() {
  useDeadlineMonitor();

  const {
    tasks,
    notifications,
    settings,
    hasHydrated,
    createTask,
    getTasksByFilter,
    getTaskById,
    updateTask,
    deleteTask,
    updateSettings,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useDashboardStore(
    useShallow((state) => ({
      tasks: state.tasks,
      notifications: state.notifications,
      settings: state.settings,
      hasHydrated: state.hasHydrated,
      createTask: state.createTask,
      getTasksByFilter: state.getTasksByFilter,
      getTaskById: state.getTaskById,
      updateTask: state.updateTask,
      deleteTask: state.deleteTask,
      updateSettings: state.updateSettings,
      markNotificationRead: state.markNotificationRead,
      markAllNotificationsRead: state.markAllNotificationsRead,
      deleteNotification: state.deleteNotification,
    }))
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<PdfPreviewState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const metrics = useMemo(() => computeTaskOverviewMetrics(tasks), [tasks]);

  const filteredTasks = useMemo(
    () => getTasksByFilter(filter),
    [getTasksByFilter, filter, tasks]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const handleAddTask = useCallback(
    async (payload: TaskFormSubmitPayload) => {
      setError(null);
      try {
        createTask(payload);
      } catch (taskError) {
        const message =
          taskError instanceof DashboardStoreError
            ? taskError.message
            : "Failed to add task.";
        setError(message);
        throw taskError;
      }
    },
    [createTask]
  );

  const handleToggleTask = useCallback(
    (id: string) => {
      setError(null);
      try {
        const task = getTaskById(id);
        if (!task) {
          return;
        }
        updateTask(id, { completed: !task.completed });
      } catch (taskError) {
        setError(
          taskError instanceof DashboardStoreError
            ? taskError.message
            : "Failed to update task."
        );
      }
    },
    [getTaskById, updateTask]
  );

  const handleEditTask = useCallback(
    (id: string, input: UpdateTaskInput) => {
      setError(null);
      try {
        updateTask(id, input);
      } catch (taskError) {
        setError(
          taskError instanceof DashboardStoreError
            ? taskError.message
            : "Failed to update task."
        );
      }
    },
    [updateTask]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      setError(null);
      try {
        deleteTask(id);
      } catch (taskError) {
        setError(
          taskError instanceof DashboardStoreError
            ? taskError.message
            : "Failed to delete task."
        );
      }
    },
    [deleteTask]
  );

  const handleSaveSettings = useCallback(
    (nextSettings: Settings) => {
      updateSettings(nextSettings);
    },
    [updateSettings]
  );

  const handleMarkNotificationRead = useCallback(
    (id: string) => {
      markNotificationRead(id);
    },
    [markNotificationRead]
  );

  const handleMarkAllNotificationsRead = useCallback(() => {
    markAllNotificationsRead();
  }, [markAllNotificationsRead]);

  const handleDeleteNotification = useCallback(
    (id: string) => {
      deleteNotification(id);
    },
    [deleteNotification]
  );

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          },
        }}
      />

      <Header
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <DashboardLayout metrics={metrics}>
        <div className={styles.feedHeader}>
          <h2 className={styles.feedTitle}>Task Feed</h2>

          <div
            className={styles.filterGroup}
            role="group"
            aria-label="Filter tasks"
          >
            {(Object.keys(FILTER_LABELS) as FilterType[]).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                className={`${styles.filterButton} ${
                  filter === filterKey ? styles.filterButtonActive : ""
                }`}
                onClick={() => setFilter(filterKey)}
                aria-pressed={filter === filterKey}
              >
                {FILTER_LABELS[filterKey]}
              </button>
            ))}
          </div>
        </div>

        {!hasHydrated ? (
          <p className={styles.loadingState}>Loading your dashboard...</p>
        ) : (
          <>
            <TaskForm
              onSubmit={handleAddTask}
              onPreviewPdf={(url, fileName) => setPdfPreview({ url, fileName })}
            />

            {error && <p className={styles.errorBanner}>{error}</p>}

            {filteredTasks.length === 0 ? (
              <p className={styles.emptyState}>
                No tasks in this view. Add a task or switch filters.
              </p>
            ) : (
              <div className={styles.taskList}>
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onPreviewPdf={(url, fileName) =>
                      setPdfPreview({ url, fileName })
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </DashboardLayout>

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        notifications={notifications}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDelete={handleDeleteNotification}
      />

      {pdfPreview && (
        <PdfPreviewModal
          url={pdfPreview.url}
          fileName={pdfPreview.fileName}
          onClose={() => setPdfPreview(null)}
        />
      )}
    </>
  );
}

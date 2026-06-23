"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

import {
  buildTaskNotificationKey,
  DeadlineCategory,
  getDeadlineCategory,
  notificationContainsTaskKey,
} from "../lib/deadlineUtils";
import { Notification } from "../types/notification";
import { Task } from "../types/todo";
import { useDashboardStore } from "../store/dashboardStore";

const MONITOR_INTERVAL_MS = 60_000;

interface DeadlineAlert {
  category: DeadlineCategory;
  title: string;
  message: string;
}

function buildAlert(task: Task, category: DeadlineCategory): DeadlineAlert {
  const taskKey = buildTaskNotificationKey(task.id, category);

  switch (category) {
    case "overdue":
      return {
        category,
        title: "Task Overdue",
        message: `[${taskKey}] "${task.text}" is overdue.`,
      };
    case "due-today":
      return {
        category,
        title: "Due Today",
        message: `[${taskKey}] "${task.text}" is due today.`,
      };
    case "due-tomorrow":
      return {
        category,
        title: "Due Tomorrow",
        message: `[${taskKey}] "${task.text}" is due tomorrow.`,
      };
  }
}

function hasExistingAlert(
  notifications: Notification[],
  taskId: string,
  category: DeadlineCategory
): boolean {
  return notifications.some((notification) =>
    notificationContainsTaskKey(notification.message, taskId, category)
  );
}

export function useDeadlineMonitor(): void {
  const hasHydrated = useDashboardStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const runPass = () => {
      const { tasks, notifications, settings, addNotification } =
        useDashboardStore.getState();

      if (!settings.enableDeadlineNotifications) {
        return;
      }

      for (const task of tasks) {
        const category = getDeadlineCategory(task.deadline, task.completed);

        if (!category) {
          continue;
        }

        if (hasExistingAlert(notifications, task.id, category)) {
          continue;
        }

        const alert = buildAlert(task, category);
        addNotification({
          title: alert.title,
          message: alert.message,
        });

        if (settings.enableToastNotifications) {
          toast(alert.message.replace(/\[task:[^\]]+\]\s?/, ""), {
            icon: category === "overdue" ? "⚠️" : "📅",
          });
        }
      }
    };

    runPass();
    const intervalId = window.setInterval(runPass, MONITOR_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasHydrated]);
}

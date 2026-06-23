"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  CreateTaskInput,
  FilterType,
  Task,
  UpdateTaskInput,
} from "../types/todo";
import { DashboardStoreError } from "../store/dashboardStore.helpers";
import { useDashboardStore } from "../store/dashboardStore";
import { STORAGE_KEYS } from "../store/dashboardStorage";

export { parseStoredTasks, serializeTasks } from "../lib/taskStorage";

export const TASKS_STORAGE_KEY = STORAGE_KEYS.tasks;

/** @deprecated Use DashboardStoreError */
export const TaskValidationError = DashboardStoreError;

export function useTaskService() {
  const state = useDashboardStore(
    useShallow((store) => ({
      tasks: store.tasks,
      hasHydrated: store.hasHydrated,
      getTasks: store.getTasks,
      getTasksByFilter: store.getTasksByFilter,
      getTaskById: store.getTaskById,
      createTask: store.createTask,
      updateTask: store.updateTask,
      deleteTask: store.deleteTask,
      clearTasks: store.clearTasks,
    }))
  );

  return useMemo(
    () => ({
      tasks: state.tasks,
      isHydrated: state.hasHydrated,
      getTasks: state.getTasks,
      getTasksByFilter: state.getTasksByFilter,
      getTaskById: state.getTaskById,
      createTask: state.createTask,
      updateTask: state.updateTask,
      deleteTask: state.deleteTask,
      clearTasks: state.clearTasks,
    }),
    [state]
  );
}

export type TaskService = ReturnType<typeof useTaskService>;

export type { CreateTaskInput, FilterType, Task, UpdateTaskInput };

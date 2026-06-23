"use client";

import { useState } from "react";
import { Task } from "../types/task";
import TodoCard from "./TodoCard";
import PdfPreviewModal from "./PdfPreviewModal";
import styles from "../styles/Todo.module.css";

interface TodoListProps {
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  onDeleteTask: (id: number) => void;
  onToggleTask: (id: number) => void;
  onUpdateTask: (id: number, text: string, deadline: string) => void;
  onRemoveBook: (id: number) => void;
  disabled?: boolean;
}

export default function TodoList({
  tasks,
  totalTasks,
  completedTasks,
  onDeleteTask,
  onToggleTask,
  onUpdateTask,
  onRemoveBook,
  disabled = false,
}: TodoListProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const active = totalTasks - completedTasks;

  return (
    <>
      <div className={styles.listHeader}>
        <h3>TodoList</h3>
        <div className={styles.listSummary}>
          Active Tasks: {active} | Completed Tasks: {completedTasks}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className={styles.emptyState}>No tasks match this filter.</p>
      ) : (
        <div className={styles.list}>
          {tasks.map((task) => (
            <TodoCard
              key={task.id}
              task={task}
              onDeleteTask={onDeleteTask}
              onToggleTask={onToggleTask}
              onUpdateTask={onUpdateTask}
              onRemoveBook={onRemoveBook}
              onPreview={setPreviewUrl}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {previewUrl && (
        <PdfPreviewModal
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </>
  );
}

import { isDueSoon } from "./deadlineUtils";
import { Task } from "../types/todo";

export interface TaskOverviewMetrics {
  active: number;
  dueSoon: number;
  completed: number;
}

export function computeTaskOverviewMetrics(tasks: Task[]): TaskOverviewMetrics {
  let active = 0;
  let dueSoon = 0;
  let completed = 0;

  for (const task of tasks) {
    if (task.completed) {
      completed += 1;
      continue;
    }
    console.log("function:", isDueSoon(task.deadline, task.completed));

    if (isDueSoon(task.deadline, task.completed)) {
      dueSoon += 1;
    } else {
      active += 1;
    }
  }
  console.log({ active, dueSoon, completed });

  return { active, dueSoon, completed };
}

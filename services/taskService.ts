import { Task } from "../types/task";

let tasks: Task[] = [];

export const taskService = {
  async getTasks(): Promise<Task[]> {
    return tasks;
  },

  async createTask(
    task: Task
  ): Promise<Task> {
    tasks.push(task);

    return task;
  },

  async updateTask(
    updatedTask: Task
  ): Promise<Task> {
    tasks = tasks.map((task) =>
      task.id === updatedTask.id
        ? updatedTask
        : task
    );

    return updatedTask;
  },

  async deleteTask(
    id: number
  ): Promise<void> {
    tasks = tasks.filter(
      (task) => task.id !== id
    );
  },
};
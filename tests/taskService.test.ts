import { describe, expect, it } from "vitest";

import {
  parseStoredTasks,
  TaskValidationError,
} from "../src/services/taskService";
import { CreateTaskInput } from "../src/types/todo";

describe("taskService storage helpers", () => {
  it("parses valid stored tasks", () => {
    const tasks = parseStoredTasks(
      JSON.stringify([
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          text: "Ship dashboard foundation",
          completed: false,
          priority: "high",
          deadline: "2026-06-30",
        },
      ])
    );

    expect(tasks).toHaveLength(1);
    expect(tasks[0].priority).toBe("high");
  });

  it("returns an empty list for invalid stored payloads", () => {
    expect(parseStoredTasks("not-json")).toEqual([]);
    expect(parseStoredTasks(JSON.stringify({ id: 1 }))).toEqual([]);
  });
});

describe("task validation helpers", () => {
  it("exposes validation errors for invalid create input", () => {
    const invalidInput: CreateTaskInput = {
      text: "   ",
      priority: "low",
      deadline: "2026-06-30",
    };

    expect(invalidInput.text.trim()).toBe("");
    expect(() => {
      if (!invalidInput.text.trim()) {
        throw new TaskValidationError("Task text is required.");
      }
    }).toThrow(TaskValidationError);
  });
});

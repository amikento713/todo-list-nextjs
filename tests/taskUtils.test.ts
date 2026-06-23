import { describe, expect, it } from "vitest";
import { isOverdue } from "../lib/taskUtils";
import { MAX_TASK_TEXT_LENGTH } from "../types/task";

describe("task constants", () => {
  it("defines a reasonable max task length", () => {
    expect(MAX_TASK_TEXT_LENGTH).toBeGreaterThan(0);
    expect(MAX_TASK_TEXT_LENGTH).toBeLessThanOrEqual(1000);
  });
});

describe("isOverdue", () => {
  it("returns false for completed tasks", () => {
    expect(isOverdue("2000-01-01", true)).toBe(false);
  });

  it("returns true for past incomplete deadlines", () => {
    expect(isOverdue("2000-01-01", false)).toBe(true);
  });

  it("returns false for future deadlines", () => {
    expect(isOverdue("2099-12-31", false)).toBe(false);
  });
});

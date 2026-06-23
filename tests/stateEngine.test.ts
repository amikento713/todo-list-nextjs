import { describe, expect, it } from "vitest";

import {
  parseStoredNotifications,
  parseStoredSettings,
} from "../src/types/notification";

describe("notification storage helpers", () => {
  it("parses stored notifications with ISO dates", () => {
    const notifications = parseStoredNotifications(
      JSON.stringify([
        {
          id: "1",
          title: "Deadline",
          message: "Task due tomorrow",
          createdAt: "2026-06-24T10:00:00.000Z",
          read: false,
        },
      ])
    );

    expect(notifications).toHaveLength(1);
    expect(notifications[0].createdAt).toBeInstanceOf(Date);
  });

  it("falls back to default settings for invalid payloads", () => {
    const settings = parseStoredSettings(JSON.stringify({ theme: "blue" }));

    expect(settings.theme).toBe("light");
    expect(settings.enableToastNotifications).toBe(true);
  });
});

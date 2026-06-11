/**
 * GHL Webhook Router Tests
 * 
 * NOTE: These tests are for the legacy webhook handler.
 * The new implementation uses GHL API pull-based approach (see ghlApi.ts).
 * These tests are kept for backward compatibility and documentation.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleFloristApplicationWebhook } from "../webhooks/ghlFloristWebhook";
import { getDb } from "../db";

// Mock the database
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

describe("GHL Webhook Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should skip webhook if contact has no florist-under-review tag", async () => {
    const payload = {
      type: "contact.created",
      contact: {
        id: "contact-123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        tags: ["other-tag"],
      },
    };

    // Should not throw
    await handleFloristApplicationWebhook(payload);
  });

  it("should skip webhook if no contact data", async () => {
    const payload = {
      type: "contact.created",
    };

    // Should not throw
    await handleFloristApplicationWebhook(payload);
  });

  it.skip("should extract contact data correctly", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const payload = {
      type: "contact.created",
      contact: {
        id: "contact-123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "555-1234",
        tags: ["florist-under-review"],
        customFields: {
          businessName: "Doe Flowers",
          city: "Oklahoma City",
          monthlyVolume: "500",
          flowerTypes: "Zinnias, Dahlias",
          message: "Interested in wholesale",
        },
      },
    };

    await handleFloristApplicationWebhook(payload);

    // Verify insert was called with correct data
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it.skip("should skip duplicate applications (same email)", async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 1, email: "john@example.com" }]),
          }),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const payload = {
      type: "contact.created",
      contact: {
        id: "contact-123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        tags: ["florist-under-review"],
      },
    };

    await handleFloristApplicationWebhook(payload);

    // Insert should NOT be called for duplicate
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});

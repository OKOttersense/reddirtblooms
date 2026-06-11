import { describe, it, expect } from "vitest";
import "dotenv/config";

describe("GHL credentials", () => {
  it("GHL_API_KEY and GHL_LOCATION_ID are set", () => {
    expect(process.env.GHL_API_KEY, "GHL_API_KEY must be set").toBeTruthy();
    expect(process.env.GHL_LOCATION_ID, "GHL_LOCATION_ID must be set").toBeTruthy();
  });

  it("GHL API key is valid (can reach contacts endpoint)", async () => {
    const apiKey = process.env.GHL_API_KEY!;
    const locationId = process.env.GHL_LOCATION_ID!;

    const res = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${encodeURIComponent(locationId)}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
      }
    );

    expect(res.status, `GHL API returned ${res.status} — check your API key and Location ID`).toBe(200);
  }, 15000);
});

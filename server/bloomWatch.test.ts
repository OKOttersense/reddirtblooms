import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("bloomWatch.subscribe", () => {
  it("rejects invalid email addresses", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bloomWatch.subscribe({ email: "not-an-email", source: "test" })
    ).rejects.toThrow();
  });

  it("accepts a valid email and returns a success message (idempotent)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // Use a unique email per test run to avoid duplicate key conflicts
    const uniqueEmail = `test-${Date.now()}@reddirtblooms.com`;
    const result = await caller.bloomWatch.subscribe({
      email: uniqueEmail,
      source: "test",
    });
    expect(result).toHaveProperty("message");
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.success).toBe(true);
  });

  it("handles duplicate email gracefully (idempotent re-subscribe)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const uniqueEmail = `dup-${Date.now()}@reddirtblooms.com`;
    // First subscribe
    await caller.bloomWatch.subscribe({ email: uniqueEmail, source: "test" });
    // Second subscribe with same email should NOT throw
    const result = await caller.bloomWatch.subscribe({ email: uniqueEmail, source: "test" });
    expect(result.success).toBe(true);
    expect(typeof result.message).toBe("string");
  });
});

describe("checkout.createSession", () => {
  it("rejects an unknown productId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.checkout.createSession({
        productId: "nonexistent-product",
        origin: "https://reddirtblooms.com",
      })
    ).rejects.toThrow();
  });
});

/**
 * Real-Time Server-Sent Events (SSE) for Red Dirt Blooms
 *
 * Channels:
 *  - /api/sse/harvest   → florists subscribe; fires when harvest listings change
 *  - /api/sse/orders    → florists subscribe; fires when their order status changes
 *
 * Usage (server-side):
 *   import { notifyHarvestUpdate, notifyOrderUpdate } from "./realtime";
 *   notifyHarvestUpdate();                 // broadcast to all harvest subscribers
 *   notifyOrderUpdate(floristAccountId);   // broadcast to a specific florist
 */

import type { Express, Request, Response } from "express";
import cookie from "cookie";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

// ─── Connection registries ────────────────────────────────────────────────────

/** All active harvest SSE connections (florist account id → set of responses) */
const harvestClients = new Map<string, Set<Response>>();

/** All active order SSE connections (florist account id → set of responses) */
const orderClients = new Map<string, Set<Response>>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addClient(registry: Map<string, Set<Response>>, id: string, res: Response) {
  if (!registry.has(id)) registry.set(id, new Set());
  registry.get(id)!.add(res);
}

function removeClient(registry: Map<string, Set<Response>>, id: string, res: Response) {
  registry.get(id)?.delete(res);
  if (registry.get(id)?.size === 0) registry.delete(id);
}

function sendEvent(res: Response, event: string, data: unknown) {
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {
    // client disconnected
  }
}

function broadcastToAll(registry: Map<string, Set<Response>>, event: string, data: unknown) {
  for (const clients of Array.from(registry.values())) {
    for (const res of Array.from(clients)) {
      sendEvent(res, event, data);
    }
  }
}

function broadcastToFlorist(
  registry: Map<string, Set<Response>>,
  floristId: string,
  event: string,
  data: unknown
) {
  const clients = registry.get(floristId);
  if (!clients) return;
  for (const res of Array.from(clients)) {
    sendEvent(res, event, data);
  }
}

// ─── JWT helper (reuse florist JWT secret) ───────────────────────────────────

async function getFloristIdFromCookie(req: Request): Promise<string | null> {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies["florist_session"];
    if (!token) return null;
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secret);
    // Florist JWTs store the account ID in the standard `sub` claim
    return payload.sub ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

// ─── Public broadcast functions (called from routers) ────────────────────────

/** Notify all connected florists that the harvest board has changed */
export function notifyHarvestUpdate() {
  broadcastToAll(harvestClients, "harvest-update", { ts: Date.now() });
}

/** Notify a specific florist that one of their orders changed */
export function notifyOrderUpdate(floristAccountId: number) {
  broadcastToFlorist(orderClients, String(floristAccountId), "order-update", { ts: Date.now() });
}

// ─── Route registration ───────────────────────────────────────────────────────

export function registerRealtimeRoutes(app: Express) {
  /**
   * GET /api/sse/harvest
   * Florists subscribe to live harvest board updates.
   * Auth: florist JWT cookie (optional — unauthenticated clients still receive updates)
   */
  app.get("/api/sse/harvest", async (req: Request, res: Response) => {
    const floristId = (await getFloristIdFromCookie(req)) ?? "anonymous";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering
    res.flushHeaders();

    // Send initial heartbeat
    sendEvent(res, "connected", { channel: "harvest", ts: Date.now() });

    addClient(harvestClients, floristId, res);

    // Heartbeat every 25 s to keep the connection alive through proxies
    const heartbeat = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 25_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      removeClient(harvestClients, floristId, res);
    });
  });

  /**
   * GET /api/sse/orders
   * Florists subscribe to live order status updates for their own orders.
   * Auth: florist JWT cookie (required)
   */
  app.get("/api/sse/orders", async (req: Request, res: Response) => {
    const floristId = await getFloristIdFromCookie(req);

    if (!floristId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    sendEvent(res, "connected", { channel: "orders", ts: Date.now() });

    addClient(orderClients, floristId, res);

    const heartbeat = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 25_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      removeClient(orderClients, floristId, res);
    });
  });
}

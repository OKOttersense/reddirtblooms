/**
 * Harvest Photo Upload — POST /api/harvest/upload-photo
 * Accepts a multipart form with a single "photo" file field.
 * Stores to S3 via storagePut and updates the harvest_listings row.
 * Requires admin session cookie (Manus OAuth).
 */
import { Router } from "express";
import multer from "multer";
import { getDb } from "./db";
import { harvestListings } from "../drizzle/schema";
import { storagePut } from "./storage";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import * as jose from "jose";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

import type { Express } from "express";

export function registerHarvestUploadRoute(app: Express) {
  const harvestRouter = Router();

  harvestRouter.post(
    "/upload-photo",
    // Auth check: must have a valid Manus session cookie with admin role
    async (req, res, next) => {
      try {
        // Manus OAuth session cookie is "session_token"
        const cookieHeader = req.headers.cookie ?? "";
        const sessionToken = cookieHeader
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("session_token="))
          ?.split("=")[1];

        if (!sessionToken) {
          res.status(401).json({ error: "Not authenticated." });
          return;
        }
        try {
          const secret = new TextEncoder().encode(ENV.cookieSecret);
          const { payload } = await jose.jwtVerify(sessionToken, secret);
          if ((payload as any).role !== "admin") {
            res.status(403).json({ error: "Admin access required." });
            return;
          }
          (req as any).adminUser = payload;
        } catch {
          res.status(401).json({ error: "Invalid or expired session." });
          return;
        }
        next();
      } catch {
        res.status(401).json({ error: "Invalid session." });
      }
    },
    // File upload middleware
    upload.single("photo"),
    // Handler
    async (req, res) => {
      try {
        const listingId = parseInt(req.body?.listingId ?? "0", 10);
        if (!listingId || isNaN(listingId)) {
          res.status(400).json({ error: "listingId is required." });
          return;
        }

        if (!req.file) {
          res.status(400).json({ error: "No photo file provided." });
          return;
        }

        const ext = req.file.originalname.split(".").pop() ?? "jpg";
        const key = `harvest/${Date.now()}-${listingId}.${ext}`;
        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

        // Update the listing row with the new photo
        const db = await getDb();
        if (db) {
          await db
            .update(harvestListings)
            .set({ imageKey: key, imageUrl: url })
            .where(eq(harvestListings.id, listingId));
        }

        res.json({ success: true, imageUrl: url, imageKey: key });
      } catch (err: any) {
        console.error("[HarvestUpload] Error:", err);
        res.status(500).json({ error: err?.message ?? "Upload failed." });
      }
    }
  );

  app.use("/api/harvest", harvestRouter);
}

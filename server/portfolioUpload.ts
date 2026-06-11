/**
 * Portfolio Photo Upload — POST /api/portfolio/upload-photo
 * Accepts a multipart form with a single "photo" file field and optional "itemId".
 * If itemId is provided, updates the portfolio_items row.
 * If no itemId, just returns the uploaded URL for use during item creation.
 * Requires admin session cookie (Manus OAuth).
 */
import { Router } from "express";
import multer from "multer";
import { getDb } from "./db";
import { portfolioItems } from "../drizzle/schema";
import { storagePut } from "./storage";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import * as jose from "jose";
import type { Express } from "express";

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

export function registerPortfolioUploadRoute(app: Express) {
  const portfolioRouter = Router();

  portfolioRouter.post(
    "/upload-photo",
    // Auth: must have a valid Manus session cookie with admin role
    async (req, res, next) => {
      try {
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
    upload.single("photo"),
    async (req, res) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: "No photo file provided." });
          return;
        }

        const ext = req.file.originalname.split(".").pop() ?? "jpg";
        const timestamp = Date.now();
        const key = `portfolio/${timestamp}.${ext}`;
        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

        // If an itemId was provided, update the portfolio_items row
        const itemId = parseInt(req.body?.itemId ?? "0", 10);
        if (itemId && !isNaN(itemId)) {
          const db = await getDb();
          if (db) {
            await db
              .update(portfolioItems)
              .set({ imageKey: key, imageUrl: url })
              .where(eq(portfolioItems.id, itemId));
          }
        }

        res.json({ success: true, imageUrl: url, imageKey: key });
      } catch (err: any) {
        console.error("[PortfolioUpload] Error:", err);
        res.status(500).json({ error: err?.message ?? "Upload failed." });
      }
    }
  );

  app.use("/api/portfolio", portfolioRouter);
}

/**
 * Gallery Photo Upload — POST /api/gallery/upload-photo
 * Accepts a multipart form with a single "photo" file field and optional "photoId".
 * If photoId is provided, updates the gallery_photos row with the new image URL.
 * Requires admin session cookie (Manus OAuth).
 */
import { Router } from "express";
import multer from "multer";
import { getDb } from "./db";
import { galleryPhotos } from "../drizzle/schema";
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

export function registerGalleryUploadRoute(app: Express) {
  const galleryRouter = Router();

  galleryRouter.post(
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
        const key = `gallery/${timestamp}.${ext}`;
        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

        // If a photoId was provided, update the gallery_photos row
        const photoId = parseInt(req.body?.photoId ?? "0", 10);
        if (photoId && !isNaN(photoId)) {
          const db = await getDb();
          if (db) {
            await db
              .update(galleryPhotos)
              .set({ imageKey: key, imageUrl: url })
              .where(eq(galleryPhotos.id, photoId));
          }
        }

        res.json({ success: true, imageUrl: url, imageKey: key });
      } catch (err: any) {
        console.error("[GalleryUpload] Error:", err);
        res.status(500).json({ error: err?.message ?? "Upload failed." });
      }
    }
  );

  app.use("/api/gallery", galleryRouter);
}

// middleware/multer.js
import multer from "multer";

import fs from "fs";
import path from "path";

// ─── Memory Storage Configuration ───────────────────────────────────────────
const storage = multer.memoryStorage();

// ─── File filter — allowing types supported by controller ─────────────────────
const fileFilter = (_req, file, cb) => {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/quicktime", "video/x-msvideo",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: Images, MP4, PDF.`), false);
  }
};

const MAX_FILE_SIZE_MB = 50; // Increased limit for videos/PDFs

// ─── Exported upload middleware ───────────────────────────────────────────────
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});
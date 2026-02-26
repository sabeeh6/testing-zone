// middleware/multer.js
import multer from "multer";

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
];

const MAX_FILE_SIZE_MB = 50;

// ─── Memory storage — buffer is streamed to Cloudinary in the controller ─────
const storage = multer.memoryStorage();

// ─── File filter — reject unsupported MIME types immediately ─────────────────
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed: images, videos, pdf`
      ),
      false
    );
  }
};

// ─── Exported upload middleware ───────────────────────────────────────────────
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});
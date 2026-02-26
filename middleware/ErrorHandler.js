// middleware/errorHandler.middleware.js
import multer from "multer";

// ─── Central error handler — register LAST in app.js after all routes ────────
export const errorHandler = (err, _req, res, _next) => {
  // Multer-specific errors (file size, unexpected field, etc.)
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE:      "File too large. Maximum allowed size is 50 MB",
      LIMIT_UNEXPECTED_FILE:"Unexpected file field. Use field name 'evidence'",
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] ?? err.message,
    });
  }

  // Custom file-filter rejection (unsupported MIME type)
  if (err.message?.startsWith("Unsupported file type")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Generic fallback
  console.error("[Error]", err);
  return res.status(err.statusCode ?? 500).json({
    success: false,
    message: err.message ?? "Internal server error",
  });
};
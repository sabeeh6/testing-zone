// routes/evidence.routes.js
import express from "express";
import multer from "multer";
import { upload } from "../middleware/multer.js";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createEvidence,
  updateEvidence,
  getEvidenceByTestCaseId,
  deleteEvidence,
} from "../controllers/evidenceController.js";

export const evidenceRouter = express.Router();

// ─── Tiny async wrapper — keeps controllers clean (no try/catch everywhere) ──
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── Inline Multer error handler (runs only for this router) ─────────────────
const multerErrorHandler = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "File too large. Maximum allowed size is 50 MB.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field. Use field name 'evidence'.",
      MISSING_FIELD_NAME: "File field name is missing. Use field name 'evidence'.",
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] ?? err.message,
    });
  }
  if (err?.message?.startsWith("Unsupported file type")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err); // pass to global error handler
};

// POST /api/evidence/create-evidence
// Body (multipart/form-data): evidence (file), testCaseId (text)
evidenceRouter.post(
  "/create-evidence",
  verifyToken,
  upload.single("evidence"),
  asyncHandler(createEvidence),
  multerErrorHandler
);

// PUT /api/evidence/update-evidence/:id
// Body (multipart/form-data): evidence (file) — replaces existing file
evidenceRouter.put(
  "/update-evidence/:id",
  verifyToken,
  upload.single("evidence"),
  asyncHandler(updateEvidence),
  multerErrorHandler
);

// GET /api/evidence/get-evidence/:testCaseId
// Query: ?page=1&limit=10
evidenceRouter.get(
  "/get-evidence/:testCaseId",
  verifyToken,
  asyncHandler(getEvidenceByTestCaseId)
);

// DELETE /api/evidence/del-evidence/:id
evidenceRouter.delete(
  "/del-evidence/:id",
  verifyToken,
  asyncHandler(deleteEvidence)
);

// Attach error handler for the whole evidence router
evidenceRouter.use(multerErrorHandler);


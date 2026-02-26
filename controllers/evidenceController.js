// controllers/evidenceController.js
import { evidenceModel } from "../model/evidence.js";
import { Cloud } from "../config/cloudinary.js";
import { Readable } from "stream";

// ─── Helper: derive human-readable fileType from mimetype ────────────────────
const resolveFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  return "file";
};

// ─── Helper: stream buffer to Cloudinary v2 ──────────────────────────────────
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = Cloud.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

// ─── Helper: build a unique Cloudinary public_id ─────────────────────────────
const buildPublicId = (userId, originalname) =>
  `${userId}_${Date.now()}_${originalname
    .replace(/\s+/g, "_")
    .replace(/\.[^/.]+$/, "")}`;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/evidence/create-evidence
// Headers : cookie: authToken
// Body    : multipart/form-data
//           ├── evidence   (file)   — field name MUST be "evidence"
//           └── testCaseId (text)
// ─────────────────────────────────────────────────────────────────────────────
export const createEvidence = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "File is required. Send it with field name 'evidence'." });
  }

  const { testCaseId } = req.body;
  if (!testCaseId) {
    return res.status(400).json({ success: false, message: "testCaseId is required." });
  }

  const isVideo = req.file.mimetype.startsWith("video/");
  const publicId = buildPublicId(req.user._id, req.file.originalname);

  // ── Upload buffer → Cloudinary ──────────────────────────────────────────
  const uploadResult = await uploadToCloudinary(req.file.buffer, {
    folder: `evidence/${isVideo ? "videos" : "files"}`,
    resource_type: isVideo ? "video" : "auto",
    public_id: publicId,
  });

  // ── Save to MongoDB — schema fields are arrays ──────────────────────────
  const evidence = await evidenceModel.create({
    testCaseId,
    fileUrl: [uploadResult.secure_url],
    filePublicId: [uploadResult.public_id],
    fileType: [resolveFileType(req.file.mimetype)],
    uploadedBy: req.user._id,
  });

  return res.status(201).json({ success: true, data: evidence });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/evidence/update-evidence/:id
// Headers : cookie: authToken
// Body    : multipart/form-data
//           └── evidence (file) — replaces the existing file on Cloudinary
// ─────────────────────────────────────────────────────────────────────────────
export const updateEvidence = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "A replacement file is required. Send it with field name 'evidence'.",
    });
  }

  const evidence = await evidenceModel.findById(req.params.id);
  if (!evidence) {
    return res.status(404).json({ success: false, message: "Evidence not found." });
  }

  // ── Delete old Cloudinary asset ──────────────────────────────────────────
  const oldPublicId = evidence.filePublicId[0];
  const oldFileType = evidence.fileType[0];
  if (oldPublicId) {
    await Cloud.uploader.destroy(oldPublicId, {
      resource_type: oldFileType === "video" ? "video" : "image",
    });
  }

  // ── Upload new file to Cloudinary ────────────────────────────────────────
  const isVideo = req.file.mimetype.startsWith("video/");
  const publicId = buildPublicId(req.user._id, req.file.originalname);

  const uploadResult = await uploadToCloudinary(req.file.buffer, {
    folder: `evidence/${isVideo ? "videos" : "files"}`,
    resource_type: isVideo ? "video" : "auto",
    public_id: publicId,
  });

  // ── Update first element of each array in MongoDB ───────────────────────
  const updated = await evidenceModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        "fileUrl.0": uploadResult.secure_url,
        "filePublicId.0": uploadResult.public_id,
        "fileType.0": resolveFileType(req.file.mimetype),
      },
    },
    { new: true }
  );

  return res.status(200).json({ success: true, data: updated });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/evidence/get-evidence/:testCaseId
// Headers : cookie: authToken
// Query   : ?page=1&limit=10  (limit capped at 50)
// ─────────────────────────────────────────────────────────────────────────────
export const getEvidenceByTestCaseId = async (req, res) => {
  const { testCaseId } = req.params;

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const [evidenceList, total] = await Promise.all([
    evidenceModel
      .find({ testCaseId })
      .sort({ createdAt: -1 })                       // newest first
      .skip(skip)
      .limit(limit)
      .populate("uploadedBy", "name email"),         // attach uploader info
    evidenceModel.countDocuments({ testCaseId }),
  ]);

  return res.status(200).json({
    success: true,
    data: evidenceList,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/evidence/del-evidence/:id
// Headers : cookie: authToken
// ─────────────────────────────────────────────────────────────────────────────
export const deleteEvidence = async (req, res) => {
  const evidence = await evidenceModel.findById(req.params.id);

  if (!evidence) {
    return res.status(404).json({ success: false, message: "Evidence not found." });
  }

  // ── Remove all Cloudinary assets stored in the arrays ───────────────────
  await Promise.all(
    evidence.filePublicId.map((pid, idx) =>
      Cloud.uploader.destroy(pid, {
        resource_type: evidence.fileType[idx] === "video" ? "video" : "image",
      })
    )
  );

  await evidence.deleteOne();

  return res.status(200).json({ success: true, message: "Evidence deleted successfully." });
};
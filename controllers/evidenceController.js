import { evidenceModel } from "../model/evidence.js";
import { userModel } from "../model/user.js";
import { Cloud, getCloudInstance } from "../config/cloudinary.js";
import { cloudinaryManager } from "../config/cloudinaryManager.js";
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

// ─── Helper: fetch Cloudinary storage usage ──────────────────────────────────
// ─── Helper: fetch Cloudinary storage usage ──────────────────────────────────
const getCloudinaryUsage = async () => {
  try {
    return await cloudinaryManager.getAllUsage();
  } catch (error) {
    console.error("Cloudinary Usage Error:", error);
    return null;
  }
};

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

  // ── Get Active Cloudinary Instance (Dynamic Rotation) ───────────────────
  const activeCloud = await getCloudInstance();

  // ── Upload buffer → Cloudinary ──────────────────────────────────────────
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = activeCloud.uploader.upload_stream({
      folder: `evidence/${isVideo ? "videos" : "files"}`,
      resource_type: isVideo ? "video" : "auto",
      public_id: publicId,
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(req.file.buffer).pipe(uploadStream);
  });

  // ── Save to MongoDB — schema fields are arrays ──────────────────────────
  const evidence = await evidenceModel.create({
    testCaseId,
    fileUrl: [uploadResult.secure_url],
    filePublicId: [uploadResult.public_id],
    fileType: [resolveFileType(req.file.mimetype)],
    cloudName: activeCloud.config().cloud_name,
    uploadedBy: req.user._id,
    userId: req.user._id
  });

  const storageUsage = await getCloudinaryUsage();

  return res.status(201).json({ success: true, data: evidence, storageUsage });
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

  // ── Configure Cloudinary for the specific account stored in DB ───────────
  const accountConfig = cloudinaryManager.accounts.find(a => a.cloud_name === evidence.cloudName) || cloudinaryManager.accounts[0];
  const cloudInstance = cloudinaryManager.configureInstance(accountConfig);

  // ── Delete old Cloudinary asset ──────────────────────────────────────────
  const oldPublicId = evidence.filePublicId[0];
  const oldFileType = evidence.fileType[0];
  if (oldPublicId) {
    await cloudInstance.uploader.destroy(oldPublicId, {
      resource_type: oldFileType === "video" ? "video" : "image",
    });
  }

  // ── Upload new file to Cloudinary (Use Active Account for NEW upload) ────
  const activeCloud = await getCloudInstance();
  const isVideo = req.file.mimetype.startsWith("video/");
  const publicId = buildPublicId(req.user._id, req.file.originalname);

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = activeCloud.uploader.upload_stream({
      folder: `evidence/${isVideo ? "videos" : "files"}`,
      resource_type: isVideo ? "video" : "auto",
      public_id: publicId,
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(req.file.buffer).pipe(uploadStream);
  });

  // ── Update in MongoDB (including cloudName) ──────────────────────────────
  const updated = await evidenceModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        "fileUrl.0": uploadResult.secure_url,
        "filePublicId.0": uploadResult.public_id,
        "fileType.0": resolveFileType(req.file.mimetype),
        "cloudName": activeCloud.config().cloud_name
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

  const storageUsage = await getCloudinaryUsage();

  return res.status(200).json({
    success: true,
    data: evidenceList,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    storageUsage,
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

  // ── Remove all Cloudinary assets using the stored cloudName ──────────────
  const accountConfig = cloudinaryManager.accounts.find(a => a.cloud_name === evidence.cloudName) || cloudinaryManager.accounts[0];
  const cloudInstance = cloudinaryManager.configureInstance(accountConfig);

  await Promise.all(
    evidence.filePublicId.map((pid, idx) =>
      cloudInstance.uploader.destroy(pid, {
        resource_type: evidence.fileType[idx] === "video" ? "video" : "image",
      })
    )
  );

  await evidence.deleteOne();

  return res.status(200).json({ success: true, message: "Evidence deleted successfully." });
};
// ─────────────────────────────────────────────────────────────────────────────
// NEW CODE — upload.middleware.js (ImageKit version)
//
// WHAT CHANGED vs the old Cloudinary version:
//   OLD: multer.diskStorage → save to disk → upload to Cloudinary → delete from disk
//   NEW: multer.memoryStorage → file lives in RAM as buffer → upload to ImageKit → done
//
// Why memoryStorage:
//   - No disk I/O, no temp files to clean up
//   - Works on serverless / platforms with read-only filesystems (Render, Railway)
//   - Faster — one less file system round-trip
//
// ImageKit response fields used:
//   result.url        → full image URL  (stored in DB as `url`)
//   result.fileId     → ImageKit file ID (stored in DB as `public_id`, used for deletion)
// ─────────────────────────────────────────────────────────────────────────────

import multer from "multer";
import imagekit from "../config/imagekit.js";
import { ApiError } from "../utils/apiHelpers.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES  = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB    = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES           = 10;

// ─── Memory storage ───────────────────────────────────────────────────────────
// Files go into req.files[i].buffer — no disk writes at all.
const storage = multer.memoryStorage();

// ─── File type filter ─────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG and WEBP are allowed.`
      ),
      false
    );
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 5 MB per file
    files:    MAX_FILES,           // max 10 files per request
  },
});

// ─── Core upload function ─────────────────────────────────────────────────────
/**
 * uploadToImageKit(file)
 *
 * Uploads a single multer file (from memoryStorage) to ImageKit.
 * Returns an object shaped to match the existing Car schema:
 *   { url: string, public_id: string }
 *
 * @param {Express.Multer.File} file - multer file object (must have .buffer)
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadToImageKit = async (file) => {
  // Build a clean filename: strip spaces and special chars
  const safeName = `car_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
  const ext      = file.mimetype.split("/")[1]; // jpeg | png | webp
  const fileName = `${safeName}.${ext}`;

  const result = await imagekit.upload({
    file:   file.buffer,          // Buffer from memoryStorage
    fileName,
    folder: "/cars",              // Organises uploads under /cars in ImageKit dashboard
    useUniqueFileName: false,     // We already generate a unique name above
    tags:   ["car", "marketplace"],
  });

  return {
    url:       result.url,     // full HTTPS URL
    public_id: result.fileId,  // ImageKit file ID — used for deletion
  };
};

/**
 * uploadManyToImageKit(files)
 *
 * Uploads all files in parallel. Called from the car controller after
 * multer has populated req.files.
 *
 * @param {Express.Multer.File[]} files
 * @returns {Promise<Array<{ url: string, public_id: string }>>}
 */
export const uploadManyToImageKit = async (files = []) => {
  return Promise.all(files.map((file) => uploadToImageKit(file)));
};

/**
 * deleteFromImageKit(fileId)
 *
 * Deletes a single file from ImageKit by its fileId (stored as public_id).
 * Called when a car is deleted or an image is removed during edit.
 *
 * @param {string} fileId - the ImageKit fileId (stored in DB as public_id)
 */
export const deleteFromImageKit = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (err) {
    // Log but don't throw — a failed delete shouldn't break the main operation
    console.warn(`⚠️  ImageKit delete failed for fileId: ${fileId}`, err.message);
  }
};

/**
 * deleteManyFromImageKit(images)
 *
 * Deletes a list of images from ImageKit.
 * Uses allSettled so one failure doesn't abort the rest.
 *
 * @param {Array<{ url: string, public_id: string }>} images
 */
export const deleteManyFromImageKit = async (images = []) => {
  await Promise.allSettled(
    images.map(({ public_id }) => deleteFromImageKit(public_id))
  );
};

// ─── Multer middleware exports ─────────────────────────────────────────────────
export const uploadSingle   = upload.single("image");
export const uploadMultiple = upload.array("images", MAX_FILES);

// ─── Multer error handler ──────────────────────────────────────────────────────
/**
 * handleUploadErrors
 *
 * Must be registered AFTER the multer middleware in the route chain:
 *   router.post("/", verifyJWT, uploadMultiple, handleUploadErrors, controller)
 *
 * Converts multer-specific errors (file size, file count, unexpected field)
 * into clean ApiError JSON responses.
 */
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB per image.`));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new ApiError(400, `Too many files. Maximum is ${MAX_FILES} images per car.`));
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new ApiError(400, `Unexpected field: ${err.field}. Use "images" as the field name.`));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

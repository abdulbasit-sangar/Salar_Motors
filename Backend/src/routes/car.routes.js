import { Router } from "express";
import {
  createCar,
  getAllCars,
  getAdminCars,
  getCarById,
  searchCars,
  filterCars,
  getRightHandCars,
  getLeftHandCars,
  getSimilarCars,
  toggleFeatureCar,
  toggleHideCar,
  getFeaturedCars,
  deleteCar,
  getCarOptions,
} from "../controllers/car.controller.js";
import { verifyJWT, requireRole } from "../middlewares/auth.middleware.js";
import {
  uploadMultiple,
  handleUploadErrors,
} from "../middlewares/upload.middleware.js";
import { validateCreateCar } from "../validators/car.validator.js";
import {
  uploadLimiter,
  searchLimiter,
} from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL: named routes MUST come before /:id
// ─────────────────────────────────────────────────────────────────────────────

// Public — named routes
router.get("/featured", getFeaturedCars);
router.get("/options", getCarOptions); // MUST stay before GET /:id
router.get("/right-hand", getRightHandCars);
router.get("/left-hand", getLeftHandCars);
router.get("/search", searchLimiter, searchCars); // stricter limit on regex search
router.get("/filter", searchLimiter, filterCars); // stricter limit on filter queries

// Public — root + parameterized
router.get("/", getAllCars);
router.get("/similar/:id", getSimilarCars);

// Admin/Manager — list all cars including hidden
router.get("/admin", verifyJWT, requireRole("superadmin", "manager"), getAdminCars);

// Superadmin only — delete car (managers cannot delete listings)
router.delete("/:id", verifyJWT, requireRole("superadmin"), deleteCar);
router.get("/:id", getCarById);

// Admin/Manager — create car
// uploadLimiter: max 30 uploads/hour per IP — protects Cloudinary quota
router.post(
  "/",
  verifyJWT,
  requireRole("superadmin", "manager"),
  uploadLimiter,
  uploadMultiple,
  handleUploadErrors,
  validateCreateCar,
  createCar,
);

// Superadmin only — feature/unfeature (managers cannot feature listings)
router.patch("/feature/:id", verifyJWT, requireRole("superadmin"), toggleFeatureCar);
// Admin/Manager — hide/unhide (existing behavior preserved for managers)
router.patch("/hide/:id", verifyJWT, requireRole("superadmin", "manager"), toggleHideCar);

export default router;

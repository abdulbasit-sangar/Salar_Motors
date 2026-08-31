import { asyncHandler, ApiResponse } from "../utils/apiHelpers.js";
import {
  createCarService,
  getAllCarsService,
  getCarByIdService,
  searchCarsService,
  filterCarsService,
  getCarsBySteeringService,
  getSimilarCarsService,
  toggleFeatureCarService,
  toggleHideCarService,
  getFeaturedCarsService,
  deleteCarService,
  getCarOptionsService,
} from "../services/car.service.js";
import { STEERING } from "../constants/car.constants.js";

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/cars
export const createCar = asyncHandler(async (req, res) => {
  // createdBy is set from the authenticated JWT user (req.admin), never
  // from the request body — see the Manager/Sub-Admin RBAC notes on
  // Car.createdBy in car.model.js.
  const car = await createCarService(req.body, req.files, req.admin._id);
  return res
    .status(201)
    .json(new ApiResponse(201, { car }, "Car listed successfully"));
});

// GET /api/cars
export const getAllCars = asyncHandler(async (req, res) => {
  const result = await getAllCarsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Cars fetched successfully"));
});

export const getAdminCars = asyncHandler(async (req, res) => {
  const result = await getAllCarsService(req.query, true);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Admin cars fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4
// ─────────────────────────────────────────────────────────────────────────────

// Step 13: GET /api/cars/:id
export const getCarById = asyncHandler(async (req, res) => {
  const car = await getCarByIdService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { car }, "Car fetched successfully"));
});

// Step 14: GET /api/cars/search?keyword=Toyota
export const searchCars = asyncHandler(async (req, res) => {
  const result = await searchCarsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Search results fetched"));
});

// Step 15 & 16: GET /api/cars/filter?brand=Toyota&fuelType=Hybrid&sort=price_asc
export const filterCars = asyncHandler(async (req, res) => {
  const result = await filterCarsService(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Filtered cars fetched"));
});

// Step 17: GET /api/cars/right-hand  &  GET /api/cars/left-hand
export const getRightHandCars = asyncHandler(async (req, res) => {
  const result = await getCarsBySteeringService(STEERING.RHD, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Right-hand drive cars fetched"));
});

export const getLeftHandCars = asyncHandler(async (req, res) => {
  const result = await getCarsBySteeringService(STEERING.LHD, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Left-hand drive cars fetched"));
});

// Step 18: GET /api/cars/similar/:id
export const getSimilarCars = asyncHandler(async (req, res) => {
  const result = await getSimilarCarsService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Similar cars fetched"));
});

// Step 19: PATCH /api/cars/feature/:id  &  PATCH /api/cars/hide/:id
export const toggleFeatureCar = asyncHandler(async (req, res) => {
  const car = await toggleFeatureCarService(req.params.id);
  const msg = car.featured
    ? "Car marked as featured"
    : "Car removed from featured";
  return res.status(200).json(new ApiResponse(200, { car }, msg));
});

export const toggleHideCar = asyncHandler(async (req, res) => {
  const car = await toggleHideCarService(req.params.id);
  const msg = car.isHidden
    ? "Car hidden from public listings"
    : "Car restored to public listings";
  return res.status(200).json(new ApiResponse(200, { car }, msg));
});

// Step 20: GET /api/cars/featured  (optimized homepage query)
export const getFeaturedCars = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit) || 8);
  const result = await getFeaturedCarsService(limit);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Featured cars fetched"));
});

// GET /api/cars/options — centralized dropdown options (brands, provinces,
// years, engineCC, plus the existing enum-backed fields). Public, no auth.
// NOTE: registered before GET /api/cars/:id in car.routes.js so "options"
// is never interpreted as a car ID.
export const getCarOptions = asyncHandler(async (req, res) => {
  const options = getCarOptionsService();
  return res
    .status(200)
    .json(new ApiResponse(200, options, "Car options fetched successfully"));
});

// DELETE /api/cars/:id
export const deleteCar = asyncHandler(async (req, res) => {
  await deleteCarService(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Car deleted successfully"));
});

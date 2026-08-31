import mongoose from "mongoose";
import Car from "../models/car.model.js";
import {
  uploadManyToImageKit,
  deleteManyFromImageKit,
} from "../middlewares/upload.middleware.js";
import { ApiError } from "../utils/apiHelpers.js";
import {
  STEERING,
  FUEL_TYPE,
  BODY_TYPE,
  TRANSMISSION,
  CONDITION,
  CAR_BRANDS,
  PROVINCES,
  ENGINE_CC_OPTIONS,
  getCarYears,
} from "../constants/car.constants.js";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const validateObjectId = (id, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}: ${id}`);
  }
};

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  mileage_low: { mileage: 1 },
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  totalCars: total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 11 — Create car (ImageKit version)
// ─────────────────────────────────────────────────────────────────────────────

export const createCarService = async (carData, files = [], createdBy) => {
  const images = await uploadManyToImageKit(files);
  // createdBy always comes from the authenticated JWT user (req.admin._id)
  // — it is never read from carData/client input. See car.controller.js.
  const car = await Car.create({ ...carData, images, createdBy });
  return car;
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 12 — Get all visible cars (paginated + sorted)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllCarsService = async (query = {}, includeHidden = false) => {
  const { page, limit, skip } = parsePagination(query);
  const sortOption = SORT_MAP[query.sort] || SORT_MAP.newest;
  const filter = includeHidden ? {} : { isHidden: false };

  const [cars, totalCars] = await Promise.all([
    Car.find(filter)
      .select(
        "title brand model year price province steeringType images featured slug createdAt isHidden",
      )
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  return { cars, pagination: buildPagination(page, limit, totalCars) };
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 13 — Get single car by ID
// ─────────────────────────────────────────────────────────────────────────────

export const getCarByIdService = async (id) => {
  validateObjectId(id, "car ID");

  const car = await Car.findOne({ _id: id, isHidden: false })
    .select("-__v")
    .lean();

  if (!car) throw new ApiError(404, "Car not found");
  return car;
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 14 — Keyword search
// ─────────────────────────────────────────────────────────────────────────────

export const searchCarsService = async (query = {}) => {
  const { keyword = "" } = query;
  const { page, limit, skip } = parsePagination(query);

  if (!keyword.trim()) throw new ApiError(400, "Search keyword is required");

  const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const filter = {
    isHidden: false,
    $or: [
      { brand: regex },
      { model: regex },
      { province: regex },
      { title: regex },
    ],
  };

  const [cars, totalCars] = await Promise.all([
    Car.find(filter)
      .select(
        "title brand model year price province steeringType images slug createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  return { cars, pagination: buildPagination(page, limit, totalCars), keyword };
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 15 — Dynamic filtering
// ─────────────────────────────────────────────────────────────────────────────

export const filterCarsService = async (query = {}) => {
  const {
    brand,
    model,
    province,
    fuelType,
    bodyType,
    steeringType,
    transmission,
    condition,
    color,
    engineCC,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    minMileage,
    maxMileage,
  } = query;

  const { page, limit, skip } = parsePagination(query);
  const sortOption = SORT_MAP[query.sort] || SORT_MAP.newest;
  const filter = { isHidden: false };

  if (brand)
    filter.brand = new RegExp(
      brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
  if (model)
    filter.model = new RegExp(
      model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
  if (province)
    filter.province = new RegExp(
      province.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
  if (fuelType) filter.fuelType = fuelType;
  if (bodyType) filter.bodyType = bodyType;
  if (steeringType) filter.steeringType = steeringType;
  if (transmission) filter.transmission = transmission;
  if (condition) filter.condition = condition;
  if (color)
    filter.color = new RegExp(
      color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );

  // engineCC is a plain Number field (not a Mongoose enum — see car.model.js),
  // so validate it as a finite, non-negative number before it ever reaches
  // the MongoDB query rather than trusting the raw query string.
  if (engineCC !== undefined && engineCC !== "") {
    const parsedEngineCC = Number(engineCC);
    if (Number.isFinite(parsedEngineCC) && parsedEngineCC >= 0) {
      filter.engineCC = parsedEngineCC;
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minYear || maxYear) {
    filter.year = {};
    if (minYear) filter.year.$gte = Number(minYear);
    if (maxYear) filter.year.$lte = Number(maxYear);
  }

  if (minMileage || maxMileage) {
    filter.mileage = {};
    if (minMileage) filter.mileage.$gte = Number(minMileage);
    if (maxMileage) filter.mileage.$lte = Number(maxMileage);
  }

  const [cars, totalCars] = await Promise.all([
    Car.find(filter)
      .select(
        "title brand model year price province steeringType fuelType bodyType images slug createdAt",
      )
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  return {
    cars,
    pagination: buildPagination(page, limit, totalCars),
    appliedFilters: filter,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 17 — Steering type dedicated endpoints
// ─────────────────────────────────────────────────────────────────────────────

export const getCarsBySteeringService = async (steeringType, query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const sortOption = SORT_MAP[query.sort] || SORT_MAP.newest;
  const filter = { isHidden: false, steeringType };

  const [cars, totalCars] = await Promise.all([
    Car.find(filter)
      .select(
        "title brand model year price province steeringType images slug createdAt",
      )
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Car.countDocuments(filter),
  ]);

  return {
    cars,
    pagination: buildPagination(page, limit, totalCars),
    steeringType,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 18 — Similar cars recommendation
// ─────────────────────────────────────────────────────────────────────────────

export const getSimilarCarsService = async (id) => {
  validateObjectId(id, "car ID");

  const source = await Car.findOne({ _id: id, isHidden: false })
    .select("brand model price steeringType")
    .lean();

  if (!source) throw new ApiError(404, "Car not found");

  const priceMargin = source.price * 0.3;

  const filter = {
    isHidden: false,
    _id: { $ne: source._id },
    brand: source.brand,
    steeringType: source.steeringType,
    price: {
      $gte: source.price - priceMargin,
      $lte: source.price + priceMargin,
    },
  };

  const cars = await Car.find(filter)
    .select("title brand model year price province steeringType images slug")
    .limit(6)
    .lean();

  return { cars, source: { brand: source.brand, price: source.price } };
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 19 — Feature & hide car (admin toggles)
// ─────────────────────────────────────────────────────────────────────────────

export const toggleFeatureCarService = async (id) => {
  validateObjectId(id, "car ID");

  const car = await Car.findById(id).select("featured");
  if (!car) throw new ApiError(404, "Car not found");

  const updated = await Car.findByIdAndUpdate(
    id,
    { $set: { featured: !car.featured } },
    { new: true, select: "title featured isHidden" },
  ).lean();

  return updated;
};

export const toggleHideCarService = async (id) => {
  validateObjectId(id, "car ID");

  const car = await Car.findById(id).select("isHidden");
  if (!car) throw new ApiError(404, "Car not found");

  const updated = await Car.findByIdAndUpdate(
    id,
    { $set: { isHidden: !car.isHidden } },
    { new: true, select: "title featured isHidden" },
  ).lean();

  return updated;
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 20 — Featured cars (optimized homepage query)
// ─────────────────────────────────────────────────────────────────────────────

export const getFeaturedCarsService = async (limitNum = 8) => {
  const cars = await Car.find({ isHidden: false, featured: true })
    .select("title brand model year price province steeringType images slug")
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .lean();

  return { cars };
};

// ─────────────────────────────────────────────────────────────────────────────
// Car dropdown options — single source of truth is car.constants.js.
// Powers GET /api/cars/options so the frontend never hardcodes these lists.
// ─────────────────────────────────────────────────────────────────────────────

export const getCarOptionsService = () => ({
  brands: CAR_BRANDS,
  provinces: PROVINCES,
  years: getCarYears(),
  engineCC: ENGINE_CC_OPTIONS,
  steering: Object.values(STEERING),
  fuelTypes: Object.values(FUEL_TYPE),
  bodyTypes: Object.values(BODY_TYPE),
  transmissions: Object.values(TRANSMISSION),
  conditions: Object.values(CONDITION),
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete car (removes images from ImageKit then deletes DB record)
// ─────────────────────────────────────────────────────────────────────────────

export const deleteCarService = async (id) => {
  validateObjectId(id, "car ID");

  const car = await Car.findById(id);
  if (!car) throw new ApiError(404, "Car not found");

  await deleteManyFromImageKit(car.images);
  await Car.findByIdAndDelete(id);
};

import Joi from "joi";
import { ApiError } from "../utils/apiHelpers.js";
import {
  STEERING, FUEL_TYPE, BODY_TYPE, TRANSMISSION, CONDITION,
  CAR_BRANDS, PROVINCES, MIN_CAR_YEAR,
} from "../constants/car.constants.js";

// ─── Reusable field definitions ───────────────────────────────────────────────
const fields = {
  title:        Joi.string().trim().max(150).messages({ "string.max": "Title must not exceed 150 characters" }),
  // Validated against the centralized lists — mirrors the Mongoose enum in
  // car.model.js so a bad request is rejected before it ever reaches the DB.
  brand:        Joi.string().trim().valid(...CAR_BRANDS).messages({ "any.only": `Brand must be one of: ${CAR_BRANDS.join(", ")}` }),
  model:        Joi.string().trim(),
  year:         Joi.number().integer().min(MIN_CAR_YEAR).max(new Date().getFullYear() + 1).messages({ "number.min": `Year must be ${MIN_CAR_YEAR} or later` }),
  price:        Joi.number().min(0).messages({ "number.min": "Price cannot be negative" }),
  province:     Joi.string().trim().valid(...PROVINCES).messages({ "any.only": `Province must be one of: ${PROVINCES.join(", ")}` }),
  steeringType: Joi.string().valid(...Object.values(STEERING)).messages({ "any.only": `Steering type must be one of: ${Object.values(STEERING).join(", ")}` }),
  city:         Joi.string().trim(),
  mileage:      Joi.number().min(0),
  fuelType:     Joi.string().valid(...Object.values(FUEL_TYPE)),
  bodyType:     Joi.string().valid(...Object.values(BODY_TYPE)),
  transmission: Joi.string().valid(...Object.values(TRANSMISSION)),
  condition:    Joi.string().valid(...Object.values(CONDITION)),
  engineCC:     Joi.number().min(0),
  color:        Joi.string().trim(),
  description:  Joi.string().trim().max(2000),
  importedDate: Joi.date(),
};

// ─── Create car schema — all required fields enforced ─────────────────────────
const createCarSchema = Joi.object({
  title:        fields.title.required().messages({ "any.required": "Title is required" }),
  brand:        fields.brand.required().messages({ "any.required": "Brand is required" }),
  model:        fields.model.required().messages({ "any.required": "Model is required" }),
  year:         fields.year.required().messages({ "any.required": "Year is required" }),
  price:        fields.price.required().messages({ "any.required": "Price is required" }),
  province:     fields.province.required().messages({ "any.required": "Province is required" }),
  steeringType: fields.steeringType.required().messages({ "any.required": "Steering type is required" }),
  // Optional fields
  city:         fields.city.optional(),
  mileage:      fields.mileage.optional(),
  fuelType:     fields.fuelType.optional(),
  bodyType:     fields.bodyType.optional(),
  transmission: fields.transmission.optional(),
  condition:    fields.condition.optional(),
  engineCC:     fields.engineCC.optional(),
  color:        fields.color.optional(),
  description:  fields.description.optional(),
  importedDate: fields.importedDate.optional(),
});

// ─── Update car schema — all fields optional (PATCH semantics) ────────────────
const updateCarSchema = Joi.object({
  title:        fields.title.optional(),
  brand:        fields.brand.optional(),
  model:        fields.model.optional(),
  year:         fields.year.optional(),
  price:        fields.price.optional(),
  province:     fields.province.optional(),
  steeringType: fields.steeringType.optional(),
  city:         fields.city.optional(),
  mileage:      fields.mileage.optional(),
  fuelType:     fields.fuelType.optional(),
  bodyType:     fields.bodyType.optional(),
  transmission: fields.transmission.optional(),
  condition:    fields.condition.optional(),
  engineCC:     fields.engineCC.optional(),
  color:        fields.color.optional(),
  description:  fields.description.optional(),
  importedDate: fields.importedDate.optional(),
}).min(1).messages({ "object.min": "At least one field must be provided for update" });

// ─── Middleware factory ────────────────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,    // collect ALL errors, not just the first
    allowUnknown: false,  // reject unexpected fields (no garbage data in DB)
    stripUnknown: true,   // silently remove unknown fields that passed
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new ApiError(400, "Validation failed", messages));
  }

  next();
};

export const validateCreateCar = validate(createCarSchema);
export const validateUpdateCar = validate(updateCarSchema);

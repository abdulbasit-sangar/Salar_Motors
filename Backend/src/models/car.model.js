import mongoose from "mongoose";
import {
  STEERING,
  FUEL_TYPE,
  BODY_TYPE,
  TRANSMISSION,
  CONDITION,
  CAR_BRANDS,
  PROVINCES,
  MIN_CAR_YEAR,
} from "../constants/car.constants.js";
import { generateSlug } from "../utils/slugUtils.js";

// ─── Image sub-schema ─────────────────────────────────────────────────────────
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,             // needed to delete from Cloudinary
    },
  },
  { _id: false }                  // no separate _id for each image object
);

// ─── Car schema ───────────────────────────────────────────────────────────────
const carSchema = new mongoose.Schema(
  {
    // ── Core identity ──────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Car title is required"],
      trim: true,
      maxlength: [150, "Title must not exceed 150 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    // ── Make & model ───────────────────────────────────────────────────────────
    // Validated against the centralized CAR_BRANDS list so a client can't
    // bypass the frontend dropdown and write an arbitrary brand directly
    // through the API (see car.constants.js — single source of truth,
    // also served via GET /api/cars/options).
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      enum: {
        values: CAR_BRANDS,
        message: `Brand must be one of: ${CAR_BRANDS.join(", ")}`,
      },
      index: true,               // frequently filtered
    },

    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
      index: true,               // frequently filtered
    },

    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [MIN_CAR_YEAR, `Year must be ${MIN_CAR_YEAR} or later`],
      max: [new Date().getFullYear() + 1, "Year cannot be in the future"],
      index: true,
    },

    // ── Pricing ────────────────────────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index: true,               // sorted and range-filtered frequently
    },

    // ── Specs ──────────────────────────────────────────────────────────────────
    mileage: {
      type: Number,
      min: [0, "Mileage cannot be negative"],
      default: 0,
    },

    fuelType: {
      type: String,
      enum: {
        values: Object.values(FUEL_TYPE),
        message: `Fuel type must be one of: ${Object.values(FUEL_TYPE).join(", ")}`,
      },
      index: true,
    },

    bodyType: {
      type: String,
      enum: {
        values: Object.values(BODY_TYPE),
        message: `Body type must be one of: ${Object.values(BODY_TYPE).join(", ")}`,
      },
      index: true,
    },

    transmission: {
      type: String,
      enum: {
        values: Object.values(TRANSMISSION),
        message: `Transmission must be one of: ${Object.values(TRANSMISSION).join(", ")}`,
      },
    },

    steeringType: {
      type: String,
      enum: {
        values: Object.values(STEERING),
        message: `Steering type must be RHD or LHD`,
      },
      required: [true, "Steering type is required"],
      index: true,               // dedicated endpoints filter by this
    },

    condition: {
      type: String,
      enum: {
        values: Object.values(CONDITION),
        message: `Condition must be one of: ${Object.values(CONDITION).join(", ")}`,
      },
      default: CONDITION.USED,
    },

    engineCC: {
      type: Number,
      min: [0, "Engine CC cannot be negative"],
    },

    color: {
      type: String,
      trim: true,
    },

    // ── Location ───────────────────────────────────────────────────────────────
    // Validated against the centralized PROVINCES list — same rationale as
    // `brand` above.
    province: {
      type: String,
      required: [true, "Province is required"],
      trim: true,
      enum: {
        values: PROVINCES,
        message: `Province must be one of: ${PROVINCES.join(", ")}`,
      },
      index: true,
    },

    city: {
      type: String,
      trim: true,
    },

    // ── Import info ────────────────────────────────────────────────────────────
    importedDate: {
      type: Date,
    },

    // ── Description ────────────────────────────────────────────────────────────
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must not exceed 2000 characters"],
    },

    // ── Images ─────────────────────────────────────────────────────────────────
    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "A car can have a maximum of 10 images",
      },
      default: [],
    },

    // ── Admin content management flags ────────────────────────────────────────
    featured: {
      type: Boolean,
      default: false,
      index: true,               // homepage query filters by this
    },

    isHidden: {
      type: Boolean,
      default: false,
      index: true,               // ALL public queries filter by this
    },

    // Manager/Sub-Admin RBAC: tracks which admin/manager created this
    // listing. Always set by the backend from the authenticated JWT user
    // (req.admin._id) — never trusted from client input (see
    // car.controller.js / createCarService). NOT marked `required` at the
    // schema level so listings created before this feature was added
    // continue to load and save without any manual migration.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      index: true,
    },
  },
  {
    timestamps: true,            // createdAt, updatedAt
  }
);

// ─── Compound indexes for common query combinations ───────────────────────────
carSchema.index({ brand: 1, steeringType: 1 });
carSchema.index({ brand: 1, price: 1 });
carSchema.index({ isHidden: 1, featured: 1 });
carSchema.index({ isHidden: 1, createdAt: -1 });

// ─── Pre-save hook: auto-generate slug from title + partial _id ───────────────
carSchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) return next();

  const base = generateSlug(this.title);
  const suffix = this._id.toString().slice(-6); // last 6 chars of ObjectId for uniqueness
  this.slug = `${base}-${suffix}`;
  next();
});

const Car = mongoose.model("Car", carSchema);

export default Car;

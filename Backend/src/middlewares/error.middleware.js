import { ApiError } from "../utils/apiHelpers.js";

/**
 * Global error handling middleware.
 *
 * Must have exactly 4 parameters — Express identifies error middleware by arity.
 * Registered LAST in app.js, after all routes and other middleware.
 *
 * Handles:
 *  - ApiError           → our custom errors (statusCode + message + errors[])
 *  - Mongoose CastError → invalid ObjectId format
 *  - Mongoose ValidationError → schema-level field validation
 *  - Mongoose duplicate key (11000) → unique index violation
 *  - JWT errors         → safety net (should be caught in verifyJWT first)
 *  - Multer errors      → file upload failures not caught by handleUploadErrors
 *  - Generic Error      → unhandled runtime errors → 500
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────────
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid value for field: ${err.path}`);
  }

  // ── Mongoose ValidationError ──────────────────────────────────────────────
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(422, "Validation failed", messages);
  }

  // ── Mongoose duplicate key (unique index violation) ───────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new ApiError(409, `${field} '${value}' already exists`);
  }

  // ── JWT errors (safety net) ────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid access token");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Access token has expired");
  }

  // ── Final response ────────────────────────────────────────────────────────
  const statusCode = error.statusCode || 500;
  const message    = error.message    || "Internal Server Error";
  const errors     = error.errors     || [];

  // Never expose stack traces in production
  const stack = process.env.NODE_ENV === "development" ? error.stack : undefined;

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(stack && { stack }),
  });
};

export default errorHandler;

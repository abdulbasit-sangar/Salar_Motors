import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import Admin from "./models/admin.model.js";

const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Manager/Sub-Admin RBAC — one-time, idempotent, backward-compatible migration.
//
// Before this feature, Admin.role could only ever be "admin" (the schema's
// old default). The new role enum is ["superadmin", "manager"], so any
// legacy "admin" record is safely promoted to "superadmin" — this is the
// existing main admin, so it must keep full access. Running this on every
// boot is safe: once no "admin"-role documents remain, it's a no-op.
// No data is deleted, no passwords are touched, no new accounts are created.
// ─────────────────────────────────────────────────────────────────────────────
const migrateLegacyAdminRole = async () => {
  const result = await Admin.updateMany(
    { role: "admin" },
    { $set: { role: "superadmin" } },
  );
  if (result.modifiedCount > 0) {
    console.log(
      `✅ Migrated ${result.modifiedCount} legacy admin(s) to role "superadmin"`,
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 22 — PRODUCTION SERVER BOOT
//
// Pattern: connect DB first → if it fails, exit immediately.
// Never start accepting HTTP requests with a broken DB connection.
// ─────────────────────────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    await connectDB();
    await migrateLegacyAdminRole();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 URL         : http://localhost:${PORT}\n`);
    });

    // ── Graceful shutdown ──────────────────────────────────────────────────
    // On SIGTERM (e.g. Render/Railway stopping the dyno), finish in-flight
    // requests before closing. Prevents broken responses mid-request.
    const shutdown = (signal) => {
      console.log(`\n🛑 ${signal} received — shutting down gracefully...`);
      server.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        console.error("⚠️  Forced exit after 10s timeout.");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C in dev

    // ── Unhandled promise rejections ───────────────────────────────────────
    // Catches any async error that wasn't caught by asyncHandler.
    // Logs it and exits — better to restart clean than run in a broken state.
    process.on("unhandledRejection", (reason) => {
      console.error("❌ Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

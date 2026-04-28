import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";

// Routes
import authRoutes      from "./routes/auth";
import itemRoutes      from "./routes/items";
import customerRoutes  from "./routes/customers";
import quotationRoutes from "./routes/quotations";
import receiptRoutes   from "./routes/receipts";

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// ── Health check ─────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Route registration ──────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/items",      itemRoutes);
app.use("/api/customers",  customerRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/receipts",   receiptRoutes);

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "4000", 10);

AppDataSource.initialize()
  .then(() => {
    console.log("✅  Database connected (Neon PostgreSQL)");
    app.listen(PORT, () => {
      console.log(`🚀  Backend running at http://localhost:${PORT}`);
      console.log(`🏥  Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌  Database connection failed:", err);
    process.exit(1);
  });

export default app;

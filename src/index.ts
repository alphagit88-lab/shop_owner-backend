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

const allowedOrigin = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

app.use(cors({
  origin: [allowedOrigin, `${allowedOrigin}/`], // Allow both with and without slash
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Root route ──────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 50px; text-align: center;">
      <h1 style="color: #f59e0b;">💎 Gem Palace Backend</h1>
      <p>Status: <span style="color: green;">Online</span></p>
      <p>API is running. Check health at: <a href="/api/health">/api/health</a></p>
    </div>
  `);
});

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

// ── Database Initialization ─────────────────────────────────────────
const initializeDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("✅  Database connected (Neon PostgreSQL)");
    } catch (err) {
      console.error("❌  Database connection failed:", err);
    }
  }
};

// ── Startup Logic ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT || "4000", 10);
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  Backend running at http://localhost:${PORT}`);
    });
  });
} else {
  // On Vercel, we initialize for every request (TypeORM handles warm starts)
  app.use(async (req, res, next) => {
    await initializeDatabase();
    next();
  });
}

export default app;

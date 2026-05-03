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
import uploadRoutes    from "./routes/upload";
import { getSettings, updateSetting } from "./controllers/settingController";
import { authMiddleware } from "./middleware/authMiddleware";

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "https://shop-owner-frontend.vercel.app",
  "https://titancore-technologies-frontend.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url!.replace(/\/$/, ""));

app.use(cors({
  origin: true, // Reflects the request origin, allowing all but keeping credentials support
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin.replace(/\/$/, "")) || origin.includes("titancore-technologies"))) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  
  console.log(`${req.method} ${req.url} (Origin: ${origin})`);
  next();
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

// Ensure DB is ready (already handled in startup)
// app.use(async (_req, _res, next) => {
//   await initializeDatabase();
//   next();
// });

// ── Root route ──────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 50px; text-align: center;">
      <h1 style="color: #f59e0b;">💎 TitanCore Technologies Backend</h1>
      <p>Status: <span style="color: green;">Online</span></p>
      <p>API is running. Check health at: <a href="/api/health">/api/health</a></p>
    </div>
  `);
});

// ── Health check ─────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.2", timestamp: new Date().toISOString() });
});

// ── Route registration ──────────────────────────────────────────
// Use regex to handle trailing slashes robustly
app.get(["/api/settings", "/api/settings/"], authMiddleware, getSettings);
app.post(["/api/settings", "/api/settings/"], authMiddleware, updateSetting);

app.use("/api/auth",       authRoutes);
app.use("/api/items",      itemRoutes);
app.use("/api/customers",  customerRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/receipts",   receiptRoutes);
app.use("/api/upload",     uploadRoutes);

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Local Dev Startup ─────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT || "4000", 10);
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  Backend running at http://localhost:${PORT}`);
      console.log(`🏥  Health: http://localhost:${PORT}/api/health`);
    });
  });
}

export default app;
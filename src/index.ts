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
  "http://localhost:3001",
  "https://shop-owner-frontend.vercel.app",
  "https://titancore-technologies-frontend.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url!.trim().replace(/\/$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.trim().replace(/\/$/, "");
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.includes(normalizedOrigin) || 
                     normalizedOrigin.includes("titancore-technologies") ||
                     normalizedOrigin.endsWith(".vercel.app");
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      // Return null, false instead of Error to avoid triggering the error handler
      // which might return a response without CORS headers.
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "Accept", 
    "Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Log requests
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url} (Origin: ${req.headers.origin})`);
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

// Ensure DB is ready (crucial for Vercel/Serverless)
app.use(async (_req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    console.error("Database initialization middleware error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

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
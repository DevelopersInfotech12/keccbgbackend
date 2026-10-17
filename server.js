// MUST be the first import — loads env vars before any other file reads them.
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import caseStudyRoutes from "./routes/caseStudyRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cityParkRoutes from "./routes/cityParkRoutes.js";
import infographicRoutes from "./routes/infographicRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Allowed CORS origins (no trailing slashes!)
const allowedOrigins = [
  "http://localhost:3000",
  "https://biocbg.com",
  "https://www.biocbg.com",
  "https://cbgparkindia.com",
  "https://www.cbgparkindia.com",
  ...(process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL.replace(/\/+$/, "")]
    : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (Postman, mobile, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // reject quietly: no CORS header, no crash
    console.warn(`CORS blocked: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS FIRST — also auto-answers OPTIONS preflight
app.use(cors(corsOptions));

// Security & parsing
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Note: uploads served via Cloudinary — no local static dir needed

// Rate limiting
app.use("/api", apiLimiter);

// Health check
const healthCheck = (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() });
app.get("/", healthCheck);
app.get("/api/health", healthCheck);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/city-parks", cityParkRoutes);
app.use("/api/infographics", infographicRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/categories", categoryRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Bio CBG content backend running on http://localhost:${PORT}`);
});
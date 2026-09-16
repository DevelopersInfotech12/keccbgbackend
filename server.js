// MUST be the first import — ES module imports execute top-to-bottom before
// any other code runs, so uploadController.js's top-level cloudinary.config()
// call (triggered by importing uploadRoutes below) was reading process.env
// BEFORE dotenv.config() had populated it. That's why CLOUDINARY_* looked
// "missing" even with correct values in .env. Loading dotenv/config as the
// very first import guarantees env vars exist before any other file loads.
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
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://biocbg.com",
  "https://www.biocbg.com",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

// Security & parsing
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (Postman, mobile, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Note: uploads served via Cloudinary — no local static dir needed

// Rate limiting
app.use("/api", apiLimiter);

// Health check
const healthCheck = (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() });
app.get("/", healthCheck);
app.get("/api/health", healthCheck);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/city-parks", cityParkRoutes);
app.use("/api/infographics", infographicRoutes);
app.use("/api/upload", uploadRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Bio CBG content backend running on http://localhost:${PORT}`);
});
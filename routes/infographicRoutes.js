import express from "express";
import {
  getInfographics, getPublishedInfographics, getInfographicById,
  createInfographic, updateInfographic, toggleStatus, deleteInfographic,
} from "../controllers/infographicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────
router.get("/published", getPublishedInfographics);

// ── Protected admin routes ─────────────────────────────────
router.use(protect);

router.get("/", getInfographics);
router.get("/:id", getInfographicById);

router.post("/", createInfographic);

router.put("/:id", updateInfographic);
router.patch("/:id/status", toggleStatus);

router.delete("/:id", deleteInfographic);

export default router;

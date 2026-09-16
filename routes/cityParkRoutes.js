import express from "express";
import {
  getCityParks, getPublishedCityParks, getCityParkById,
  createCityPark, updateCityPark, deleteCityPark,
} from "../controllers/cityParkController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────
router.get("/published", getPublishedCityParks);

// ── Protected admin routes ─────────────────────────────────
router.use(protect);

router.get("/", getCityParks);
router.get("/:id", getCityParkById);

router.post("/", createCityPark);
router.put("/:id", updateCityPark);
router.delete("/:id", deleteCityPark);

export default router;

import CityPark from "../models/CityPark.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// ── GET /api/city-parks/published ─ public, always all entries ──
export const getPublishedCityParks = asyncHandler(async (req, res) => {
  const cityParks = await CityPark.find().select("city state stat order").sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: cityParks });
});

// ── GET /api/city-parks ─ list all (admin) ─────────────────
export const getCityParks = asyncHandler(async (req, res) => {
  const cityParks = await CityPark.find().sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data: cityParks });
});

// ── GET /api/city-parks/:id ─ single (admin) ───────────────
export const getCityParkById = asyncHandler(async (req, res) => {
  const cityPark = await CityPark.findById(req.params.id).lean();
  if (!cityPark) throw new AppError("City park not found", 404);
  res.json({ success: true, data: cityPark });
});

// ── POST /api/city-parks ─ create ──────────────────────────
export const createCityPark = asyncHandler(async (req, res) => {
  const cityPark = await CityPark.create(req.body);
  res.status(201).json({ success: true, data: cityPark, message: "City park added successfully" });
});

// ── PUT /api/city-parks/:id ─ update ───────────────────────
export const updateCityPark = asyncHandler(async (req, res) => {
  const cityPark = await CityPark.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!cityPark) throw new AppError("City park not found", 404);
  res.json({ success: true, data: cityPark, message: "City park updated successfully" });
});

// ── DELETE /api/city-parks/:id ─ delete ────────────────────
export const deleteCityPark = asyncHandler(async (req, res) => {
  const cityPark = await CityPark.findByIdAndDelete(req.params.id);
  if (!cityPark) throw new AppError("City park not found", 404);
  res.json({ success: true, message: "City park deleted successfully" });
});

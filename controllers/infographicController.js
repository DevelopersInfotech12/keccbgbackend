import slugify from "slugify";
import Infographic from "../models/Infographic.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const makeSlug = (title) => slugify(title, { lower: true, strict: true, trim: true });

// ── GET /api/infographics ─ list all (admin) ───────────────
export const getInfographics = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const { status, category, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: "i" };

  const [infographics, total] = await Promise.all([
    Infographic.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Infographic.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: infographics,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ── GET /api/infographics/published ─ public listing ───────
export const getPublishedInfographics = asyncHandler(async (req, res) => {
  const filter = { status: "published" };
  if (req.query.category) filter.category = req.query.category;

  const infographics = await Infographic.find(filter)
    .select("slug title category date img")
    .sort({ order: 1, createdAt: -1 })
    .lean();

  res.json({ success: true, data: infographics });
});

// ── GET /api/infographics/:id ─ single (admin, by id or slug) ──
export const getInfographicById = asyncHandler(async (req, res) => {
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const infographic = await Infographic.findOne(query).lean();
  if (!infographic) throw new AppError("Infographic not found", 404);

  res.json({ success: true, data: infographic });
});

// ── POST /api/infographics ─ create ─────────────────────────
export const createInfographic = asyncHandler(async (req, res) => {
  const body = req.body;

  if (!body.slug && body.title) body.slug = makeSlug(body.title);
  const existing = await Infographic.findOne({ slug: body.slug });
  if (existing) body.slug = `${body.slug}-${Date.now()}`;

  const infographic = await Infographic.create(body);
  res.status(201).json({ success: true, data: infographic, message: "Infographic created successfully" });
});

// ── PUT /api/infographics/:id ─ update ──────────────────────
export const updateInfographic = asyncHandler(async (req, res) => {
  const body = req.body;

  if (body.regenerateSlug && body.title) {
    const newSlug = makeSlug(body.title);
    const conflict = await Infographic.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
    body.slug = conflict ? `${newSlug}-${Date.now()}` : newSlug;
    delete body.regenerateSlug;
  }

  const infographic = await Infographic.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!infographic) throw new AppError("Infographic not found", 404);

  res.json({ success: true, data: infographic, message: "Infographic updated successfully" });
});

// ── PATCH /api/infographics/:id/status ─ toggle publish/draft ──
export const toggleStatus = asyncHandler(async (req, res) => {
  const infographic = await Infographic.findById(req.params.id);
  if (!infographic) throw new AppError("Infographic not found", 404);

  infographic.status = infographic.status === "published" ? "draft" : "published";
  await infographic.save();

  res.json({
    success: true,
    data: { status: infographic.status },
    message: `Infographic ${infographic.status === "published" ? "published" : "moved to draft"}`,
  });
});

// ── DELETE /api/infographics/:id ─ delete ───────────────────
export const deleteInfographic = asyncHandler(async (req, res) => {
  const infographic = await Infographic.findByIdAndDelete(req.params.id);
  if (!infographic) throw new AppError("Infographic not found", 404);

  res.json({ success: true, message: "Infographic deleted successfully" });
});

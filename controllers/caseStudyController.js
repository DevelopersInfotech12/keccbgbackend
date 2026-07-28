import slugify from "slugify";
import CaseStudy from "../models/CaseStudy.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// ── Helpers ──────────────────────────────────────────────────
const makeSlug = (title) =>
  slugify(title, { lower: true, strict: true, trim: true });

const buildQuery = (queryParams) => {
  const { status, sector, featured, search } = queryParams;
  const filter = {};
  if (status) filter.status = status;
  if (sector) filter.sector = sector;
  if (featured !== undefined) filter.featured = featured === "true";
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { excerpt: { $regex: search, $options: "i" } },
    { client: { $regex: search, $options: "i" } },
    { tags: { $in: [new RegExp(search, "i")] } },
  ];
  return filter;
};

// ── GET /api/case-studies ─ list all (admin)
export const getCaseStudies = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  const filter = buildQuery(req.query);

  const [items, total] = await Promise.all([
    CaseStudy.find(filter)
      .select("slug title sector client location date status featured readTime views createdAt updatedAt img heroImg excerpt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CaseStudy.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ── GET /api/case-studies/published ─ public listing
export const getPublishedCaseStudies = asyncHandler(async (req, res) => {
  const items = await CaseStudy.find({ status: "published" })
    .select("slug title sector client location capacity date featured readTime img excerpt heroImg heroGradient tags highlights results related")
    .sort({ featured: -1, createdAt: -1 })
    .lean();

  res.json({ success: true, data: items });
});

// ── GET /api/case-studies/public/all-slugs ─ every published slug (SSG)
export const getAllSlugs = asyncHandler(async (req, res) => {
  const items = await CaseStudy.find({ status: "published" }).select("slug").lean();
  res.json({ success: true, slugs: items.map((c) => c.slug) });
});

// ── GET /api/case-studies/stats ─ dashboard stats
export const getCaseStudyStats = asyncHandler(async (req, res) => {
  const [total, published, drafts, featured, bySector] = await Promise.all([
    CaseStudy.countDocuments(),
    CaseStudy.countDocuments({ status: "published" }),
    CaseStudy.countDocuments({ status: "draft" }),
    CaseStudy.countDocuments({ featured: true }),
    CaseStudy.aggregate([{ $group: { _id: "$sector", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);

  res.json({ success: true, data: { total, published, drafts, featured, bySector } });
});

// ── GET /api/case-studies/:id ─ single (admin, by id or slug)
export const getCaseStudyById = asyncHandler(async (req, res) => {
  const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: req.params.id }
    : { slug: req.params.id };

  const item = await CaseStudy.findOne(query).lean();
  if (!item) throw new AppError("Case study not found", 404);

  res.json({ success: true, data: item });
});

// ── GET /api/case-studies/public/:slug ─ public detail + increment view
export const getCaseStudyBySlug = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findOneAndUpdate(
    { slug: req.params.slug, status: "published" },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();

  if (!item) throw new AppError("Case study not found", 404);
  res.json({ success: true, data: item });
});

// ── POST /api/case-studies ─ create
export const createCaseStudy = asyncHandler(async (req, res) => {
  const body = req.body;

  if (!body.slug && body.title) {
    body.slug = makeSlug(body.title);
  }

  const existing = await CaseStudy.findOne({ slug: body.slug });
  if (existing) {
    body.slug = `${body.slug}-${Date.now()}`;
  }

  if (body.seo) {
    if (!body.seo.metaTitle) body.seo.metaTitle = body.title;
    if (!body.seo.metaDescription) body.seo.metaDescription = body.excerpt?.substring(0, 160);
    if (!body.seo.ogTitle) body.seo.ogTitle = body.title;
    if (!body.seo.ogDescription) body.seo.ogDescription = body.excerpt?.substring(0, 200);
    if (!body.seo.ogImage) body.seo.ogImage = body.img;
  }

  const item = await CaseStudy.create(body);

  res.status(201).json({ success: true, data: item, message: "Case study created successfully" });
});

// ── PUT /api/case-studies/:id ─ update
export const updateCaseStudy = asyncHandler(async (req, res) => {
  const body = req.body;

  if (body.regenerateSlug && body.title) {
    const newSlug = makeSlug(body.title);
    const conflict = await CaseStudy.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
    body.slug = conflict ? `${newSlug}-${Date.now()}` : newSlug;
    delete body.regenerateSlug;
  }

  const item = await CaseStudy.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  if (!item) throw new AppError("Case study not found", 404);

  res.json({ success: true, data: item, message: "Case study updated successfully" });
});

// ── PATCH /api/case-studies/:id/status ─ toggle publish/draft
export const toggleStatus = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findById(req.params.id);
  if (!item) throw new AppError("Case study not found", 404);

  item.status = item.status === "published" ? "draft" : "published";
  await item.save();

  res.json({
    success: true,
    data: { status: item.status },
    message: `Case study ${item.status === "published" ? "published" : "moved to draft"}`,
  });
});

// ── PATCH /api/case-studies/:id/featured ─ toggle featured (homepage slot)
export const toggleFeatured = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findById(req.params.id);
  if (!item) throw new AppError("Case study not found", 404);

  // Only one featured at a time — it's the one shown on the homepage
  if (!item.featured) {
    await CaseStudy.updateMany({ featured: true }, { featured: false });
  }
  item.featured = !item.featured;
  await item.save();

  res.json({ success: true, data: { featured: item.featured }, message: "Featured status updated" });
});

// ── DELETE /api/case-studies/:id ─ delete
export const deleteCaseStudy = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError("Case study not found", 404);

  res.json({ success: true, message: "Case study deleted successfully" });
});

// ── POST /api/case-studies/bulk ─ bulk actions
export const bulkAction = asyncHandler(async (req, res) => {
  const { action, ids } = req.body;
  if (!ids?.length) throw new AppError("No case study IDs provided", 400);

  let result;
  switch (action) {
    case "publish":
      result = await CaseStudy.updateMany({ _id: { $in: ids } }, { status: "published" });
      break;
    case "draft":
      result = await CaseStudy.updateMany({ _id: { $in: ids } }, { status: "draft" });
      break;
    case "delete":
      result = await CaseStudy.deleteMany({ _id: { $in: ids } });
      break;
    default:
      throw new AppError("Invalid bulk action", 400);
  }

  res.json({ success: true, message: `Bulk ${action} completed`, affected: result.modifiedCount || result.deletedCount });
});

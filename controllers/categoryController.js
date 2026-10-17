import Category from "../models/Category.js";
import Blog from "../models/Blog.js";
import Infographic from "../models/Infographic.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const TYPES = ["blog", "infographic"];

// Colour pairs handed out to newly added categories (cycled).
const PALETTE = [
  { bg: "#EAF6EF", text: "#124B2F" },
  { bg: "#FEF3EF", text: "#7E3629" },
  { bg: "#D2EBDD", text: "#1A6A42" },
  { bg: "#F7EFEB", text: "#1C2C24" },
  { bg: "#EAF6EF", text: "#218452" },
  { bg: "#FBE0D8", text: "#B44E3D" },
  { bg: "#E6F0F5", text: "#02303D" },
  { bg: "#FFF1E0", text: "#9A4B12" },
];

const DEFAULTS = {
  blog: ["CBG Basics", "Policy & Incentives", "Feedstock", "Plant Operations", "Sustainability", "Industry News"],
  infographic: ["CBG Basics", "Feedstock", "Policy & Incentives", "Plant Operations", "Sustainability"],
};

const normalizeType = (t) => {
  if (!TYPES.includes(t)) throw new AppError(`type must be one of: ${TYPES.join(", ")}`, 400);
  return t;
};

// First-ever request: fill the (empty) collection with the previous
// hard-coded lists + anything already used by existing blogs/infographics.
// Only runs while the whole collection is empty, so categories an admin
// deleted are never resurrected afterwards.
let seeded = false;
const seedIfEmpty = async () => {
  if (seeded) return;
  if ((await Category.estimatedDocumentCount()) > 0) { seeded = true; return; }

  const [usedTags, usedInfo] = await Promise.all([
    Blog.distinct("tag"),
    Infographic.distinct("category"),
  ]);
  const lists = {
    blog: [...new Set([...DEFAULTS.blog, ...usedTags.filter(Boolean)])],
    infographic: [...new Set([...DEFAULTS.infographic, ...usedInfo.filter(Boolean)])],
  };

  const docs = [];
  for (const type of TYPES) {
    lists[type].forEach((name, i) => docs.push({ type, name, order: i, color: PALETTE[i % PALETTE.length] }));
  }
  try { await Category.insertMany(docs, { ordered: false }); } catch { /* concurrent seed — ignore */ }
  seeded = true;
};

// ── GET /api/categories?type=blog|infographic ─ public list ──
export const getCategories = asyncHandler(async (req, res) => {
  await seedIfEmpty();

  const filter = {};
  if (req.query.type) filter.type = normalizeType(req.query.type);

  const cats = await Category.find(filter).sort({ order: 1, createdAt: 1 }).lean();

  // Usage count so the admin UI can warn before deleting a category in use.
  const [blogCounts, infoCounts] = await Promise.all([
    Blog.aggregate([{ $group: { _id: "$tag", n: { $sum: 1 } } }]),
    Infographic.aggregate([{ $group: { _id: "$category", n: { $sum: 1 } } }]),
  ]);
  const used = {
    blog: Object.fromEntries(blogCounts.map((c) => [c._id, c.n])),
    infographic: Object.fromEntries(infoCounts.map((c) => [c._id, c.n])),
  };

  res.json({
    success: true,
    data: cats.map((c) => ({ ...c, inUse: used[c.type]?.[c.name] || 0 })),
  });
});

// ── POST /api/categories ─ add (admin) ───────────────────────
export const createCategory = asyncHandler(async (req, res) => {
  await seedIfEmpty();

  const type = normalizeType(req.body.type);
  const name = String(req.body.name || "").replace(/\s+/g, " ").trim();
  if (!name) throw new AppError("Category name is required", 400);
  if (name.length > 40) throw new AppError("Category name must be 40 characters or fewer", 400);

  const dup = await Category.findOne({ type, name }).collation({ locale: "en", strength: 2 });
  if (dup) throw new AppError(`"${dup.name}" already exists`, 409);

  const count = await Category.countDocuments({ type });
  const cat = await Category.create({
    type,
    name,
    order: count,
    color: req.body.color?.bg && req.body.color?.text ? req.body.color : PALETTE[count % PALETTE.length],
  });

  res.status(201).json({ success: true, data: cat, message: "Category added" });
});

// ── DELETE /api/categories/:id ─ remove (admin) ──────────────
// Existing blogs / infographics keep their stored text value.
export const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw new AppError("Category not found", 404);
  res.json({ success: true, message: "Category deleted" });
});

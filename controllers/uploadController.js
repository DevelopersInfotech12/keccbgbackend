import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

// Configure Cloudinary (reads CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET from env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, folder = "biocbg-content") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(new AppError("Cloudinary upload failed: " + error.message, 500));
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// POST /api/upload/image
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new AppError("Image upload isn't configured yet — set CLOUDINARY_* in backend/.env, or paste an image URL directly.", 500);
  }

  const result = await uploadToCloudinary(req.file.buffer);

  res.json({
    success:      true,
    url:          result.secure_url,       // permanent Cloudinary URL
    filename:     result.public_id,
    originalname: req.file.originalname,
    size:         req.file.size,
  });
});

// DELETE /api/upload/:filename  (public_id may contain slashes — send encoded)
export const deleteImage = asyncHandler(async (req, res) => {
  const publicId = decodeURIComponent(req.params.filename);
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok") throw new AppError("File not found or already deleted", 404);
  res.json({ success: true, message: "File deleted" });
});

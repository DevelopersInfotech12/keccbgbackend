// backend/debugAdmin.js — one-off diagnostic, delete after use
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

(async () => {
  await connectDB();

  console.log("ENV email:", JSON.stringify(process.env.ADMIN_EMAIL));
  console.log("ENV password:", JSON.stringify(process.env.ADMIN_PASSWORD));

  const admin = await Admin.findOne({}).select("+password");
  if (!admin) { console.log("No admin in DB at all."); process.exit(0); }

  console.log("DB email:", JSON.stringify(admin.email));
  console.log("DB isActive:", admin.isActive);

  const matches = await admin.matchPassword(process.env.ADMIN_PASSWORD);
  console.log("Does ENV password match DB hash?", matches);

  process.exit(0);
})();
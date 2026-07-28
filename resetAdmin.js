// backend/resetAdmin.js — one-off: deletes existing admin, then run /api/auth/seed again
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

(async () => {
  await connectDB();
  const result = await Admin.deleteMany({});
  console.log(`Deleted ${result.deletedCount} admin(s).`);
  process.exit(0);
})();
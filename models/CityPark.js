import mongoose from "mongoose";

// ── CityPark schema ──────────────────────────────────────────
// Backs the scrolling "city network" cards on the Home hero
// (frontend/src/comp/HomeMain.jsx, CITY_PARKS constant). Lets admins
// add/edit/remove/reorder park locations without touching code.
const cityParkSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    // Free-text stat line shown under the city, e.g. "3 Plants"
    stat: { type: String, required: true, trim: true },
    // Lower number = shown first in the card strip.
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cityParkSchema.index({ order: 1 });

export default mongoose.model("CityPark", cityParkSchema);

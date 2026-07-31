const mongoose = require("mongoose");
const Listing = require("../models/listing");
const axios = require("axios");

// 🔗 DB connection
mongoose.connect("mongodb://127.0.0.1:27017/bookMystay");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("✅ Database connected");
});

// 🌍 Geocoding function (OpenStreetMap)
async function geocodeLocation(location, country) {
  try {
    const query = `${location}, ${country}`;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "bookMystay/1.0",
        },
      },
    );

    if (response.data.length === 0) return null;

    return {
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon),
    };
  } catch (err) {
    console.error("❌ Geocoding error:", err.message);
    return null;
  }
}

// 🚀 Backfill logic
async function backfillGeometry() {
  // 1️⃣ Find listings without geometry
  const listings = await Listing.find({
    $or: [{ geometry: { $exists: false } }, { geometry: null }],
  });

  console.log(`🔍 Found ${listings.length} listings without geometry`);

  for (let listing of listings) {
    const coords = await geocodeLocation(listing.location, listing.country);

    if (!coords) {
      console.log(`⚠️ Skipped: ${listing.title}`);
      continue;
    }

    // 2️⃣ Save geometry
    listing.geometry = {
      type: "Point",
      coordinates: [coords.lng, coords.lat], // GeoJSON
    };

    await listing.save();
    console.log(`📍 Updated: ${listing.title}`);
  }

  console.log("🎉 Backfill completed");
  mongoose.connection.close();
}

// ▶ Run
backfillGeometry();

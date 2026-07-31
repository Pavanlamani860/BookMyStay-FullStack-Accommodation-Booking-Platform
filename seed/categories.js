const mongoose = require("mongoose");
const Category = require("../models/category");

// 🔗 DB Connection
mongoose.connect("mongodb://127.0.0.1:27017/bookMystay");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("✅ Database connected (Category Seed)");
});

const categories = [
  { name: "Trending", slug: "trending" },
  { name: "Farm", slug: "farm" },
  { name: "Iconic Cities", slug: "iconic-cities" },
  { name: "Mountain", slug: "mountain" },
  { name: "Amazing Pools", slug: "amazing-pools" },
  { name: "Camping", slug: "camping" },
  { name: "Hotel", slug: "hotel" },
  { name: "Resort", slug: "resort" },
  { name: "Villa", slug: "villa" },
  { name: "Arctic", slug: "arctic" },
  { name: "Surfing", slug: "surfing" },
];

const seedCategories = async () => {
  // Clear existing categories (safe at this stage)
  await Category.deleteMany({});

  await Category.insertMany(categories);
  console.log("🌱 Categories seeded successfully");
};

// ▶ Run Seeder
seedCategories()
  .then(() => mongoose.connection.close())
  .catch((err) => console.log(err));

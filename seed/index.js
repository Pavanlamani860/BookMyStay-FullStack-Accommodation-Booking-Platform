const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");

// 🔗 DB Connection
mongoose.connect("mongodb://127.0.0.1:27017/bookMystay");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("✅ Database connected");
});

const sampleListings = [
  {
    title: "Cozy Beachfront Cottage",
    description:
      "Escape to this charming beachfront cottage for a relaxing getaway with beautiful ocean views.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b",
    },
    price: 1500,
    location: "Goa",
    country: "India",
    category: "Villa",
    amenities: ["WiFi", "Beach View", "Parking", "AC"],
  },
  {
    title: "Modern Loft in City Center",
    description:
      "Stylish modern loft located in the heart of the city, ideal for professionals and travelers.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    },
    price: 2200,
    location: "Bangalore",
    country: "India",
    category: "Apartment",
    amenities: ["WiFi", "Lift", "Kitchen", "Power Backup"],
  },
  {
    title: "Mountain Retreat Cabin",
    description:
      "Unplug and relax in this peaceful mountain retreat surrounded by nature and fresh air.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
    },
    price: 1800,
    location: "Manali",
    country: "India",
    category: "Homestay",
    amenities: ["WiFi", "Heating", "Mountain View"],
  },
  {
    title: "Heritage Villa Stay",
    description:
      "Experience royal living in this beautifully restored heritage villa with traditional architecture.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    },
    price: 3500,
    location: "Jaipur",
    country: "India",
    category: "Hotel",
    amenities: ["WiFi", "Breakfast", "Parking", "Heritage Property"],
  },
  {
    title: "Treehouse Nature Escape",
    description:
      "Stay among the treetops in this unique treehouse escape, perfect for nature lovers.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    },
    price: 1400,
    location: "Wayanad",
    country: "India",
    category: "Homestay",
    amenities: ["WiFi", "Forest View", "Breakfast"],
  },
  {
    title: "Luxury Sea View Resort",
    description:
      "Premium seaside resort offering breathtaking views, modern amenities, and a peaceful environment.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d6",
    },
    price: 5200,
    location: "Kovalam",
    country: "India",
    category: "Resort",
    amenities: ["WiFi", "Private Beach", "Swimming Pool", "Sea View", "Spa"],
  },
  {
    title: "Minimalist Studio Apartment",
    description:
      "A clean and minimalist studio apartment perfect for solo travelers and remote workers.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    },
    price: 2000,
    location: "Pune",
    country: "India",
    category: "Apartment",
    amenities: ["WiFi", "Kitchen", "Work Desk", "Lift"],
  },
  {
    title: "Hilltop Wooden Cottage",
    description:
      "Beautiful wooden cottage located on a hilltop with panoramic valley views.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    },
    price: 2600,
    location: "Ooty",
    country: "India",
    category: "Homestay",
    amenities: ["WiFi", "Fireplace", "Valley View", "Parking"],
  },
  {
    title: "Backwater Riverside Homestay",
    description:
      "Relax by the calm backwaters and experience authentic Kerala hospitality.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    },
    price: 2900,
    location: "Alappuzha",
    country: "India",
    category: "Homestay",
    amenities: ["WiFi", "Water View", "Breakfast", "Boat Access"],
  },
  {
    title: "Desert Camp Experience",
    description:
      "Unique desert stay with luxury tents, cultural programs, and stargazing nights.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    },
    price: 3300,
    location: "Jaisalmer",
    country: "India",
    category: "Villa",
    amenities: ["WiFi", "Cultural Shows", "Breakfast", "Campfire"],
  },
  {
    title: "Urban Business Hotel",
    description:
      "Comfortable hotel designed for business travelers with easy city access.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1560347876-aeef00ee58a1",
    },
    price: 3100,
    location: "Gurgaon",
    country: "India",
    category: "Hotel",
    amenities: ["WiFi", "Conference Room", "Gym", "Parking"],
  },
  {
    title: "Forest Eco apartment",
    description:
      "Eco-friendly lodge surrounded by dense forest, ideal for wildlife lovers.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    },
    price: 2700,
    location: "Coorg",
    country: "India",
    category: "Apartment",
    amenities: ["WiFi", "Forest View", "Organic Food", "Nature Trails"],
  },
  {
    title: "Premium City Penthouse",
    description:
      "High-end penthouse with skyline views, luxury interiors, and modern comforts.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    },
    price: 6000,
    location: "Mumbai",
    country: "India",
    category: "Apartment",
    amenities: ["WiFi", "City View", "Private Terrace", "AC", "Lift"],
  },
];
const seedDB = async () => {
  // Optional: clear existing listings
  await Listing.deleteMany({});

  // Get one existing user as owner
  const owner = await User.findOne();

  if (!owner) {
    console.log("❌ No user found. Please register a user first.");
    return;
  }

  // Attach owner to each listing
  const listingsWithOwner = sampleListings.map((listing) => ({
    ...listing,
    owner: owner._id,
  }));

  await Listing.insertMany(listingsWithOwner);
  console.log("🌱 Listings seeded successfully");
};

// ▶ Run Seeder
seedDB()
  .then(() => mongoose.connection.close())
  .catch((err) => console.log(err));

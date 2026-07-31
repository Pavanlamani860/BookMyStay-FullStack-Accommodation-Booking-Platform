const Listing = require("../models/listing.js");
const Category = require("../models/category.js");
const { geocodeLocation } = require("../utils/geocode.js");
const ExpressErrors = require("../utils/expressError.js");

module.exports.index = async (req, res) => {
  const { location, category } = req.query;

  let filter = {};
  // Location search: city OR country
  if (location) {
    filter.$or = [
      { location: { $regex: location, $options: "i" } },
      { country: { $regex: location, $options: "i" } },
    ];
  }
  // Category filter
  if (category) {
    filter.category = category;
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", {
    allListings,
    location,
    category,
  });
};

module.exports.renderNewForm = async (req, res) => {
  const categories = await Category.find({});
  res.render("listings/new.ejs", { categories });
};

module.exports.createListing = async (req, res) => {
  // 1.Convert amenities string → array
  if (typeof req.body.listing.amenities === "string") {
    req.body.listing.amenities = req.body.listing.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  }

  // 2.Geocode location
  const coords = await geocodeLocation(
    req.body.listing.location,
    req.body.listing.country,
  );

  const newListing = new Listing(req.body.listing);

  //3. Save geometry if geocoding succeeded
  if (coords) {
    newListing.geometry = {
      type: "Point",
      coordinates: [coords.lng, coords.lat],
    };
  }
  // Cloudinary Image and owner
  const url = req.file.path;
  const filename = req.file.filename;
  newListing.image = { url, filename };
  newListing.owner = req.user._id;

  await newListing.save();
  req.flash("success", "New listing Created!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const list = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!list) {
    throw new ExpressErrors(404, "Listing not found");
  }

  res.render("listings/show.ejs", { list });
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  const categories = await Category.find({});

  if (!listing) {
    throw new ExpressErrors(404, "Listing not found");
  }

  res.render("listings/edit.ejs", { listing, categories });
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Succesfully!");
  res.redirect("/listings");
};

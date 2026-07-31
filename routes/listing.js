const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressErrors = require("../utils/expressError.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listing.js");

//index route
router
  .get("/", wrapAsync(listingController.index))
  .post(
    "/",
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing),
  );

//add listing form route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.post("/", wrapAsync(listingController.createListing));

//show route (showing details of individual list)
router.get("/:id", wrapAsync(listingController.showListing));

//this edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

router.put(
  "/:id",
  upload.single("listing[image]"),
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    // 1️. Convert amenities string → array
    if (typeof req.body.listing.amenities === "string") {
      req.body.listing.amenities = req.body.listing.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
    // 2️. Update listing basic fields
    const listing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true },
    );

    // 3️. If a new image is uploaded, update image
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
  }),
);

//route for deleting listings
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteListing),
);

module.exports = router;

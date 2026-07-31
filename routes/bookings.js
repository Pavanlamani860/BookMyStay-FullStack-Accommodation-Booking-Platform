const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// =====================================================
// CREATE BOOKING  → redirect to payment page
// =====================================================
router.post(
  "/listings/:id/book",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    // find listing
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // get form data
    const { checkIn, checkOut, guests } = req.body;

    // calculate nights
    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

    // simple validation
    if (nights <= 0) {
      req.flash("error", "Invalid booking dates");
      return res.redirect(`/listings/${id}`);
    }

    // calculate total price
    const totalPrice = nights * listing.price;

    // create booking
    const booking = new Booking({
      listing: listing._id,
      user: req.user._id,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: "pending", // important for payment flow
    });

    await booking.save();

    req.flash("success", "Booking created! Proceed to payment.");

    // redirect to payment page
    res.redirect(`/bookings/${booking._id}/payment`);
  }),
);

// =====================================================
// PAYMENT PAGE (Booking Summary)
// =====================================================
router.get(
  "/bookings/:id/payment",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("listing")
      .populate("user");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/listings");
    }

    res.render("bookings/payment.ejs", { booking });
  }),
);

module.exports = router;

const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const wrapAsync = require("../utils/wrapAsync");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    //Creating a razorpay order

    const amount = Math.round(totalPrice * 100);
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);
    booking.razorpayOrderId = order.id;
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

    if (!booking.user.equals(req.user._id)) {
      req.flash("error", "You are not authorized");
      return res.redirect("/listings");
    }

    res.render("bookings/payment.ejs", { booking });
  }),
);

// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================
router.post(
  "/bookings/:id/verify-payment",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // Find booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Make sure booking belongs to logged-in user
    if (!booking.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Make sure the order belongs to this booking
    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order",
      });
    }

    // Create signature using OUR stored order ID
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(booking.razorpayOrderId + "|" + razorpay_payment_id)
      .digest("hex");

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      booking.paymentStatus = "failed";
      await booking.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Signature is valid
    booking.paymentStatus = "paid";
    booking.status = "confirmed";

    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    await booking.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  }),
);

// =====================================================
// BOOKING SUCCESS PAGE
// =====================================================
router.get(
  "/bookings/:id/success",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/listings");
    }

    // Make sure the booking belongs to logged-in user
    if (!booking.user.equals(req.user._id)) {
      req.flash("error", "You are not authorized");
      return res.redirect("/listings");
    }

    // Only show success page for paid bookings
    if (booking.paymentStatus !== "paid") {
      req.flash("error", "Payment has not been completed.");
      return res.redirect(`/bookings/${booking._id}/payment`);
    }

    res.render("bookings/success.ejs", { booking });
  }),
);

module.exports = router;

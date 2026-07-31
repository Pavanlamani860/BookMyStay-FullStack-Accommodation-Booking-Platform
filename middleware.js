//thisis middleware where it checks whether the user is logged in or not before doing an action
//in web application.

const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressErrors = require("./utils/expressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

//middleware to check the currUser is owner or not to edit,delete the listings
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this Listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You did not create this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
